<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import {
        whoami,
        searchPersonasEsclavizadas,
        peresclavizadas,
        relacionesByPersona,
        createPersonaRelacion,
        updatePersonaRelacion,
        deletePersonaRelacion,
        documentos as fetchDocumentos,
    } from '$lib/api';
    import SlideOver from '$lib/components/hub/SlideOver.svelte';
    import ConfirmDelete from '$lib/components/hub/ConfirmDelete.svelte';
    import FlexDateInput from '$lib/components/forms/FlexDateInput.svelte';

    // ── State ──────────────────────────────────────────────────────────────────
    let me = null;
    let allowed = false;

    let personaQuery = '';
    let personaResults = [];
    let personaTimer = null;
    let selectedPersona = null;

    let relaciones = [];
    let loading = false;
    let saveError = null;
    let saveSuccess = null;

    // SlideOver state
    let panelOpen = false;
    let editingRel = null;  // null = adding new

    // Form fields
    let formNaturaleza = '';
    let formDescripcion = '';
    let formDocumento = '';
    let formFechaIni = '';
    let formFechaFin = '';
    let formNotas = '';
    // "otras personas" in the relation
    let formPersonaQuery = '';
    let formPersonaResults = [];
    let formPersonaTimer = null;
    let formPersonas = [];  // array of { persona_id, nombre_normalizado }

    let formSaving = false;

    // Delete
    let deleteConfirmOpen = false;
    let deletingRel = null;
    let deleteInProgress = false;

    const NATURALEZA_OPTIONS = [
        { value: 'fam', label: 'Familiar' },
        { value: 'tmp', label: 'Temporal' },
        { value: 'sub', label: 'Subordinación' },
    ];

    // ── Auth ───────────────────────────────────────────────────────────────────
    onMount(async () => {
        try {
            me = await whoami();
            const groups = me?.groups ?? [];
            allowed = me?.is_staff || groups.includes('colectores');
            if (!allowed) { window.location.href = '/User/login'; return; }
        } catch {
            window.location.href = '/User/login';
            return;
        }

        const preloadId = $page.url.searchParams.get('persona_id');
        if (preloadId) {
            try {
                const pe = await peresclavizadas(preloadId);
                await selectPersona(pe);
            } catch { /* user can search manually */ }
        }
    });

    // ── Persona search ─────────────────────────────────────────────────────────
    function onPersonaInput() {
        clearTimeout(personaTimer);
        if (personaQuery.trim().length < 2) { personaResults = []; return; }
        personaTimer = setTimeout(async () => {
            try {
                const res = await searchPersonasEsclavizadas(personaQuery);
                personaResults = res.results ?? res ?? [];
            } catch { personaResults = []; }
        }, 300);
    }

    async function selectPersona(pe) {
        personaResults = [];
        personaQuery = '';
        try { selectedPersona = await peresclavizadas(pe.persona_id); }
        catch { selectedPersona = pe; }
        await loadRelaciones(selectedPersona.persona_id);
    }

    // ── Load relaciones ────────────────────────────────────────────────────────
    async function loadRelaciones(personaId) {
        loading = true;
        saveError = null;
        saveSuccess = null;
        try {
            const res = await relacionesByPersona(personaId);
            relaciones = res.results ?? res ?? [];
        } catch {
            saveError = 'No se pudieron cargar las relaciones.';
        } finally {
            loading = false;
        }
    }

    // ── "Otras personas" search inside the form ────────────────────────────────
    function onFormPersonaInput() {
        clearTimeout(formPersonaTimer);
        if (formPersonaQuery.trim().length < 2) { formPersonaResults = []; return; }
        formPersonaTimer = setTimeout(async () => {
            try {
                const res = await searchPersonasEsclavizadas(formPersonaQuery);
                formPersonaResults = res.results ?? res ?? [];
            } catch { formPersonaResults = []; }
        }, 300);
    }

    function addFormPersona(pe) {
        formPersonaQuery = '';
        formPersonaResults = [];
        if (!formPersonas.find(p => p.persona_id === pe.persona_id)) {
            formPersonas = [...formPersonas, { persona_id: pe.persona_id, nombre_normalizado: pe.nombre_normalizado }];
        }
    }

    function removeFormPersona(id) {
        formPersonas = formPersonas.filter(p => p.persona_id !== id);
    }

    // ── Open panel ─────────────────────────────────────────────────────────────
    function openAdd() {
        editingRel = null;
        formNaturaleza = '';
        formDescripcion = '';
        formDocumento = '';
        formFechaIni = '';
        formFechaFin = '';
        formNotas = '';
        formPersonas = selectedPersona ? [{ persona_id: selectedPersona.persona_id, nombre_normalizado: selectedPersona.nombre_normalizado }] : [];
        formPersonaQuery = '';
        panelOpen = true;
    }

    function openEdit(rel) {
        editingRel = rel;
        formNaturaleza = rel.naturaleza_relacion ?? '';
        formDescripcion = rel.descripcion_relacion ?? '';
        formDocumento = rel.documento?.documento_id ?? '';
        formFechaIni = '';
        formFechaFin = '';
        formNotas = rel.notas ?? '';
        // Build personas list from the relation (persona_ids)
        formPersonas = (rel.persona_ids ?? []).map(id => ({ persona_id: id, nombre_normalizado: `ID ${id}` }));
        formPersonaQuery = '';
        panelOpen = true;
    }

    function closePanel() {
        panelOpen = false;
        editingRel = null;
    }

    // ── Save (create/update) ───────────────────────────────────────────────────
    async function saveRelacion() {
        if (!formNaturaleza) {
            saveError = 'Naturaleza de la relación es obligatoria.';
            return;
        }
        if (formPersonas.length < 1) {
            saveError = 'Debe incluir al menos una persona en la relación.';
            return;
        }
        if (!formDocumento) {
            saveError = 'El documento de referencia es obligatorio.';
            return;
        }

        formSaving = true;
        saveError = null;
        try {
            const payload = {
                naturaleza_relacion: formNaturaleza,
                documento: formDocumento,
                personas: formPersonas.map(p => p.persona_id),
            };
            if (formDescripcion) payload.descripcion_relacion = formDescripcion;
            if (formNotas)       payload.notas = formNotas;
            if (formFechaIni)    payload.fecha_inicial_relacion_raw = formFechaIni;
            if (formFechaFin)    payload.fecha_final_relacion_raw = formFechaFin;

            if (editingRel) {
                await updatePersonaRelacion(editingRel.persona_relacion_id, payload);
                saveSuccess = 'Relación actualizada.';
            } else {
                // persona_fuente is the currently selected persona
                if (selectedPersona) payload.persona_fuente = selectedPersona.persona_id;
                await createPersonaRelacion(payload);
                saveSuccess = 'Relación creada.';
            }
            closePanel();
            await loadRelaciones(selectedPersona.persona_id);
        } catch (e) {
            saveError = e.data ? JSON.stringify(e.data) : 'Error al guardar la relación.';
        } finally {
            formSaving = false;
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────────
    function askDelete(rel) {
        deletingRel = rel;
        deleteConfirmOpen = true;
    }

    function cancelDelete() {
        deleteConfirmOpen = false;
        deletingRel = null;
    }

    async function confirmDelete() {
        deleteInProgress = true;
        saveError = null;
        try {
            await deletePersonaRelacion(deletingRel.persona_relacion_id);
            cancelDelete();
            await loadRelaciones(selectedPersona.persona_id);
            saveSuccess = 'Relación eliminada.';
        } catch {
            saveError = 'Error al eliminar la relación.';
        } finally {
            deleteInProgress = false;
        }
    }

    function dismissAlert() { saveError = null; saveSuccess = null; }

    function naturalezaLabel(val) {
        return NATURALEZA_OPTIONS.find(o => o.value === val)?.label ?? val;
    }
</script>

<svelte:head>
    <title>Relaciones — Trayectorias Afro</title>
</svelte:head>

<div class="container-fluid mt-3">
    <div class="d-flex align-items-center justify-content-between mb-3">
        <h1 class="h4 mb-0"><i class="bi bi-people me-2"></i>Editar relaciones entre personas</h1>
        <a href="/User/dashboard" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i>Dashboard
        </a>
    </div>

    {#if saveError}
        <div class="alert alert-danger alert-dismissible" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{saveError}
            <button type="button" class="btn-close" on:click={dismissAlert}></button>
        </div>
    {/if}
    {#if saveSuccess}
        <div class="alert alert-success alert-dismissible" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{saveSuccess}
            <button type="button" class="btn-close" on:click={dismissAlert}></button>
        </div>
    {/if}

    <!-- Persona search -->
    <div class="card mb-3">
        <div class="card-body pb-2">
            <label class="form-label fw-semibold mb-1" for="persona-search">
                Buscar persona esclavizada
            </label>
            <div class="position-relative">
                <input
                    id="persona-search"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por nombre…"
                    bind:value={personaQuery}
                    on:input={onPersonaInput}
                    autocomplete="off"
                    aria-autocomplete="list"
                    aria-controls="persona-results"
                />
                {#if personaResults.length}
                    <ul id="persona-results" class="list-group position-absolute w-100 shadow-sm" style="z-index:1050; top:100%;" role="listbox">
                        {#each personaResults as pe}
                            <li class="list-group-item list-group-item-action"
                                style="cursor:pointer;"
                                role="option"
                                tabindex="0"
                                on:click={() => selectPersona(pe)}
                                on:keydown={(e) => e.key === 'Enter' && selectPersona(pe)}>
                                <span class="fw-semibold">{pe.nombre_normalizado}</span>
                                <small class="text-muted ms-2">{pe.persona_idno}</small>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
            {#if selectedPersona}
                <div class="mt-2 d-flex align-items-center gap-2">
                    <span class="badge bg-danger">{selectedPersona.nombre_normalizado}</span>
                    <small class="text-muted">{selectedPersona.persona_idno}</small>
                    <button class="btn btn-link btn-sm p-0 text-muted" on:click={() => { selectedPersona = null; relaciones = []; }}>
                        <i class="bi bi-x-circle"></i> Cambiar
                    </button>
                </div>
            {/if}
        </div>
    </div>

    {#if loading}
        <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Cargando…</span>
            </div>
        </div>
    {:else if selectedPersona}
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span class="fw-semibold">
                    <i class="bi bi-diagram-3 me-1"></i>
                    Relaciones ({relaciones.length})
                </span>
                <button class="btn btn-sm btn-success" on:click={openAdd}>
                    <i class="bi bi-plus-lg me-1"></i>Nueva relación
                </button>
            </div>

            {#if relaciones.length === 0}
                <div class="card-body text-muted text-center py-4">
                    No hay relaciones registradas para esta persona.
                </div>
            {:else}
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th scope="col">Naturaleza</th>
                                <th scope="col">Personas</th>
                                <th scope="col">Descripción</th>
                                <th scope="col">Documento</th>
                                <th scope="col" class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each relaciones as rel}
                                <tr>
                                    <td>
                                        <span class="badge {rel.naturaleza_relacion === 'fam' ? 'bg-success' : rel.naturaleza_relacion === 'tmp' ? 'bg-warning text-dark' : 'bg-info text-dark'}">
                                            {naturalezaLabel(rel.naturaleza_relacion)}
                                        </span>
                                    </td>
                                    <td>
                                        {#if rel.persona_ids?.length}
                                            <small class="text-muted">{rel.persona_ids.length} persona(s)</small>
                                        {/if}
                                    </td>
                                    <td>
                                        <small>{rel.descripcion_relacion ?? '—'}</small>
                                    </td>
                                    <td>
                                        {#if rel.documento}
                                            <small class="text-muted">{rel.documento.documento_idno ?? rel.documento.documento_id}</small>
                                        {:else}
                                            <small class="text-muted">—</small>
                                        {/if}
                                    </td>
                                    <td class="text-end">
                                        <div class="d-flex gap-1 justify-content-end">
                                            <button class="btn btn-sm btn-outline-primary"
                                                    aria-label="Editar relación"
                                                    on:click={() => openEdit(rel)}>
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger"
                                                    aria-label="Eliminar relación"
                                                    on:click={() => askDelete(rel)}>
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {:else}
        <div class="text-muted text-center py-5">
            <i class="bi bi-search fs-3 d-block mb-2"></i>
            Busca una persona para gestionar sus relaciones.
        </div>
    {/if}
</div>

<!-- Add / Edit SlideOver -->
<SlideOver bind:open={panelOpen} title={editingRel ? 'Editar relación' : 'Nueva relación'} on:close={closePanel}>
    <form on:submit|preventDefault={saveRelacion} novalidate>
        <!-- Naturaleza -->
        <div class="mb-3">
            <label class="form-label fw-semibold" for="naturaleza">
                Naturaleza de la relación <span class="text-danger" aria-hidden="true">*</span>
            </label>
            <select id="naturaleza" class="form-select" bind:value={formNaturaleza} required>
                <option value="">— Seleccionar —</option>
                {#each NATURALEZA_OPTIONS as opt}
                    <option value={opt.value}>{opt.label}</option>
                {/each}
            </select>
        </div>

        <!-- Documento -->
        <div class="mb-3">
            <label class="form-label fw-semibold" for="rel-documento">
                Documento (ID) <span class="text-danger" aria-hidden="true">*</span>
            </label>
            <input id="rel-documento" type="number" class="form-control" bind:value={formDocumento} placeholder="ID del documento" required />
        </div>

        <!-- Descripción -->
        <div class="mb-3">
            <label class="form-label fw-semibold" for="rel-descripcion">Descripción</label>
            <input id="rel-descripcion" type="text" class="form-control" bind:value={formDescripcion} maxlength="250" />
        </div>

        <!-- Personas involucradas -->
        <div class="mb-3">
            <label class="form-label fw-semibold">Personas involucradas</label>
            <div class="d-flex flex-wrap gap-1 mb-2">
                {#each formPersonas as fp}
                    <span class="badge bg-secondary d-flex align-items-center gap-1">
                        {fp.nombre_normalizado}
                        <button type="button" class="btn-close btn-close-white" style="font-size:0.6rem;" aria-label="Quitar persona" on:click={() => removeFormPersona(fp.persona_id)}></button>
                    </span>
                {/each}
            </div>
            <div class="position-relative">
                <input
                    type="search"
                    class="form-control form-control-sm"
                    placeholder="Buscar y añadir persona…"
                    bind:value={formPersonaQuery}
                    on:input={onFormPersonaInput}
                    autocomplete="off"
                    aria-autocomplete="list"
                    aria-controls="form-persona-results"
                />
                {#if formPersonaResults.length}
                    <ul id="form-persona-results" class="list-group position-absolute w-100 shadow-sm" style="z-index:1100; top:100%;" role="listbox">
                        {#each formPersonaResults as pe}
                            <li class="list-group-item list-group-item-action py-1"
                                style="cursor:pointer;"
                                role="option"
                                tabindex="0"
                                on:click={() => addFormPersona(pe)}
                                on:keydown={(e) => e.key === 'Enter' && addFormPersona(pe)}>
                                <small>{pe.nombre_normalizado}</small>
                                <small class="text-muted ms-1">{pe.persona_idno}</small>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </div>

        <!-- Fechas -->
        <div class="row mb-3">
            <div class="col">
                <label class="form-label fw-semibold" for="rel-fecha-ini">Fecha inicial</label>
                <FlexDateInput id="rel-fecha-ini" bind:value={formFechaIni} />
            </div>
            <div class="col">
                <label class="form-label fw-semibold" for="rel-fecha-fin">Fecha final</label>
                <FlexDateInput id="rel-fecha-fin" bind:value={formFechaFin} />
            </div>
        </div>

        <!-- Notas -->
        <div class="mb-3">
            <label class="form-label fw-semibold" for="rel-notas">Notas</label>
            <textarea id="rel-notas" class="form-control" rows="2" bind:value={formNotas} maxlength="500"></textarea>
        </div>

        {#if saveError}
            <div class="alert alert-danger py-2 mb-3" role="alert">
                <small>{saveError}</small>
            </div>
        {/if}

        <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" disabled={formSaving}>
                {#if formSaving}
                    <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                {/if}
                {editingRel ? 'Guardar cambios' : 'Crear relación'}
            </button>
            <button type="button" class="btn btn-outline-secondary" on:click={closePanel}>Cancelar</button>
        </div>
    </form>
</SlideOver>

<!-- Confirm delete -->
<ConfirmDelete
    bind:open={deleteConfirmOpen}
    inProgress={deleteInProgress}
    message="¿Eliminar esta relación? Esta acción no se puede deshacer."
    on:confirm={confirmDelete}
    on:cancel={cancelDelete}
/>
