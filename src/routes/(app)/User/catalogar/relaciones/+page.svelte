<script>
    import { onMount, onDestroy, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import {
        whoami,
        searchPersonasEsclavizadas,
        personaNetwork,
        personaPersonasRel,
        createPersonaRelacion,
        updatePersonaRelacion,
        deletePersonaRelacion,
    } from '$lib/api';
    import cytoscape from 'cytoscape';
    import fcose from 'cytoscape-fcose';
    import edgehandles from 'cytoscape-edgehandles';
    import SlideOver from '$lib/components/hub/SlideOver.svelte';
    import ConfirmDelete from '$lib/components/hub/ConfirmDelete.svelte';
    import FlexDateInput from '$lib/components/forms/FlexDateInput.svelte';

    // Guard against double-registration (HMR / multiple imports)
    try { cytoscape.use(fcose); } catch {}
    try { cytoscape.use(edgehandles); } catch {}

    // ── State ─────────────────────────────────────────────────────────────────
    let me = null;

    // Sidebar search
    let personaQuery = '';
    let personaResults = [];
    let personaTimer = null;

    // Canvas
    let cy = null;
    let eh = null;
    let canvasContainer;
    let canvasPersonaIds = new Set();
    let canvasPersonas = [];
    let drawMode = false;
    let loadingPersona = false;

    // Filter
    let activeRelFilter = null;

    // SlideOver / form
    let panelOpen = false;
    let editingRel = null;
    let formNaturaleza = '';
    let formDescripcion = '';
    let formDocumento = '';
    let formFechaIni = '';
    let formFechaFin = '';
    let formNotas = '';
    let formPersonas = [];
    let formPersonaQuery = '';
    let formPersonaResults = [];
    let formPersonaTimer = null;
    let formSaving = false;
    let formLoadingRel = false;

    // Alerts
    let saveError = null;
    let saveSuccess = null;

    // Delete
    let deleteConfirmOpen = false;
    let deletingRel = null;
    let deleteInProgress = false;

    const NATURALEZA_OPTIONS = [
        { value: 'fam', label: 'Familiar' },
        { value: 'tmp', label: 'Temporal' },
        { value: 'sub', label: 'Subordinación' },
    ];

    const FCOSE_OPTS = {
        name: 'fcose',
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 40,
        nodeSeparation: 120,
        idealEdgeLength: 130,
        edgeElasticity: 0.45,
        nodeRepulsion: 6500,
        gravity: 0.25,
        gravityRange: 1.5,
        numIter: 2500,
        randomize: false,
    };

    // ── Auth ──────────────────────────────────────────────────────────────────
    onMount(async () => {
        if (!browser) return;
        try {
            me = await whoami();
            const groups = me?.groups ?? [];
            const allowed = me?.is_staff || groups.includes('colectores');
            if (!allowed) { window.location.href = '/User/login'; return; }
        } catch {
            window.location.href = '/User/login';
            return;
        }
        await tick();
        initCy();
        const preloadId = $page.url.searchParams.get('persona_id');
        if (preloadId) {
            try { await addPersonaToCanvas(preloadId, null); } catch {}
        }
    });

    onDestroy(() => {
        if (eh) { try { eh.destroy(); } catch {} }
        if (cy) { try { cy.destroy(); } catch {} }
    });

    // ── Cytoscape init ────────────────────────────────────────────────────────
    function initCy() {
        cy = cytoscape({
            container: canvasContainer,
            elements: [],
            style: getCyStyle(),
            layout: { name: 'preset' },
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
        });

        eh = cy.edgehandles({
            canConnect: (src, tgt) => !src.same(tgt),
            edgeParams: () => ({}),
            hoverDelay: 120,
            snap: false,
            noEdgeEventsInDraw: true,
            disableBrowserGestures: true,
        });

        cy.on('ehcomplete', (_ev, sourceNode, targetNode, addedEdge) => {
            addedEdge.remove();
            openAdd(sourceNode.data(), targetNode.data());
        });

        cy.on('tap', 'edge', async (event) => {
            if (drawMode) return;
            const d = event.target.data();
            if (d.persona_relacion_id) {
                await openEditFromEdge(d);
            }
        });

        cy.on('mouseover', 'node', ev => { if (!drawMode) ev.target.style({ 'border-width': 4, 'overlay-opacity': 0.08 }); });
        cy.on('mouseout',  'node', ev => ev.target.style({ 'border-width': 2, 'overlay-opacity': 0 }));
        cy.on('mouseover', 'edge', ev => ev.target.style({ 'width': 4, 'line-opacity': 1 }));
        cy.on('mouseout',  'edge', ev => ev.target.style({ 'width': null, 'line-opacity': null }));
    }

    function getCyStyle() {
        return [
            {
                selector: 'node',
                style: {
                    'background-color': '#9DB5B2',
                    'border-width': 2,
                    'border-color': '#7A9E9A',
                    'label': 'data(label)',
                    'text-valign': 'bottom',
                    'text-halign': 'center',
                    'text-margin-y': 6,
                    'color': '#3d4f5f',
                    'font-size': '9px',
                    'text-wrap': 'wrap',
                    'text-max-width': '80px',
                    'width': 30,
                    'height': 30,
                    'text-outline-width': 1.5,
                    'text-outline-color': '#fff',
                    'text-outline-opacity': 0.8,
                    'cursor': 'grab',
                },
            },
            {
                selector: 'node[type = "esclavizada"]',
                style: { 'background-color': '#C9735B', 'border-color': '#A85A44' },
            },
            {
                selector: 'node[type = "no_esclavizada"]',
                style: { 'background-color': '#1ABC9C', 'border-color': '#17A589' },
            },
            {
                selector: '.eh-source',
                style: { 'border-width': 4, 'border-color': '#e74c3c', 'overlay-opacity': 0.1 },
            },
            {
                selector: '.eh-hover',
                style: { 'border-width': 4, 'border-color': '#3498db', 'overlay-opacity': 0.12 },
            },
            {
                selector: '.eh-ghost-node',
                style: { 'opacity': 0 },
            },
            {
                selector: '.eh-preview, .eh-ghost-edge',
                style: { 'line-color': '#3498db', 'line-style': 'dashed', 'width': 2 },
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#C8D1D9',
                    'line-opacity': 0.85,
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'none',
                    'cursor': 'pointer',
                },
            },
            {
                selector: 'edge[relation = "fam"]',
                style: { 'line-color': '#D4A27F', 'width': 2.5 },
            },
            {
                selector: 'edge[relation = "tmp"]',
                style: { 'line-color': '#7BB97B' },
            },
            {
                selector: 'edge[relation = "sub"]',
                style: {
                    'line-color': '#9B8EC4',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#9B8EC4',
                },
            },
        ];
    }

    // ── Draw mode toggle ──────────────────────────────────────────────────────
    function toggleDrawMode() {
        drawMode = !drawMode;
        if (drawMode) {
            eh.enableDrawMode();
            cy.userPanningEnabled(false);
        } else {
            eh.disableDrawMode();
            cy.userPanningEnabled(true);
        }
    }

    // ── Add persona to canvas ─────────────────────────────────────────────────
    async function addPersonaToCanvas(personaId, personaObj) {
        const pid = String(personaId);
        if (canvasPersonaIds.has(pid)) { personaQuery = ''; personaResults = []; return; }
        loadingPersona = true;
        personaResults = [];
        personaQuery = '';
        try {
            const netData = await personaNetwork(pid);
            const { nodes = [], edges = [] } = netData;
            const toAdd = [];

            if (nodes.length === 0 && personaObj) {
                const nodeId = `p${pid}`;
                if (!cy.$id(nodeId).length) {
                    toAdd.push({ data: { id: nodeId, label: personaObj.nombre_normalizado, type: 'esclavizada' } });
                }
                if (!canvasPersonaIds.has(pid)) {
                    canvasPersonaIds.add(pid);
                    canvasPersonas = [...canvasPersonas, { persona_id: pid, nombre_normalizado: personaObj.nombre_normalizado }];
                }
            }

            for (const n of nodes) {
                if (!cy.$id(n.data.id).length) toAdd.push(n);
                const npid = String(n.data.id.replace('p', ''));
                if (!canvasPersonaIds.has(npid)) {
                    canvasPersonaIds.add(npid);
                    const label = n.data.label ?? `ID ${npid}`;
                    if (!canvasPersonas.find(p => p.persona_id === npid)) {
                        canvasPersonas = [...canvasPersonas, { persona_id: npid, nombre_normalizado: label }];
                    }
                }
            }

            for (const e of edges) {
                if (e.data.id && !cy.$id(e.data.id).length) toAdd.push(e);
            }

            if (toAdd.length) cy.add(toAdd);
            applyRelFilter(activeRelFilter);
            if (toAdd.length) cy.layout(FCOSE_OPTS).run();
        } catch {
            if (personaObj) {
                const nodeId = `p${pid}`;
                if (!cy.$id(nodeId).length) {
                    cy.add({ data: { id: nodeId, label: personaObj.nombre_normalizado, type: 'esclavizada' } });
                }
                if (!canvasPersonaIds.has(pid)) {
                    canvasPersonaIds.add(pid);
                    canvasPersonas = [...canvasPersonas, { persona_id: pid, nombre_normalizado: personaObj.nombre_normalizado }];
                }
            }
        } finally {
            loadingPersona = false;
        }
    }

    function removePersonaFromCanvas(personaId) {
        const pid = String(personaId);
        cy.$id(`p${pid}`).remove();
        canvasPersonaIds.delete(pid);
        canvasPersonas = canvasPersonas.filter(p => p.persona_id !== pid);
    }

    // ── Layout / zoom / export ────────────────────────────────────────────────
    function zoomFit() { cy?.fit(undefined, 40); }

    function exportNetwork() {
        if (!cy) return;
        const png = cy.png({ scale: 2, full: true, bg: '#ffffff' });
        const a = document.createElement('a');
        a.href = png;
        a.download = 'relaciones.png';
        a.click();
    }

    // ── Relation filter ───────────────────────────────────────────────────────
    function filterByRelation(relType) {
        activeRelFilter = activeRelFilter === relType ? null : relType;
        applyRelFilter(activeRelFilter);
    }

    function applyRelFilter(relType) {
        if (!cy) return;
        if (!relType) {
            cy.edges().style({ display: 'element' });
        } else {
            cy.edges().forEach(e => {
                e.style({ display: e.data('relation') === relType ? 'element' : 'none' });
            });
        }
    }

    // ── Sidebar search ────────────────────────────────────────────────────────
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

    // ── Form persona search ───────────────────────────────────────────────────
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

    // ── Open panel (new relation) ─────────────────────────────────────────────
    function openAdd(sourceData = null, targetData = null) {
        editingRel = null;
        formNaturaleza = '';
        formDescripcion = '';
        formDocumento = '';
        formFechaIni = '';
        formFechaFin = '';
        formNotas = '';
        formPersonas = [];
        if (sourceData) formPersonas.push({ persona_id: parseInt(sourceData.id.replace('p', '')), nombre_normalizado: sourceData.label });
        if (targetData) formPersonas.push({ persona_id: parseInt(targetData.id.replace('p', '')), nombre_normalizado: targetData.label });
        formPersonaQuery = '';
        formPersonaResults = [];
        saveError = null;
        panelOpen = true;
    }

    // ── Open panel (edit from edge tap) ──────────────────────────────────────
    async function openEditFromEdge(edgeData) {
        saveError = null;
        formLoadingRel = true;
        panelOpen = true;
        try {
            const rel = await personaPersonasRel(edgeData.persona_relacion_id);
            editingRel = rel;
            formNaturaleza = rel.naturaleza_relacion ?? '';
            formDescripcion = rel.descripcion_relacion ?? '';
            formDocumento = rel.documento?.documento_id ?? '';
            formFechaIni = '';
            formFechaFin = '';
            formNotas = rel.notas ?? '';
            const ids = rel.persona_ids ?? [
                parseInt(edgeData.source.replace('p', '')),
                parseInt(edgeData.target.replace('p', '')),
            ];
            formPersonas = ids.map(id => {
                const nodeEl = cy?.$id(`p${id}`);
                const label = (nodeEl?.length ? nodeEl.data('label') : null) ?? `ID ${id}`;
                return { persona_id: id, nombre_normalizado: label };
            });
            formPersonaQuery = '';
            formPersonaResults = [];
        } catch {
            saveError = 'No se pudo cargar la relación para editar.';
        } finally {
            formLoadingRel = false;
        }
    }

    function closePanel() {
        panelOpen = false;
        editingRel = null;
        saveError = null;
        formLoadingRel = false;
    }

    // ── Save (create / update) ────────────────────────────────────────────────
    async function saveRelacion() {
        if (!formNaturaleza) { saveError = 'Naturaleza es obligatoria.'; return; }
        if (formPersonas.length < 2) { saveError = 'Se necesitan al menos 2 personas.'; return; }
        if (!formDocumento) { saveError = 'El documento es obligatorio.'; return; }
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
                cy?.edges(`[persona_relacion_id = ${editingRel.persona_relacion_id}]`).forEach(e => {
                    e.data('relation', payload.naturaleza_relacion);
                    e.data('descripcion', payload.descripcion_relacion ?? '');
                });
                saveSuccess = 'Relación actualizada.';
            } else {
                const created = await createPersonaRelacion(payload);
                addCreatedEdgeToCy(created, payload);
                saveSuccess = 'Relación creada.';
            }
            closePanel();
            applyRelFilter(activeRelFilter);
        } catch (e) {
            saveError = e.data ? JSON.stringify(e.data) : 'Error al guardar la relación.';
        } finally {
            formSaving = false;
        }
    }

    function addCreatedEdgeToCy(created, payload) {
        const relId = created?.persona_relacion_id;
        if (!relId || formPersonas.length < 2) return;
        for (let i = 0; i < formPersonas.length; i++) {
            for (let j = i + 1; j < formPersonas.length; j++) {
                const src = `p${formPersonas[i].persona_id}`;
                const tgt = `p${formPersonas[j].persona_id}`;
                const edgeId = `r${relId}_${formPersonas[i].persona_id}_${formPersonas[j].persona_id}`;
                if (!cy.$id(edgeId).length && cy.$id(src).length && cy.$id(tgt).length) {
                    cy.add({
                        data: {
                            id: edgeId,
                            source: src,
                            target: tgt,
                            relation: payload.naturaleza_relacion,
                            descripcion: payload.descripcion_relacion ?? '',
                            persona_relacion_id: relId,
                            documento_id: payload.documento,
                        },
                    });
                }
            }
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    function askDeleteFromEdge(relId) {
        deletingRel = { persona_relacion_id: relId };
        deleteConfirmOpen = true;
    }

    function cancelDelete() { deleteConfirmOpen = false; deletingRel = null; }

    async function confirmDelete() {
        deleteInProgress = true;
        saveError = null;
        try {
            await deletePersonaRelacion(deletingRel.persona_relacion_id);
            cy?.elements(`edge[persona_relacion_id = ${deletingRel.persona_relacion_id}]`).remove();
            saveSuccess = 'Relación eliminada.';
            cancelDelete();
        } catch {
            saveError = 'Error al eliminar la relación.';
        } finally {
            deleteInProgress = false;
        }
    }

    function dismissAlert() { saveError = null; saveSuccess = null; }
    function naturalezaLabel(val) { return NATURALEZA_OPTIONS.find(o => o.value === val)?.label ?? val; }
</script>

<svelte:head>
    <title>Red de Relaciones — Trayectorias Afro</title>
</svelte:head>

<div class="container-fluid mt-3 d-flex flex-column" style="height: calc(100vh - 80px);">

    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-2">
        <h1 class="h4 mb-0"><i class="bi bi-diagram-3 me-2"></i>Red de relaciones entre personas</h1>
        <a href="/User/" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i>Dashboard
        </a>
    </div>

    <!-- Alerts -->
    {#if saveError}
        <div class="alert alert-danger alert-dismissible py-2 mb-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{saveError}
            <button type="button" class="btn-close" on:click={dismissAlert} aria-label="Cerrar"></button>
        </div>
    {/if}
    {#if saveSuccess}
        <div class="alert alert-success alert-dismissible py-2 mb-2" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{saveSuccess}
            <button type="button" class="btn-close" on:click={dismissAlert} aria-label="Cerrar"></button>
        </div>
    {/if}

    <!-- Main two-column layout -->
    <div class="row g-2 flex-grow-1" style="min-height: 0;">

        <!-- Sidebar -->
        <div class="col-lg-3 d-flex flex-column" style="overflow-y: auto; min-height: 0;">

            <div class="card mb-2 flex-shrink-0">
                <div class="card-header py-2 fw-semibold small">
                    <i class="bi bi-person-plus me-1"></i>Agregar persona al canvas
                </div>
                <div class="card-body p-2">
                    <div class="position-relative">
                        <input
                            type="search"
                            class="form-control form-control-sm"
                            placeholder="Buscar por nombre..."
                            bind:value={personaQuery}
                            on:input={onPersonaInput}
                            autocomplete="off"
                            aria-autocomplete="list"
                            aria-controls="sidebar-persona-results"
                            aria-label="Buscar persona esclavizada"
                            disabled={loadingPersona}
                        />
                        {#if loadingPersona}
                            <div class="position-absolute top-50 end-0 translate-middle-y pe-2" style="pointer-events: none;">
                                <span class="spinner-border spinner-border-sm text-danger" role="status" aria-label="Cargando"></span>
                            </div>
                        {/if}
                        {#if personaResults.length}
                            <ul
                                id="sidebar-persona-results"
                                class="list-group position-absolute w-100 shadow"
                                style="z-index: 1050; top: 100%;"
                                role="listbox"
                            >
                                {#each personaResults as pe}
                                    <li
                                        class="list-group-item list-group-item-action py-1 px-2"
                                        role="option"
                                        aria-selected="false"
                                        tabindex="0"
                                        on:click={() => addPersonaToCanvas(pe.persona_id, pe)}
                                        on:keydown={(e) => e.key === 'Enter' && addPersonaToCanvas(pe.persona_id, pe)}
                                        style="cursor: pointer;"
                                    >
                                        <div class="fw-semibold small">{pe.nombre_normalizado}</div>
                                        <div class="text-muted" style="font-size: 0.7rem;">{pe.persona_idno}</div>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                </div>
            </div>

            {#if canvasPersonas.length}
                <div class="card flex-grow-1" style="overflow-y: auto; min-height: 0;">
                    <div class="card-header py-2 fw-semibold small">
                        <i class="bi bi-people me-1"></i>En el canvas ({canvasPersonas.length})
                    </div>
                    <ul class="list-group list-group-flush">
                        {#each canvasPersonas as cp}
                            <li class="list-group-item d-flex justify-content-between align-items-center py-1 px-2">
                                <span
                                    class="small text-truncate me-1"
                                    style="max-width: 160px;"
                                    title={`${cp.nombre_normalizado} [${cp.persona_id}]`}
                                >{`[${cp.persona_id}] - ${cp.nombre_normalizado}`}</span>
                                <button
                                    class="btn btn-link btn-sm p-0 text-muted flex-shrink-0"
                                    aria-label="Quitar {cp.nombre_normalizado} del canvas"
                                    title="Quitar del canvas"
                                    on:click={() => removePersonaFromCanvas(cp.persona_id)}
                                >
                                    <i class="bi bi-x-circle"></i>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>
            {:else}
                <div class="text-muted text-center py-4 small px-2">
                    <i class="bi bi-person-plus d-block mb-2" style="font-size: 2rem; opacity: 0.3;"></i>
                    Busca personas para visualizar su red de relaciones.
                </div>
            {/if}
        </div>

        <!-- Canvas area -->
        <div class="col-lg-9 d-flex flex-column" style="min-height: 0;">

            <!-- Toolbar -->
            <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
                <button
                    class="btn btn-sm {drawMode ? 'btn-danger' : 'btn-outline-danger'}"
                    on:click={toggleDrawMode}
                    aria-pressed={drawMode}
                    title={drawMode ? 'Salir del modo dibujo' : 'Activar modo dibujo: arrastra de un nodo a otro para crear una relación'}
                >
                    <i class="bi bi-bezier2 me-1"></i>{drawMode ? 'Dibujando...' : 'Dibujar relación'}
                </button>

                <div class="vr" aria-hidden="true"></div>

                <span class="small text-muted" id="filter-label">Filtrar:</span>
                {#each NATURALEZA_OPTIONS as opt}
                    <button
                        class="btn btn-sm {activeRelFilter === opt.value ? 'btn-secondary' : 'btn-outline-secondary'}"
                        on:click={() => filterByRelation(opt.value)}
                        aria-pressed={activeRelFilter === opt.value}
                        aria-describedby="filter-label"
                    >{opt.label}</button>
                {/each}

                <div class="vr ms-auto" aria-hidden="true"></div>

                <button
                    class="btn btn-sm btn-outline-secondary"
                    on:click={zoomFit}
                    title="Centrar vista"
                    aria-label="Centrar vista"
                ><i class="bi bi-fullscreen"></i></button>

                <button
                    class="btn btn-sm btn-outline-secondary"
                    on:click={exportNetwork}
                    title="Exportar imagen PNG"
                    aria-label="Exportar imagen PNG"
                ><i class="bi bi-download"></i></button>

                <button class="btn btn-sm btn-success" on:click={() => openAdd()}>
                    <i class="bi bi-plus-lg me-1"></i>Nueva relación
                </button>
            </div>

            <!-- Canvas -->
            <div
                class="border rounded position-relative flex-grow-1"
                style="background: #f8f9fa; min-height: 0;"
                role="application"
                aria-label="Canvas de red de relaciones"
            >
                <div bind:this={canvasContainer} style="width: 100%; height: 100%;"></div>

                {#if drawMode}
                    <div
                        class="position-absolute top-0 start-0 w-100 text-center py-1"
                        style="background: rgba(231,76,60,0.1); pointer-events: none; font-size: 0.75rem; color: #c0392b; font-weight: 600; border-radius: 4px 4px 0 0;"
                        aria-live="polite"
                    >
                        <i class="bi bi-pencil me-1"></i>
                        Modo dibujo activo — arrastra desde un nodo hasta otro para crear una relación
                    </div>
                {/if}

                {#if canvasPersonas.length === 0}
                    <div
                        class="position-absolute top-50 start-50 translate-middle text-center text-muted"
                        style="pointer-events: none;"
                        aria-hidden="true"
                    >
                        <i class="bi bi-diagram-3 d-block mb-2" style="font-size: 3.5rem; opacity: 0.15;"></i>
                        <p class="mb-0 small">Canvas vacío.<br>Busca personas en el panel izquierdo.</p>
                    </div>
                {/if}
            </div>

            <!-- Legend -->
            <div class="d-flex align-items-center gap-3 mt-2 flex-wrap" style="font-size: 0.75rem;" aria-label="Leyenda">
                <span class="d-flex align-items-center gap-1">
                    <span class="rounded-circle d-inline-block flex-shrink-0" style="width:12px;height:12px;background:#C9735B;border:2px solid #A85A44;" aria-hidden="true"></span>
                    Esclavizada
                </span>
                <span class="d-flex align-items-center gap-1">
                    <span class="rounded-circle d-inline-block flex-shrink-0" style="width:12px;height:12px;background:#1ABC9C;border:2px solid #17A589;" aria-hidden="true"></span>
                    No esclavizada
                </span>
                <span class="d-flex align-items-center gap-1">
                    <span class="d-inline-block flex-shrink-0" style="width:20px;height:3px;background:#D4A27F;border-radius:2px;" aria-hidden="true"></span>
                    Familiar
                </span>
                <span class="d-flex align-items-center gap-1">
                    <span class="d-inline-block flex-shrink-0" style="width:20px;height:3px;background:#7BB97B;border-radius:2px;" aria-hidden="true"></span>
                    Temporal
                </span>
                <span class="d-flex align-items-center gap-1">
                    <span class="d-inline-block flex-shrink-0" style="width:20px;height:3px;background:#9B8EC4;border-radius:2px;" aria-hidden="true"></span>
                    Subordinación
                </span>
                <span class="d-flex align-items-center gap-1 ms-auto text-muted">
                    <i class="bi bi-info-circle" aria-hidden="true"></i>
                    Clic en un arco para editar o eliminar
                </span>
            </div>
        </div>
    </div>
</div>

<!-- Add / Edit SlideOver -->
<SlideOver
    bind:open={panelOpen}
    title={editingRel ? 'Editar relación' : 'Nueva relación'}
    on:close={closePanel}
>
    {#if formLoadingRel}
        <div class="d-flex justify-content-center py-5">
            <span class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Cargando...</span>
            </span>
        </div>
    {:else}
        <form on:submit|preventDefault={saveRelacion} novalidate>

            <div class="mb-3">
                <label class="form-label fw-semibold" for="naturaleza">
                    Naturaleza <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="naturaleza" class="form-select" bind:value={formNaturaleza} required>
                    <option value="">— Seleccionar —</option>
                    {#each NATURALEZA_OPTIONS as opt}
                        <option value={opt.value}>{opt.label}</option>
                    {/each}
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label fw-semibold" for="rel-documento">
                    Documento (ID) <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                    id="rel-documento"
                    type="number"
                    class="form-control"
                    bind:value={formDocumento}
                    placeholder="ID del documento"
                    required
                />
            </div>

            <div class="mb-3">
                <label class="form-label fw-semibold" for="rel-descripcion">Descripción</label>
                <input
                    id="rel-descripcion"
                    type="text"
                    class="form-control"
                    bind:value={formDescripcion}
                    maxlength="250"
                />
            </div>

            <div class="mb-3">
                <p class="form-label fw-semibold mb-1" id="form-personas-label">Personas involucradas</p>
                <div class="d-flex flex-wrap gap-1 mb-2" role="group" aria-labelledby="form-personas-label">
                    {#each formPersonas as fp}
                        <span class="badge bg-secondary d-flex align-items-center gap-1">
                            {fp.nombre_normalizado}
                            <button
                                type="button"
                                class="btn-close btn-close-white"
                                style="font-size: 0.6rem;"
                                aria-label="Quitar {fp.nombre_normalizado}"
                                on:click={() => removeFormPersona(fp.persona_id)}
                            ></button>
                        </span>
                    {/each}
                </div>
                <div class="position-relative">
                    <input
                        type="search"
                        class="form-control form-control-sm"
                        placeholder="Buscar y añadir persona..."
                        bind:value={formPersonaQuery}
                        on:input={onFormPersonaInput}
                        autocomplete="off"
                        aria-autocomplete="list"
                        aria-controls="form-persona-results"
                        aria-label="Buscar persona para añadir"
                    />
                    {#if formPersonaResults.length}
                        <ul
                            id="form-persona-results"
                            class="list-group position-absolute w-100 shadow-sm"
                            style="z-index: 1100; top: 100%;"
                            role="listbox"
                        >
                            {#each formPersonaResults as pe}
                                <li
                                    class="list-group-item list-group-item-action py-1"
                                    role="option"
                                    aria-selected="false"
                                    tabindex="0"
                                    on:click={() => addFormPersona(pe)}
                                    on:keydown={(e) => e.key === 'Enter' && addFormPersona(pe)}
                                    style="cursor: pointer;"
                                >
                                    <small>{pe.nombre_normalizado}</small>
                                    <small class="text-muted ms-1">{pe.persona_idno}</small>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>

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

            <div class="mb-3">
                <label class="form-label fw-semibold" for="rel-notas">Notas</label>
                <textarea id="rel-notas" class="form-control" rows="2" bind:value={formNotas} maxlength="500"></textarea>
            </div>

            {#if saveError}
                <div class="alert alert-danger py-2 mb-3" role="alert">
                    <small>{saveError}</small>
                </div>
            {/if}

            <div class="d-flex gap-2 flex-wrap">
                <button type="submit" class="btn btn-primary" disabled={formSaving}>
                    {#if formSaving}
                        <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                    {/if}
                    {editingRel ? 'Guardar cambios' : 'Crear relación'}
                </button>
                {#if editingRel}
                    <button
                        type="button"
                        class="btn btn-outline-danger"
                        on:click={() => { closePanel(); askDeleteFromEdge(editingRel.persona_relacion_id); }}
                    >
                        <i class="bi bi-trash me-1" aria-hidden="true"></i>Eliminar
                    </button>
                {/if}
                <button type="button" class="btn btn-outline-secondary" on:click={closePanel}>Cancelar</button>
            </div>
        </form>
    {/if}
</SlideOver>

<!-- Confirm delete -->
<ConfirmDelete
    bind:open={deleteConfirmOpen}
    inProgress={deleteInProgress}
    message="¿Eliminar esta relación? Esta acción no se puede deshacer."
    on:confirm={confirmDelete}
    on:cancel={cancelDelete}
/>
