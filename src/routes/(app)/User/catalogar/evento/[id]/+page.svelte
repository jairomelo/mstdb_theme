<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { fetchWithBaseUrl, postWithBaseUrl, patchWithBaseUrl, deleteWithBaseUrl } from '$lib/api';
    import { hasPerm } from '$lib/stores/user';
    import FormField from '$lib/components/forms/FormField.svelte';
    import FlexDateInput from '$lib/components/forms/FlexDateInput.svelte';
    import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';
    import SlideOver from '$lib/components/hub/SlideOver.svelte';
    import ConfirmDelete from '$lib/components/hub/ConfirmDelete.svelte';
    import EntitySection from '$lib/components/hub/EntitySection.svelte';

    $: docId = $page.params.id;

    let pageLoading = true;
    let pageError = null;
    let doc = null;
    let peList = [];
    let pneList = [];
    let corpList = [];

    let metaForm = {};
    let metaDirty = false;
    let metaSaving = false;
    let metaErrors = {};

    let activeSection = null;
    let slideOpen = false;
    let slideTab = 'link';
    let slideErrors = {};
    let slideSaving = false;
    let linkTarget = null;
    let newPE = {};
    let newPNE = {};
    let newInst = {};

    let confirmOpen = false;
    let confirmTarget = null;
    let confirmLoading = false;

    const SECTION_META = {
        pe:   { endpoint: 'personas-esclavizadas',    idField: 'persona_id' },
        pne:  { endpoint: 'personas-no-esclavizadas', idField: 'persona_id' },
        inst: { endpoint: 'corporaciones',            idField: 'corporacion_id' },
    };

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
            tipo_documento: null,
            lugar_de_produccion: d.lugar_de_produccion?.lugar_id ?? null,
        };
    }

    function resetNewForms() {
        newPE  = { nombres: '', apellidos: '', sexo: 'v', documentos: [parseInt(docId)] };
        newPNE = { nombres: '', apellidos: '', sexo: 'v', honorifico: 'nan', documentos: [parseInt(docId)] };
        newInst = { nombre_institucion: '', tipo_institucion: null, documentos: [parseInt(docId)] };
    }

    async function loadAll() {
        pageLoading = true;
        pageError = null;
        try {
            const [docData, peData, pneData, corpData] = await Promise.all([
                fetchWithBaseUrl(`documentos/${docId}/`),
                fetchWithBaseUrl(`personas-esclavizadas/?documentos__documento_id=${docId}&page_size=100`),
                fetchWithBaseUrl(`personas-no-esclavizadas/?documentos__documento_id=${docId}&page_size=100`),
                fetchWithBaseUrl(`corporaciones/?documentos__documento_id=${docId}&page_size=100`),
            ]);
            doc = docData;
            metaForm = buildMetaForm(doc);
            metaDirty = false;
            peList   = peData?.results   ?? peData   ?? [];
            pneList  = pneData?.results  ?? pneData  ?? [];
            corpList = corpData?.results ?? corpData ?? [];
        } catch (e) {
            pageError = e?.message ?? 'Error al cargar el evento.';
        } finally {
            pageLoading = false;
        }
    }

    async function reloadSection(section) {
        const { endpoint } = SECTION_META[section];
        const data = await fetchWithBaseUrl(`${endpoint}/?documentos__documento_id=${docId}&page_size=100`);
        const list = data?.results ?? data ?? [];
        if (section === 'pe')   peList   = list;
        if (section === 'pne')  pneList  = list;
        if (section === 'inst') corpList = list;
    }

    onMount(loadAll);

    async function saveMetadata() {
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

    function openPanel(section) {
        activeSection = section;
        slideTab = 'link';
        linkTarget = null;
        slideErrors = {};
        resetNewForms();
        slideOpen = true;
    }

    const SLIDE_TITLES = {
        pe:   'Asociar persona esclavizada',
        pne:  'Asociar persona no esclavizada',
        inst: 'Asociar institución',
    };
    $: slideTitle = SLIDE_TITLES[activeSection] ?? '';

    async function doLink() {
        if (!linkTarget) return;
        slideSaving = true;
        slideErrors = {};
        const { endpoint } = SECTION_META[activeSection];
        try {
            await postWithBaseUrl(`${endpoint}/${linkTarget.value}/vincular/`, {
                documento_id: parseInt(docId),
            });
            await reloadSection(activeSection);
            slideOpen = false;
        } catch (e) {
            slideErrors = e?.data ?? { non_field_errors: [e?.message ?? 'Error al vincular.'] };
        } finally {
            slideSaving = false;
        }
    }

    async function doCreate() {
        slideSaving = true;
        slideErrors = {};
        const { endpoint } = SECTION_META[activeSection];
        const payload =
            activeSection === 'pe'   ? newPE :
            activeSection === 'pne'  ? newPNE :
            { ...newInst, tipo_institucion: newInst.tipo_institucion?.value ?? null };
        try {
            await postWithBaseUrl(`${endpoint}/`, payload);
            await reloadSection(activeSection);
            slideOpen = false;
        } catch (e) {
            slideErrors = e?.data ?? { non_field_errors: [e?.message ?? 'Error al crear.'] };
        } finally {
            slideSaving = false;
        }
    }

    function handleSubmit() {
        if (slideTab === 'link') doLink();
        else doCreate();
    }

    function requestUnlink(section, entity) {
        confirmTarget = { section, entity };
        confirmOpen = true;
    }

    async function executeUnlink() {
        const { section, entity } = confirmTarget;
        const { endpoint, idField } = SECTION_META[section];
        confirmLoading = true;
        try {
            await postWithBaseUrl(`${endpoint}/${entity[idField]}/desvincular/`, {
                documento_id: parseInt(docId),
            });
            await reloadSection(section);
            confirmOpen = false;
        } catch (e) {
            console.error('unlink error', e);
        } finally {
            confirmLoading = false;
        }
    }

    function unlinkLabel(target) {
        if (!target) return 'este registro';
        const { section, entity } = target;
        if (section === 'inst') return entity.nombre_institucion;
        return entity.nombre_normalizado ?? 'esta persona';
    }
</script>

{#if pageLoading}
<div class="container mt-5 text-center"><span class="spinner-border"></span></div>
{:else if pageError}
<div class="container mt-4"><div class="alert alert-danger">{pageError}</div></div>
{:else}
<div class="container-fluid mt-3 px-4">

    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb small">
            <li class="breadcrumb-item"><a href="/User/dashboard">Dashboard</a></li>
            <li class="breadcrumb-item active">Evento #{docId}</li>
        </ol>
    </nav>

    <!-- 1. Datos del evento -->
    <div class="card mb-4">
        <div
            class="card-header cataloguer-section-header py-2"
            role="button"
            data-bs-toggle="collapse"
            data-bs-target="#metaCollapse"
            aria-expanded="true"
            aria-controls="metaCollapse"
        >
            <span class="fw-semibold"><i class="bi bi-file-text me-1"></i>Datos del evento</span>
            {#if $hasPerm('dbgestor.change_documento')}
            <button
                class="btn btn-primary btn-sm"
                disabled={metaSaving || !metaDirty}
                on:click|stopPropagation={saveMetadata}
            >
                {#if metaSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Guardar
            </button>
            {/if}
        </div>
        <div class="collapse show" id="metaCollapse">
            <div class="card-body">
                {#if metaErrors.non_field_errors}
                    <div class="alert alert-danger small py-2">{metaErrors.non_field_errors.join(' ')}</div>
                {/if}
                <div class="row g-3">
                    <div class="col-md-8">
                        <FormField label="Título" error={metaErrors.titulo?.[0]}>
                            <input class="form-control" class:is-invalid={metaErrors.titulo}
                                bind:value={metaForm.titulo} on:input={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-4">
                        <FormField label="Sigla" error={metaErrors.sigla_documento?.[0]}>
                            <input class="form-control" bind:value={metaForm.sigla_documento}
                                on:input={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-3">
                        <FormField label="Fecha inicial" error={metaErrors.fecha_inicial?.[0]}>
                            <FlexDateInput bind:value={metaForm.fecha_inicial} on:change={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-3">
                        <FormField label="Fecha final" error={metaErrors.fecha_final?.[0]}>
                            <FlexDateInput bind:value={metaForm.fecha_final} on:change={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-3">
                        <FormField label="Folio inicial" error={metaErrors.folio_inicial?.[0]}>
                            <input class="form-control" bind:value={metaForm.folio_inicial}
                                on:input={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-3">
                        <FormField label="Folio final" error={metaErrors.folio_final?.[0]}>
                            <input class="form-control" bind:value={metaForm.folio_final}
                                on:input={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-6">
                        <FormField label="Tipo de documento" error={metaErrors.tipo_documento?.[0]}>
                            <SearchableSelect
                                endpoint="vocabularios/tipos-documentales/"
                                searchParam="search"
                                placeholder="Buscar tipo documental..."
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
                                placeholder="Buscar archivo..."
                                value={doc.archivo ? { value: doc.archivo.archivo_id, label: doc.archivo.nombre_archivo } : null}
                                on:change={e => { metaForm.archivo = e.detail?.value ?? null; metaDirty = true; }}
                            />
                        </FormField>
                    </div>
                    <div class="col-12">
                        <FormField label="Descripción" error={metaErrors.descripcion?.[0]}>
                            <textarea class="form-control" rows="2"
                                bind:value={metaForm.descripcion}
                                on:input={() => metaDirty = true}></textarea>
                        </FormField>
                    </div>
                    <div class="col-md-4">
                        <FormField label="Fondo">
                            <input class="form-control" bind:value={metaForm.fondo}
                                on:input={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-4">
                        <FormField label="Subfondo">
                            <input class="form-control" bind:value={metaForm.subfondo}
                                on:input={() => metaDirty = true} />
                        </FormField>
                    </div>
                    <div class="col-md-4 d-flex align-items-end pb-2">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="deteriorado"
                                bind:checked={metaForm.deteriorado}
                                on:change={() => metaDirty = true} />
                            <label class="form-check-label" for="deteriorado">Deteriorado</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. Personas Esclavizadas -->
    <EntitySection
        title="Personas esclavizadas"
        icon="bi-person-fill"
        entities={peList}
        idField="persona_id"
        addPermission="dbgestor.add_personaesclavizada"
        unlinkPermission="dbgestor.change_personaesclavizada"
        emptyLabel="Agregar persona esclavizada"
        on:add={() => openPanel('pe')}
        on:unlink={e => requestUnlink('pe', e.detail)}
    >
        <svelte:fragment slot="default" let:entity>
            <div class="fw-semibold small">{entity.nombre_normalizado}</div>
            <div class="text-muted" style="font-size:.75rem">{entity.persona_idno ?? ''}</div>
            <div class="mt-1 d-flex flex-wrap gap-1">
                {#if entity.sexo}<span class="badge bg-secondary">{entity.sexo}</span>{/if}
                {#each (entity.etnonimos ?? []) as e}
                    <span class="badge bg-light text-dark border">{e}</span>
                {/each}
                {#each (entity.calidades ?? []) as c}
                    <span class="badge" style="background:#D6C7B8;color:#333">{c}</span>
                {/each}
            </div>
            {#if entity.edad}
                <div class="text-muted mt-1" style="font-size:.7rem">{entity.edad} {entity.unidad_temporal_edad ?? ''}</div>
            {/if}
        </svelte:fragment>
    </EntitySection>

    <!-- 3. Personas No Esclavizadas -->
    <EntitySection
        title="Personas no esclavizadas"
        icon="bi-person"
        entities={pneList}
        idField="persona_id"
        addPermission="dbgestor.add_personanoesclavizada"
        unlinkPermission="dbgestor.change_personanoesclavizada"
        emptyLabel="Agregar persona no esclavizada"
        on:add={() => openPanel('pne')}
        on:unlink={e => requestUnlink('pne', e.detail)}
    >
        <svelte:fragment slot="default" let:entity>
            <div class="fw-semibold small">{entity.nombre_normalizado}</div>
            <div class="text-muted" style="font-size:.75rem">{entity.persona_idno ?? ''}</div>
            <div class="mt-1 d-flex flex-wrap gap-1">
                {#if entity.sexo}<span class="badge bg-secondary">{entity.sexo}</span>{/if}
                {#each (entity.ocupaciones ?? []) as o}
                    <span class="badge bg-light text-dark border">{o}</span>
                {/each}
                {#each (entity.calidades ?? []) as c}
                    <span class="badge" style="background:#D6C7B8;color:#333">{c}</span>
                {/each}
            </div>
        </svelte:fragment>
    </EntitySection>

    <!-- 4. Instituciones -->
    <EntitySection
        title="Instituciones asociadas"
        icon="bi-building"
        entities={corpList}
        idField="corporacion_id"
        addPermission="dbgestor.add_corporacion"
        unlinkPermission="dbgestor.change_corporacion"
        emptyLabel="Agregar institución"
        on:add={() => openPanel('inst')}
        on:unlink={e => requestUnlink('inst', e.detail)}
    >
        <svelte:fragment slot="default" let:entity>
            <div class="fw-semibold small">{entity.nombre_institucion}</div>
            {#if entity.corporacion_idno}
                <div class="text-muted" style="font-size:.75rem">{entity.corporacion_idno}</div>
            {/if}
            {#if entity.tipo_institucion}
                <span class="badge bg-light text-dark border mt-1">{entity.tipo_institucion}</span>
            {/if}
        </svelte:fragment>
    </EntitySection>

</div>
{/if}

<!-- Slide-over -->
<SlideOver bind:open={slideOpen} title={slideTitle}>
    {#if slideErrors.non_field_errors}
        <div class="alert alert-danger small py-2 mb-3">{slideErrors.non_field_errors.join(' ')}</div>
    {/if}

    <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
            <button class="nav-link" class:active={slideTab === 'link'}
                on:click={() => { slideTab = 'link'; slideErrors = {}; }}>
                <i class="bi bi-link-45deg me-1"></i>Vincular existente
            </button>
        </li>
        <li class="nav-item">
            <button class="nav-link" class:active={slideTab === 'create'}
                on:click={() => { slideTab = 'create'; slideErrors = {}; }}>
                <i class="bi bi-plus-circle me-1"></i>Crear nuevo/a
            </button>
        </li>
    </ul>

    {#if slideTab === 'link'}
    <div class="d-flex flex-column gap-3">
        {#if activeSection === 'pe'}
        <FormField label="Buscar persona esclavizada" error={slideErrors.detail?.[0]}>
            <SearchableSelect endpoint="personas-esclavizadas/" searchParam="search"
                placeholder="Nombre, apellidos, idno..." bind:value={linkTarget} />
        </FormField>
        {:else if activeSection === 'pne'}
        <FormField label="Buscar persona no esclavizada" error={slideErrors.detail?.[0]}>
            <SearchableSelect endpoint="personas-no-esclavizadas/" searchParam="search"
                placeholder="Nombre, apellidos, idno..." bind:value={linkTarget} />
        </FormField>
        {:else if activeSection === 'inst'}
        <FormField label="Buscar institución" error={slideErrors.detail?.[0]}>
            <SearchableSelect endpoint="corporaciones/" searchParam="search"
                placeholder="Nombre de la institución..." bind:value={linkTarget} />
        </FormField>
        {/if}
        <div class="d-flex gap-2 justify-content-end mt-2">
            <button class="btn btn-secondary" on:click={() => slideOpen = false}>Cancelar</button>
            <button class="btn btn-primary" disabled={slideSaving || !linkTarget} on:click={handleSubmit}>
                {#if slideSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Vincular
            </button>
        </div>
    </div>

    {:else}
    <div class="d-flex flex-column gap-3">
        {#if activeSection === 'pe'}
        <FormField label="Nombres *" error={slideErrors.nombres?.[0]}>
            <input class="form-control" class:is-invalid={slideErrors.nombres} bind:value={newPE.nombres} />
        </FormField>
        <FormField label="Apellidos" error={slideErrors.apellidos?.[0]}>
            <input class="form-control" bind:value={newPE.apellidos} />
        </FormField>
        <FormField label="Sexo *" error={slideErrors.sexo?.[0]}>
            <select class="form-select" bind:value={newPE.sexo}>
                <option value="v">Varón</option>
                <option value="m">Mujer</option>
                <option value="i">Desconocido</option>
            </select>
        </FormField>
        <FormField label="Edad" error={slideErrors.edad?.[0]}>
            <input type="number" class="form-control" bind:value={newPE.edad} min="0" />
        </FormField>

        {:else if activeSection === 'pne'}
        <FormField label="Nombres *" error={slideErrors.nombres?.[0]}>
            <input class="form-control" class:is-invalid={slideErrors.nombres} bind:value={newPNE.nombres} />
        </FormField>
        <FormField label="Apellidos" error={slideErrors.apellidos?.[0]}>
            <input class="form-control" bind:value={newPNE.apellidos} />
        </FormField>
        <FormField label="Sexo *" error={slideErrors.sexo?.[0]}>
            <select class="form-select" bind:value={newPNE.sexo}>
                <option value="v">Varón</option>
                <option value="m">Mujer</option>
                <option value="i">Desconocido</option>
            </select>
        </FormField>
        <FormField label="Honorífico" error={slideErrors.honorifico?.[0]}>
            <select class="form-select" bind:value={newPNE.honorifico}>
                <option value="nan">N/A</option>
                <option value="don">Don</option>
                <option value="dna">Doña</option>
                <option value="doc">Doctor</option>
                <option value="fra">Fray</option>
            </select>
        </FormField>

        {:else if activeSection === 'inst'}
        <FormField label="Nombre institución *" error={slideErrors.nombre_institucion?.[0]}>
            <input class="form-control" class:is-invalid={slideErrors.nombre_institucion}
                bind:value={newInst.nombre_institucion} />
        </FormField>
        <FormField label="Tipo de institución *" error={slideErrors.tipo_institucion?.[0]}>
            <SearchableSelect endpoint="vocabularios/tipos-institucion/" searchParam="search"
                placeholder="Buscar tipo..." bind:value={newInst.tipo_institucion} />
        </FormField>
        {/if}

        <div class="d-flex gap-2 justify-content-end mt-2">
            <button class="btn btn-secondary" on:click={() => slideOpen = false}>Cancelar</button>
            <button class="btn btn-primary" disabled={slideSaving} on:click={handleSubmit}>
                {#if slideSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Crear y asociar
            </button>
        </div>
    </div>
    {/if}
</SlideOver>

<ConfirmDelete
    bind:open={confirmOpen}
    message={`¿Desvincular "${unlinkLabel(confirmTarget)}" de este evento? El registro no se eliminará.`}
    confirmLabel="Desvincular"
    loading={confirmLoading}
    on:confirm={executeUnlink}
    on:cancel={() => confirmOpen = false}
/>
