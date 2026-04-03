<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { dndzone } from 'svelte-dnd-action';
    import {
        fetchWithBaseUrl,
        patchWithBaseUrl,
        postWithBaseUrl,
        deleteWithBaseUrl,
    } from '$lib/api';
    import { hasPerm } from '$lib/stores/user';
    import FormField from '$lib/components/forms/FormField.svelte';
    import FlexDateInput from '$lib/components/forms/FlexDateInput.svelte';
    import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';
    import SlideOver from '$lib/components/hub/SlideOver.svelte';
    import ConfirmDelete from '$lib/components/hub/ConfirmDelete.svelte';

    // ── route ─────────────────────────────────────────────────────────────────
    $: docId = $page.params.id;

    // ── documento metadata ────────────────────────────────────────────────────
    let doc = null;
    let metaForm = {};
    let metaSaving = false;
    let metaErrors = {};
    let metaDirty = false;

    // ── relations state ───────────────────────────────────────────────────────
    let lugarRels = [];          // PersonaLugarRel[] — swimlane source
    let personaRels = [];        // PersonaRelaciones[]

    // ── swimlane (trajectory) ─────────────────────────────────────────────────
    // ordinal semantics: negatives = "before", positives = "after", mid bucket = ±0.5 range
    // ui: three lanes keyed by phase
    let lanes = {
        before: { label: 'Antes', items: [] },
        during: { label: 'Evento', items: [] },
        after:  { label: 'Después', items: [] },
    };
    let swimlaneLoading = false;

    // ── slide-over state ──────────────────────────────────────────────────────
    let slideOpen = false;
    let slideTitle = '';
    let activePanel = null;  // 'lugar-rel' | 'persona-rel'

    let newLugarRel = { lugar: null, situacion_lugar: null, personas: [], fecha_inicial_lugar_raw: '', notas: '' };
    let newPersonaRel = { personas: [], naturaleza_relacion: 'fam', descripcion_relacion: '' };
    let slideErrors = {};
    let slideSaving = false;

    // ── delete confirm ────────────────────────────────────────────────────────
    let deleteOpen = false;
    let deleteTarget = null;   // { endpoint, label }
    let deleteLoading = false;

    // ── loading ───────────────────────────────────────────────────────────────
    let pageLoading = true;
    let pageError = null;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    function buildMetaForm(d) {
        return {
            titulo: d.titulo ?? '',
            descripcion: d.descripcion ?? '',
            fondo: d.fondo ?? '',
            subfondo: d.subfondo ?? '',
            serie: d.serie ?? '',
            subserie: d.subserie ?? '',
            tipo_udc: d.tipo_udc ?? 'lib',
            unidad_documental_compuesta: d.unidad_documental_compuesta ?? '',
            sigla_documento: d.sigla_documento ?? '',
            deteriorado: d.deteriorado ?? false,
            fecha_inicial: d.fecha_inicial_raw ?? '',
            fecha_final: d.fecha_final_raw ?? '',
            folio_inicial: d.folio_inicial ?? '',
            folio_final: d.folio_final ?? '',
            notas: d.notas ?? '',
            archivo: d.archivo?.archivo_id ?? null,
            tipo_documento: null,  // set below
            lugar_de_produccion: d.lugar_de_produccion?.lugar_id ?? null,
        };
    }

    function phaseOf(ordinal) {
        if (ordinal < 0) return 'before';
        if (ordinal > 0) return 'after';
        return 'during';
    }

    function distributeLanes(rels) {
        lanes.before.items = [];
        lanes.during.items = [];
        lanes.after.items  = [];
        for (const r of rels) {
            const phase = phaseOf(r.ordinal);
            lanes[phase].items.push({ ...r, id: r.persona_x_lugares });
        }
        lanes.before.items.sort((a, b) => a.ordinal - b.ordinal);
        lanes.during.items.sort((a, b) => a.ordinal - b.ordinal);
        lanes.after.items.sort((a, b) => a.ordinal - b.ordinal);
        // Trigger reactivity
        lanes = { ...lanes };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Data loading
    // ─────────────────────────────────────────────────────────────────────────

    async function loadAll() {
        pageLoading = true;
        pageError = null;
        try {
            const [docData, relLugares, relPersonas] = await Promise.all([
                fetchWithBaseUrl(`documentos/${docId}/`),
                fetchWithBaseUrl(`relaciones-lugares/?documento__documento_id=${docId}&page_size=100`),
                fetchWithBaseUrl(`relaciones-personas/?documento__documento_id=${docId}&page_size=100`),
            ]);
            doc = docData;
            metaForm = buildMetaForm(doc);
            metaDirty = false;

            lugarRels = relLugares?.results ?? relLugares ?? [];
            personaRels = relPersonas?.results ?? relPersonas ?? [];
            distributeLanes(lugarRels);
        } catch (e) {
            pageError = e?.message ?? 'Error al cargar el documento.';
        } finally {
            pageLoading = false;
        }
    }

    onMount(loadAll);

    // ─────────────────────────────────────────────────────────────────────────
    // Documento metadata save
    // ─────────────────────────────────────────────────────────────────────────

    async function saveMetadata() {
        if (!$hasPerm('dbgestor.change_documento')) return;
        metaSaving = true;
        metaErrors = {};
        try {
            doc = await patchWithBaseUrl(`documentos/${docId}/`, metaForm);
            metaDirty = false;
        } catch (e) {
            metaErrors = e?.data ?? { non_field_errors: [e?.message ?? 'Error desconocido.'] };
        } finally {
            metaSaving = false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Swimlane drag-and-drop
    // ─────────────────────────────────────────────────────────────────────────

    const ORDINAL_STEP = 10;

    function ordinalForLane(lane, index, items) {
        // Before: negative multiples, After: positive multiples, During: starts at 0
        const base = lane === 'before' ? -ORDINAL_STEP : lane === 'after' ? ORDINAL_STEP : 1;
        const sign = lane === 'before' ? -1 : 1;
        if (lane === 'during') return index + 1;
        return sign * (index + 1) * ORDINAL_STEP;
    }

    async function handleDrop(lane, e) {
        lanes[lane].items = e.detail.items;
        lanes = { ...lanes };

        // Build bulk PATCH payload
        const payload = [];
        for (const [laneKey, laneData] of Object.entries(lanes)) {
            laneData.items.forEach((item, idx) => {
                payload.push({
                    persona_x_lugares: item.persona_x_lugares,
                    ordinal: ordinalForLane(laneKey, idx, laneData.items),
                });
            });
        }
        try {
            await patchWithBaseUrl('relaciones-lugares/bulk-ordinal/', payload);
        } catch (err) {
            console.error('bulk-ordinal error', err);
        }
    }

    function handleDragConsider(lane, e) {
        lanes[lane].items = e.detail.items;
        lanes = { ...lanes };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SlideOver — crear relación lugar
    // ─────────────────────────────────────────────────────────────────────────

    function openLugarRelPanel() {
        newLugarRel = { lugar: null, situacion_lugar: null, personas: [], fecha_inicial_lugar_raw: '', notas: '' };
        slideErrors = {};
        activePanel = 'lugar-rel';
        slideTitle = 'Agregar punto de trayectoria (persona)';
        slideOpen = true;
    }

    async function saveLugarRel() {
        if (!$hasPerm('dbgestor.add_personalugarrel')) return;
        slideSaving = true;
        slideErrors = {};
        try {
            const payload = {
                documento: docId,
                lugar: newLugarRel.lugar?.value ?? null,
                situacion_lugar: newLugarRel.situacion_lugar?.value ?? null,
                personas: newLugarRel.personas.map(p => p.value),
                fecha_inicial_lugar_raw: newLugarRel.fecha_inicial_lugar_raw || null,
                ordinal: lanes.during.items.length + 1,
                notas: newLugarRel.notas || null,
            };
            const created = await postWithBaseUrl('relaciones-lugares/', payload);
            lugarRels = [...lugarRels, created];
            distributeLanes(lugarRels);
            slideOpen = false;
        } catch (e) {
            slideErrors = e?.data ?? { non_field_errors: [e?.message ?? 'Error desconocido.'] };
        } finally {
            slideSaving = false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SlideOver — crear relación persona
    // ─────────────────────────────────────────────────────────────────────────

    function openPersonaRelPanel() {
        newPersonaRel = { personas: [], naturaleza_relacion: 'fam', descripcion_relacion: '' };
        slideErrors = {};
        activePanel = 'persona-rel';
        slideTitle = 'Agregar relación entre personas';
        slideOpen = true;
    }

    async function savePersonaRel() {
        if (!$hasPerm('dbgestor.add_personarelaciones')) return;
        slideSaving = true;
        slideErrors = {};
        try {
            const payload = {
                documento: docId,
                personas: newPersonaRel.personas.map(p => p.value),
                naturaleza_relacion: newPersonaRel.naturaleza_relacion,
                descripcion_relacion: newPersonaRel.descripcion_relacion || null,
            };
            const created = await postWithBaseUrl('relaciones-personas/', payload);
            personaRels = [...personaRels, created];
            slideOpen = false;
        } catch (e) {
            slideErrors = e?.data ?? { non_field_errors: [e?.message ?? 'Error desconocido.'] };
        } finally {
            slideSaving = false;
        }
    }

    function handleSlideSubmit() {
        if (activePanel === 'lugar-rel') saveLugarRel();
        else if (activePanel === 'persona-rel') savePersonaRel();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete confirm
    // ─────────────────────────────────────────────────────────────────────────

    function confirmDelete(endpoint, label) {
        deleteTarget = { endpoint, label };
        deleteOpen = true;
    }

    async function executeDelete() {
        if (!deleteTarget) return;
        deleteLoading = true;
        try {
            await deleteWithBaseUrl(deleteTarget.endpoint);
            await loadAll();
            deleteOpen = false;
        } catch (e) {
            console.error('delete error', e);
        } finally {
            deleteLoading = false;
        }
    }
</script>

{#if pageLoading}
    <div class="container mt-5 text-center">
        <span class="spinner-border"></span>
    </div>
{:else if pageError}
    <div class="container mt-4">
        <div class="alert alert-danger">{pageError}</div>
    </div>
{:else}
<div class="container-fluid mt-3 px-4">

    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb small">
            <li class="breadcrumb-item"><a href="/User/dashboard">Dashboard</a></li>
            <li class="breadcrumb-item active">Evento #{docId}</li>
        </ol>
    </nav>

    <!-- ── Metadata section ─────────────────────────────────────────────── -->
    <div class="card mb-4">
        <div class="card-header cataloguer-section-header py-2">
            <span class="fw-semibold">Datos del evento</span>
            {#if $hasPerm('dbgestor.change_documento')}
            <button
                class="btn btn-primary btn-sm"
                disabled={metaSaving || !metaDirty}
                on:click={saveMetadata}
            >
                {#if metaSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Guardar
            </button>
            {/if}
        </div>
        <div class="card-body">
            {#if metaErrors.non_field_errors}
                <div class="alert alert-danger small py-2">{metaErrors.non_field_errors.join(' ')}</div>
            {/if}
            <div class="row g-3">
                <div class="col-md-8">
                    <FormField label="Título" error={metaErrors.titulo?.[0]}>
                        <input
                            class="form-control"
                            class:is-invalid={metaErrors.titulo}
                            bind:value={metaForm.titulo}
                            on:input={() => metaDirty = true}
                        />
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Sigla" error={metaErrors.sigla_documento?.[0]}>
                        <input
                            class="form-control"
                            bind:value={metaForm.sigla_documento}
                            on:input={() => metaDirty = true}
                        />
                    </FormField>
                </div>
                <div class="col-md-3">
                    <FormField label="Fecha inicial" error={metaErrors.fecha_inicial?.[0]}>
                        <FlexDateInput
                            bind:value={metaForm.fecha_inicial}
                            on:change={() => metaDirty = true}
                        />
                    </FormField>
                </div>
                <div class="col-md-3">
                    <FormField label="Fecha final" error={metaErrors.fecha_final?.[0]}>
                        <FlexDateInput
                            bind:value={metaForm.fecha_final}
                            on:change={() => metaDirty = true}
                        />
                    </FormField>
                </div>
                <div class="col-md-3">
                    <FormField label="Folio inicial" error={metaErrors.folio_inicial?.[0]}>
                        <input
                            class="form-control"
                            bind:value={metaForm.folio_inicial}
                            on:input={() => metaDirty = true}
                        />
                    </FormField>
                </div>
                <div class="col-md-3">
                    <FormField label="Folio final" error={metaErrors.folio_final?.[0]}>
                        <input
                            class="form-control"
                            bind:value={metaForm.folio_final}
                            on:input={() => metaDirty = true}
                        />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Tipo de documento" error={metaErrors.tipo_documento?.[0]}>
                        <SearchableSelect
                            endpoint="vocabularios/tipos-documentales/"
                            searchParam="search"
                            placeholder="Buscar tipo documental…"
                            value={doc.tipo_documento ? { value: null, label: doc.tipo_documento } : null}
                            on:change={e => { metaForm.tipo_documento = e.detail?.value ?? null; metaDirty = true; }}
                        />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Archivo" error={metaErrors.archivo?.[0]}>
                        <SearchableSelect
                            endpoint="archivos/"
                            searchParam="search"
                            placeholder="Buscar archivo…"
                            value={doc.archivo ? { value: doc.archivo.archivo_id, label: doc.archivo.nombre_archivo } : null}
                            on:change={e => { metaForm.archivo = e.detail?.value ?? null; metaDirty = true; }}
                        />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Descripción" error={metaErrors.descripcion?.[0]}>
                        <textarea
                            class="form-control"
                            rows="3"
                            bind:value={metaForm.descripcion}
                            on:input={() => metaDirty = true}
                        ></textarea>
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Fondo">
                        <input class="form-control" bind:value={metaForm.fondo} on:input={() => metaDirty = true} />
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Subfondo">
                        <input class="form-control" bind:value={metaForm.subfondo} on:input={() => metaDirty = true} />
                    </FormField>
                </div>
                <div class="col-md-4">
                    <div class="d-flex align-items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            class="form-check-input"
                            id="deteriorado"
                            bind:checked={metaForm.deteriorado}
                            on:change={() => metaDirty = true}
                        />
                        <label class="form-check-label" for="deteriorado">Deteriorado</label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ── Trayectoria swimlane ──────────────────────────────────────────── -->
    <div class="card mb-4">
        <div class="card-header cataloguer-section-header py-2">
            <span class="fw-semibold"><i class="bi bi-geo-alt me-1"></i>Trayectorias de personas</span>
            {#if $hasPerm('dbgestor.add_personalugarrel')}
            <button class="btn btn-outline-primary btn-sm" on:click={openLugarRelPanel}>
                <i class="bi bi-plus-lg me-1"></i>Agregar punto
            </button>
            {/if}
        </div>
        <div class="card-body">
            <div class="swimlane-container">
                {#each Object.entries(lanes) as [laneKey, laneData]}
                <div class="swimlane-lane">
                    <div class="swimlane-lane-title">{laneData.label}</div>
                    <div
                        use:dndzone={{ items: laneData.items, flipDurationMs: 200 }}
                        on:consider={e => handleDragConsider(laneKey, e)}
                        on:finalize={e => handleDrop(laneKey, e)}
                    >
                        {#each laneData.items as item (item.id)}
                        <div class="swimlane-card">
                            <div>
                                <div class="fw-semibold small">{item.lugar?.nombre_lugar ?? `Lugar #${item.lugar}`}</div>
                                {#if item.situacion_lugar}
                                    <span class="badge bg-light text-dark border small">{item.situacion_lugar}</span>
                                {/if}
                                {#if item.persona_ids?.length}
                                    <div class="text-muted" style="font-size:.7rem">{item.persona_ids.length} pers.</div>
                                {/if}
                            </div>
                            {#if $hasPerm('dbgestor.delete_personalugarrel')}
                            <button
                                class="btn btn-link btn-sm text-danger p-0"
                                title="Eliminar"
                                on:click={() => confirmDelete(`relaciones-lugares/${item.persona_x_lugares}/`, item.lugar?.nombre_lugar ?? 'este punto')}
                            >
                                <i class="bi bi-trash3"></i>
                            </button>
                            {/if}
                        </div>
                        {/each}
                    </div>
                </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- ── Relaciones entre personas ─────────────────────────────────────── -->
    <div class="card mb-4">
        <div class="card-header cataloguer-section-header py-2">
            <span class="fw-semibold"><i class="bi bi-people me-1"></i>Relaciones entre personas</span>
            {#if $hasPerm('dbgestor.add_personarelaciones')}
            <button class="btn btn-outline-primary btn-sm" on:click={openPersonaRelPanel}>
                <i class="bi bi-plus-lg me-1"></i>Agregar relación
            </button>
            {/if}
        </div>
        <div class="card-body">
            {#if personaRels.length === 0}
                <p class="text-muted small mb-0">Sin relaciones registradas.</p>
            {:else}
            <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Personas</th>
                            <th>Naturaleza</th>
                            <th>Descripción</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each personaRels as rel}
                        <tr>
                            <td class="small">{rel.persona_ids?.join(', ') ?? '—'}</td>
                            <td><span class="badge bg-secondary">{rel.naturaleza_relacion}</span></td>
                            <td class="small text-muted">{rel.descripcion_relacion ?? '—'}</td>
                            <td>
                                {#if $hasPerm('dbgestor.delete_personarelaciones')}
                                <button
                                    class="btn btn-link btn-sm text-danger p-0"
                                    on:click={() => confirmDelete(`relaciones-personas/${rel.persona_relacion_id}/`, 'esta relación')}
                                >
                                    <i class="bi bi-trash3"></i>
                                </button>
                                {/if}
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            {/if}
        </div>
    </div>

</div>
{/if}

<!-- ── SlideOver panel ───────────────────────────────────────────────────── -->
<SlideOver bind:open={slideOpen} title={slideTitle}>
    {#if slideErrors.non_field_errors}
        <div class="alert alert-danger small py-2">{slideErrors.non_field_errors.join(' ')}</div>
    {/if}

    {#if activePanel === 'lugar-rel'}
    <div class="d-flex flex-column gap-3">
        <FormField label="Lugar *" error={slideErrors.lugar?.[0]}>
            <SearchableSelect
                endpoint="lugares/"
                searchParam="search"
                placeholder="Buscar lugar…"
                bind:value={newLugarRel.lugar}
            />
        </FormField>
        <FormField label="Situación en el lugar" error={slideErrors.situacion_lugar?.[0]}>
            <SearchableSelect
                endpoint="vocabularios/situaciones-lugar/"
                searchParam="search"
                placeholder="Buscar situación…"
                bind:value={newLugarRel.situacion_lugar}
            />
        </FormField>
        <FormField label="Fecha (opcional)" error={slideErrors.fecha_inicial_lugar_raw?.[0]}>
            <FlexDateInput bind:value={newLugarRel.fecha_inicial_lugar_raw} />
        </FormField>
        <FormField label="Notas" error={slideErrors.notas?.[0]}>
            <textarea class="form-control" rows="2" bind:value={newLugarRel.notas}></textarea>
        </FormField>
        <div class="d-flex gap-2 justify-content-end mt-2">
            <button class="btn btn-secondary" on:click={() => slideOpen = false}>Cancelar</button>
            <button class="btn btn-primary" disabled={slideSaving} on:click={handleSlideSubmit}>
                {#if slideSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Guardar
            </button>
        </div>
    </div>

    {:else if activePanel === 'persona-rel'}
    <div class="d-flex flex-column gap-3">
        <FormField label="Naturaleza de la relación *" error={slideErrors.naturaleza_relacion?.[0]}>
            <select class="form-select" bind:value={newPersonaRel.naturaleza_relacion}>
                <option value="fam">Familiar</option>
                <option value="aso">Asociativa</option>
                <option value="tmp">Temporal</option>
            </select>
        </FormField>
        <FormField label="Descripción" error={slideErrors.descripcion_relacion?.[0]}>
            <input class="form-control" bind:value={newPersonaRel.descripcion_relacion} />
        </FormField>
        <div class="d-flex gap-2 justify-content-end mt-2">
            <button class="btn btn-secondary" on:click={() => slideOpen = false}>Cancelar</button>
            <button class="btn btn-primary" disabled={slideSaving} on:click={handleSlideSubmit}>
                {#if slideSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Guardar
            </button>
        </div>
    </div>
    {/if}
</SlideOver>

<!-- ── ConfirmDelete modal ───────────────────────────────────────────────── -->
<ConfirmDelete
    bind:open={deleteOpen}
    message={`¿Eliminar ${deleteTarget?.label ?? 'este registro'}? Esta acción no se puede deshacer.`}
    loading={deleteLoading}
    on:confirm={executeDelete}
    on:cancel={() => deleteOpen = false}
/>
