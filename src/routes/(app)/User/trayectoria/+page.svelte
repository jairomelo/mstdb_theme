<script>
    import { onMount, onDestroy, tick } from 'svelte';
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import * as d3 from 'd3';
    import {
        whoami,
        searchPersonasEsclavizadas,
        personaLugarRelByPersona,
        createPersonaLugarRel,
        updatePersonaLugarRel,
        deletePersonaLugarRel,
        bulkUpdateOrdinal,
        updateLugar,
        searchLugares,
        situacionesLugar,
        peresclavizadas,
    } from '$lib/api';

    // ── Auth ─────────────────────────────────────────────────────────────────
    let currentUser = null;

    // ── Persona search ────────────────────────────────────────────────────────
    let personaQuery = '';
    let personaResults = [];
    let personaSearchTimer;
    let selectedPersona = null;

    // ── Trajectory data ───────────────────────────────────────────────────────
    let trajectoryPoints = [];   // sorted by ordinal
    let situaciones = [];
    let loading = false;
    let saveError = null;
    let saveSuccess = null;

    // ── Swap state ────────────────────────────────────────────────────────────
    let swapA = null;  // persona_x_lugares id of first selected point

    // ── Edit-punto state (SlideOver) ──────────────────────────────────────────
    let editingPoint = null;       // full point object being edited
    let editFecha = '';
    let editSituacion = '';
    let editNotas = '';
    let editSaving = false;

    // ── Edit-coordinates state (SlideOver) ────────────────────────────────────
    let editingCoords = null;      // {lugar_id, nombre_lugar, lat, lon}
    let editLat = '';
    let editLon = '';
    let coordSaving = false;

    // ── Add-point state (SlideOver) ───────────────────────────────────────────
    let addPanelOpen = false;
    let addLugarQuery = '';
    let addLugarResults = [];
    let addLugarTimer;
    let addSelectedLugar = null;
    let addOrdinal = '';
    let addSituacion = '';
    let addFecha = '';
    let addSaving = false;

    // ── Delete confirm ────────────────────────────────────────────────────────
    let deletingPoint = null;
    let deleteConfirmOpen = false;
    let deleteInProgress = false;

    // ── Map ───────────────────────────────────────────────────────────────────
    let L = null;
    let map = null;
    let mapSvg = null;
    let mapG = null;

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────
    onMount(async () => {
        try {
            currentUser = await whoami();
            const canEdit = currentUser.is_staff || currentUser.groups?.includes('colectores');
            if (!canEdit) {
                window.location.href = '/User/login';
                return;
            }
        } catch {
            window.location.href = '/User/login';
            return;
        }

        // Load controlled vocabulary
        try {
            const sv = await situacionesLugar();
            situaciones = sv.results ?? sv ?? [];
        } catch { situaciones = []; }

        // Pre-load persona from URL param
        const preloadId = $page.url.searchParams.get('persona_id');
        if (preloadId) {
            try {
                const pe = await peresclavizadas(preloadId);
                selectedPersona = pe;
                await loadTrajectory(preloadId);
            } catch { /* ignore, user can search manually */ }
        }
    });

    onDestroy(() => {
        if (map) { map.remove(); map = null; }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Persona search
    // ─────────────────────────────────────────────────────────────────────────
    function onPersonaInput() {
        clearTimeout(personaSearchTimer);
        if (personaQuery.trim().length < 2) { personaResults = []; return; }
        personaSearchTimer = setTimeout(async () => {
            try {
                const res = await searchPersonasEsclavizadas(personaQuery);
                personaResults = res.results ?? res ?? [];
            } catch { personaResults = []; }
        }, 300);
    }

    async function selectPersona(pe) {
        selectedPersona = pe;
        personaResults = [];
        personaQuery = '';
        await loadTrajectory(pe.persona_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Trajectory load
    // ─────────────────────────────────────────────────────────────────────────
    async function loadTrajectory(personaId) {
        loading = true;
        saveError = null;
        saveSuccess = null;
        swapA = null;
        try {
            const res = await personaLugarRelByPersona(personaId);
            const raw = res.results ?? res ?? [];
            trajectoryPoints = raw.sort((a, b) => a.ordinal - b.ordinal);
        } catch (e) {
            saveError = 'No se pudo cargar la trayectoria.';
        } finally {
            loading = false;
        }
        // loading must be false so #traj-map is in the DOM before initMap runs
        await tick();
        await initMap();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Map
    // ─────────────────────────────────────────────────────────────────────────
    async function initMap() {
        if (!browser) return;
        const container = document.getElementById('traj-map');
        if (!container) return;

        const leaflet = await import('leaflet');
        L = leaflet.default;

        if (map) { map.remove(); }

        const validPoints = trajectoryPoints.filter(p => p.lugar?.lat && p.lugar?.lon);
        const centerLat = validPoints[0]?.lugar?.lat ? parseFloat(validPoints[0].lugar.lat) : 17.0;
        const centerLon = validPoints[0]?.lugar?.lon ? parseFloat(validPoints[0].lugar.lon) : -96.7;

        map = L.map(container).setView([centerLat, centerLon], 6);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 10
        }).addTo(map);

        const svgEl = d3.select(map.getPanes().overlayPane).append('svg');
        mapSvg = svgEl;
        mapG = svgEl.append('g').attr('class', 'leaflet-zoom-hide');

        drawMap();
        map.on('zoomend moveend', drawMap);

        if (validPoints.length > 1) {
            map.fitBounds(L.latLngBounds(validPoints.map(p => [parseFloat(p.lugar.lat), parseFloat(p.lugar.lon)])), { padding: [30, 30] });
        }
    }

    function drawMap() {
        if (!map || !mapSvg || !mapG) return;
        const validPoints = trajectoryPoints.filter(p => p.lugar?.lat && p.lugar?.lon);

        const bounds = map.getBounds();
        const tl = map.latLngToLayerPoint(bounds.getNorthWest());
        const br = map.latLngToLayerPoint(bounds.getSouthEast());

        mapSvg
            .attr('width', br.x - tl.x)
            .attr('height', br.y - tl.y)
            .style('left', `${tl.x}px`)
            .style('top', `${tl.y}px`);
        mapG.attr('transform', `translate(${-tl.x},${-tl.y})`);
        mapG.selectAll('*').remove();

        function proj(lat, lon) {
            const pt = map.latLngToLayerPoint([lat, lon]);
            return [pt.x, pt.y];
        }

        // Draw arcs between consecutive points
        for (let i = 0; i < validPoints.length - 1; i++) {
            const a = validPoints[i];
            const b = validPoints[i + 1];
            const [x1, y1] = proj(parseFloat(a.lugar.lat), parseFloat(a.lugar.lon));
            const [x2, y2] = proj(parseFloat(b.lugar.lat), parseFloat(b.lugar.lon));
            const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
            const dr = Math.max(dist * 1.2, 60);
            mapG.append('path')
                .attr('d', `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`)
                .attr('stroke', '#e74c3c')
                .attr('stroke-width', 2.5)
                .attr('fill', 'none')
                .attr('opacity', 0.75);
        }

        // Draw circles
        validPoints.forEach((p, i) => {
            const [cx, cy] = proj(parseFloat(p.lugar.lat), parseFloat(p.lugar.lon));
            const isLocked = p.ordinal === 0;
            mapG.append('circle')
                .attr('cx', cx).attr('cy', cy).attr('r', 8)
                .attr('fill', isLocked ? '#f39c12' : '#e74c3c')
                .attr('stroke', '#fff').attr('stroke-width', 2).attr('opacity', 0.9);
            mapG.append('text')
                .attr('x', cx).attr('y', cy - 12)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px').attr('font-weight', 'bold')
                .attr('fill', '#2c3e50')
                .attr('stroke', '#fff').attr('stroke-width', 3).attr('paint-order', 'stroke')
                .text(`${i + 1}. ${p.lugar.nombre_lugar}`);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Swap
    // ─────────────────────────────────────────────────────────────────────────
    function toggleSwap(point) {
        if (point.ordinal === 0) return; // locked
        if (!swapA) {
            swapA = point.persona_x_lugares;
        } else {
            if (swapA === point.persona_x_lugares) { swapA = null; return; }
            confirmSwap(swapA, point.persona_x_lugares);
        }
    }

    async function confirmSwap(idA, idB) {
        const ptA = trajectoryPoints.find(p => p.persona_x_lugares === idA);
        const ptB = trajectoryPoints.find(p => p.persona_x_lugares === idB);
        swapA = null;
        if (!ptA || !ptB) return;
        saveError = null;
        try {
            await bulkUpdateOrdinal([
                { persona_x_lugares: idA, ordinal: ptB.ordinal },
                { persona_x_lugares: idB, ordinal: ptA.ordinal },
            ]);
            await loadTrajectory(selectedPersona.persona_id);
            saveSuccess = 'Posiciones intercambiadas.';
        } catch (e) {
            saveError = e.data?.errors ? JSON.stringify(e.data.errors) : 'Error al intercambiar posiciones.';
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edit point (fecha / situacion / notas)
    // ─────────────────────────────────────────────────────────────────────────
    function openEditPoint(point) {
        editingPoint = point;
        editFecha = point.fecha_inicial_lugar ?? '';
        editSituacion = typeof point.situacion_lugar === 'object'
            ? (point.situacion_lugar?.situacion_id ?? '')
            : (point.situacion_lugar ?? '');
        editNotas = point.notas ?? '';
    }

    function closeEditPoint() { editingPoint = null; }

    async function saveEditPoint() {
        editSaving = true;
        saveError = null;
        try {
            const payload = { notas: editNotas };
            if (editFecha) payload.fecha_inicial_lugar = editFecha;
            if (editSituacion !== '') payload.situacion_lugar = editSituacion || null;
            await updatePersonaLugarRel(editingPoint.persona_x_lugares, payload);
            closeEditPoint();
            await loadTrajectory(selectedPersona.persona_id);
            saveSuccess = 'Punto actualizado.';
        } catch (e) {
            saveError = 'Error al guardar el punto.';
        } finally {
            editSaving = false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edit coordinates
    // ─────────────────────────────────────────────────────────────────────────
    function openEditCoords(point) {
        editingCoords = { lugar_id: point.lugar.lugar_id, nombre_lugar: point.lugar.nombre_lugar };
        editLat = point.lugar.lat ?? '';
        editLon = point.lugar.lon ?? '';
    }

    function closeEditCoords() { editingCoords = null; }

    async function saveEditCoords() {
        coordSaving = true;
        saveError = null;
        try {
            await updateLugar(editingCoords.lugar_id, { lat: editLat, lon: editLon });
            closeEditCoords();
            await loadTrajectory(selectedPersona.persona_id);
            saveSuccess = 'Coordenadas actualizadas.';
        } catch {
            saveError = 'Error al guardar las coordenadas.';
        } finally {
            coordSaving = false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete
    // ─────────────────────────────────────────────────────────────────────────
    function openDelete(point) {
        deletingPoint = point;
        deleteConfirmOpen = true;
    }

    function cancelDelete() { deleteConfirmOpen = false; deletingPoint = null; }

    async function confirmDelete() {
        deleteInProgress = true;
        saveError = null;
        try {
            await deletePersonaLugarRel(deletingPoint.persona_x_lugares);
            cancelDelete();
            await loadTrajectory(selectedPersona.persona_id);
            saveSuccess = 'Punto eliminado.';
        } catch {
            saveError = 'Error al eliminar el punto.';
        } finally {
            deleteInProgress = false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Add point
    // ─────────────────────────────────────────────────────────────────────────
    function onAddLugarInput() {
        clearTimeout(addLugarTimer);
        addSelectedLugar = null;
        if (addLugarQuery.trim().length < 2) { addLugarResults = []; return; }
        addLugarTimer = setTimeout(async () => {
            try {
                const res = await searchLugares(addLugarQuery);
                addLugarResults = res.results ?? res ?? [];
            } catch { addLugarResults = []; }
        }, 300);
    }

    function selectAddLugar(l) {
        addSelectedLugar = l;
        addLugarQuery = l.nombre_lugar;
        addLugarResults = [];
    }

    async function saveAddPoint() {
        if (!addSelectedLugar || !addOrdinal || addOrdinal == 0) {
            saveError = 'Lugar y ordinal (distinto de 0) son obligatorios.';
            return;
        }
        addSaving = true;
        saveError = null;
        try {
            const payload = {
                documento: selectedPersona.documentos?.[0]?.documento_id ?? selectedPersona.documentos?.[0],
                lugar: addSelectedLugar.lugar_id,
                ordinal: parseInt(addOrdinal),
                personas: [selectedPersona.persona_id],
            };
            if (addSituacion) payload.situacion_lugar = parseInt(addSituacion);
            if (addFecha) payload.fecha_inicial_lugar = addFecha;
            await createPersonaLugarRel(payload);
            addPanelOpen = false;
            addLugarQuery = ''; addSelectedLugar = null; addOrdinal = ''; addSituacion = ''; addFecha = '';
            await loadTrajectory(selectedPersona.persona_id);
            saveSuccess = 'Punto añadido.';
        } catch (e) {
            saveError = e.data ? JSON.stringify(e.data) : 'Error al añadir el punto.';
        } finally {
            addSaving = false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    function dismissAlert() { saveError = null; saveSuccess = null; }

    $: if (trajectoryPoints.length && map) {
        drawMap();
    }
</script>

<svelte:head>
    <title>Editar trayectoria — Trayectorias Afro</title>
</svelte:head>

<div class="container-fluid mt-3">
    <div class="d-flex align-items-center justify-content-between mb-3">
        <h1 class="h4 mb-0"><i class="bi bi-map me-2"></i>Editar trayectoria</h1>
        <a href="/User/dashboard" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i>Dashboard
        </a>
    </div>

    <!-- Alerts -->
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
                />
                {#if personaResults.length}
                    <ul class="list-group position-absolute w-100 shadow-sm" style="z-index:1050; top:100%;">
                        {#each personaResults as pe}
                            <li class="list-group-item list-group-item-action" style="cursor:pointer;" on:click={() => selectPersona(pe)}>
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
                    <button class="btn btn-link btn-sm p-0 text-muted" on:click={() => { selectedPersona = null; trajectoryPoints = []; if (map) { map.remove(); map = null; } }}>
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
        <div class="row g-3">
            <!-- Left: trajectory list -->
            <div class="col-lg-5">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span class="fw-semibold">
                            <i class="bi bi-list-ol me-1"></i>
                            Puntos ({trajectoryPoints.length})
                        </span>
                        <div class="d-flex gap-2 align-items-center">
                            {#if swapA}
                                <span class="badge bg-warning text-dark">
                                    <i class="bi bi-arrow-left-right me-1"></i>Selecciona el 2.° punto
                                </span>
                                <button class="btn btn-sm btn-outline-secondary" on:click={() => swapA = null}>Cancelar</button>
                            {/if}
                            <button class="btn btn-sm btn-success" on:click={() => addPanelOpen = true}>
                                <i class="bi bi-plus-lg me-1"></i>Añadir
                            </button>
                        </div>
                    </div>
                    <div class="card-body p-0" style="overflow-y:auto; max-height:65vh;">
                        {#if trajectoryPoints.length === 0}
                            <p class="text-muted text-center py-4">No hay puntos de trayectoria registrados.</p>
                        {:else}
                            {#each trajectoryPoints as point, i}
                                {@const isLocked = point.ordinal === 0}
                                {@const isSwapA = swapA === point.persona_x_lugares}
                                <div
                                    class="traj-point-card"
                                    class:traj-locked={isLocked}
                                    class:traj-swap-selected={isSwapA}
                                >
                                    <div class="d-flex align-items-start gap-2">
                                        <!-- Ordinal badge -->
                                        <div class="traj-ordinal" class:traj-ordinal-locked={isLocked}>
                                            {isLocked ? '⚓' : point.ordinal}
                                        </div>
                                        <div class="flex-grow-1 min-width-0">
                                            <div class="fw-semibold text-truncate">
                                                {point.lugar?.nombre_lugar ?? '—'}
                                            </div>
                                            <small class="text-muted d-block">
                                                {point.situacion_lugar ?? '—'}
                                                {#if point.fecha_inicial_lugar} · {point.fecha_inicial_lugar}{/if}
                                            </small>
                                            {#if point.documento}
                                                <small class="text-muted d-block text-truncate">
                                                    <i class="bi bi-file-text me-1"></i>{point.documento.titulo ?? point.documento}
                                                </small>
                                            {/if}
                                        </div>
                                        <!-- Actions -->
                                        <div class="d-flex flex-column gap-1">
                                            {#if !isLocked}
                                                <button
                                                    class="btn btn-sm"
                                                    class:btn-outline-warning={!isSwapA}
                                                    class:btn-warning={isSwapA}
                                                    title={isSwapA ? 'Cancelar selección' : 'Intercambiar posición'}
                                                    on:click={() => toggleSwap(point)}
                                                >
                                                    <i class="bi bi-arrow-left-right"></i>
                                                </button>
                                            {:else}
                                                <span class="btn btn-sm btn-outline-secondary disabled" title="Punto de evento (no intercambiable)">
                                                    <i class="bi bi-lock"></i>
                                                </span>
                                            {/if}
                                            <button class="btn btn-sm btn-outline-primary" title="Editar fecha y situación" on:click={() => openEditPoint(point)}>
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-secondary" title="Editar coordenadas del lugar" on:click={() => openEditCoords(point)}>
                                                <i class="bi bi-geo"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" title="Eliminar punto" on:click={() => openDelete(point)}>
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Right: map -->
            <div class="col-lg-7">
                <div class="card h-100">
                    <div class="card-header">
                        <span class="fw-semibold"><i class="bi bi-map me-1"></i>Mapa</span>
                        <small class="text-muted ms-2">Se actualiza automáticamente</small>
                    </div>
                    <div class="card-body p-0">
                        <div id="traj-map" style="height: 65vh; border-radius: 0 0 0.375rem 0.375rem;"></div>
                    </div>
                </div>
            </div>
        </div>
    {:else if currentUser}
        <div class="text-center text-muted py-5">
            <i class="bi bi-search" style="font-size:2.5rem;"></i>
            <p class="mt-2">Busca una persona esclavizada para editar su trayectoria.</p>
        </div>
    {/if}
</div>

<!-- ── SlideOver: Edit point ─────────────────────────────────────────────── -->
{#if editingPoint}
    <div class="slideover-backdrop" on:click={closeEditPoint}></div>
    <div class="slideover" role="dialog" aria-modal="true" aria-label="Editar punto">
        <div class="slideover-header">
            <h5 class="mb-0"><i class="bi bi-pencil me-2"></i>Editar punto</h5>
            <button class="btn-close" on:click={closeEditPoint}></button>
        </div>
        <div class="slideover-body">
            <p class="fw-semibold">{editingPoint.lugar?.nombre_lugar}</p>
            <div class="mb-3">
                <label class="form-label" for="edit-fecha">Fecha inicial</label>
                <input id="edit-fecha" type="date" class="form-control" bind:value={editFecha} />
            </div>
            <div class="mb-3">
                <label class="form-label" for="edit-situacion">Situación del lugar</label>
                <select id="edit-situacion" class="form-select" bind:value={editSituacion}>
                    <option value="">— Sin especificar —</option>
                    {#each situaciones as s}
                        <option value={s.situacion_id}>{s.situacion}</option>
                    {/each}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label" for="edit-notas">Notas</label>
                <textarea id="edit-notas" class="form-control" rows="3" bind:value={editNotas}></textarea>
            </div>
        </div>
        <div class="slideover-footer">
            <button class="btn btn-secondary" on:click={closeEditPoint}>Cancelar</button>
            <button class="btn btn-primary" disabled={editSaving} on:click={saveEditPoint}>
                {#if editSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Guardar
            </button>
        </div>
    </div>
{/if}

<!-- ── SlideOver: Edit coordinates ──────────────────────────────────────── -->
{#if editingCoords}
    <div class="slideover-backdrop" on:click={closeEditCoords}></div>
    <div class="slideover" role="dialog" aria-modal="true" aria-label="Editar coordenadas">
        <div class="slideover-header">
            <h5 class="mb-0"><i class="bi bi-geo me-2"></i>Editar coordenadas</h5>
            <button class="btn-close" on:click={closeEditCoords}></button>
        </div>
        <div class="slideover-body">
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Atención:</strong> <em>{editingCoords.nombre_lugar}</em> es un lugar compartido.
                Los cambios afectarán a <strong>todas las personas</strong> que tengan este lugar en su trayectoria.
            </div>
            <div class="mb-3">
                <label class="form-label" for="edit-lat">Latitud</label>
                <input id="edit-lat" type="number" step="0.000001" class="form-control" bind:value={editLat} />
            </div>
            <div class="mb-3">
                <label class="form-label" for="edit-lon">Longitud</label>
                <input id="edit-lon" type="number" step="0.000001" class="form-control" bind:value={editLon} />
            </div>
        </div>
        <div class="slideover-footer">
            <button class="btn btn-secondary" on:click={closeEditCoords}>Cancelar</button>
            <button class="btn btn-primary" disabled={coordSaving} on:click={saveEditCoords}>
                {#if coordSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Guardar coordenadas
            </button>
        </div>
    </div>
{/if}

<!-- ── SlideOver: Add point ──────────────────────────────────────────────── -->
{#if addPanelOpen}
    <div class="slideover-backdrop" on:click={() => addPanelOpen = false}></div>
    <div class="slideover" role="dialog" aria-modal="true" aria-label="Añadir punto">
        <div class="slideover-header">
            <h5 class="mb-0"><i class="bi bi-plus-circle me-2"></i>Añadir punto</h5>
            <button class="btn-close" on:click={() => addPanelOpen = false}></button>
        </div>
        <div class="slideover-body">
            <!-- Lugar search -->
            <div class="mb-3">
                <label class="form-label" for="add-lugar">Lugar <span class="text-danger">*</span></label>
                <input
                    id="add-lugar"
                    type="search"
                    class="form-control"
                    placeholder="Buscar lugar…"
                    bind:value={addLugarQuery}
                    on:input={onAddLugarInput}
                    autocomplete="off"
                />
                {#if addLugarResults.length}
                    <ul class="list-group w-100 shadow-sm mt-1" style="max-height:200px; overflow-y:auto;">
                        {#each addLugarResults as l}
                            <li class="list-group-item list-group-item-action" style="cursor:pointer;" on:click={() => selectAddLugar(l)}>
                                {l.nombre_lugar} <small class="text-muted">({l.tipo})</small>
                            </li>
                        {/each}
                    </ul>
                {/if}
                {#if addSelectedLugar}
                    <div class="mt-1">
                        <span class="badge bg-success">{addSelectedLugar.nombre_lugar}</span>
                    </div>
                {/if}
            </div>
            <!-- Ordinal -->
            <div class="mb-3">
                <label class="form-label" for="add-ordinal">
                    Ordinal <span class="text-danger">*</span>
                    <small class="text-muted ms-1">(no puede ser 0)</small>
                </label>
                <input id="add-ordinal" type="number" class="form-control" bind:value={addOrdinal} placeholder="e.g. 1, 2, -1…" />
            </div>
            <!-- Situacion -->
            <div class="mb-3">
                <label class="form-label" for="add-situacion">Situación del lugar</label>
                <select id="add-situacion" class="form-select" bind:value={addSituacion}>
                    <option value="">— Sin especificar —</option>
                    {#each situaciones as s}
                        <option value={s.situacion_id}>{s.situacion}</option>
                    {/each}
                </select>
            </div>
            <!-- Fecha -->
            <div class="mb-3">
                <label class="form-label" for="add-fecha">Fecha inicial</label>
                <input id="add-fecha" type="date" class="form-control" bind:value={addFecha} />
            </div>
            {#if saveError}
                <div class="alert alert-danger py-2">{saveError}</div>
            {/if}
        </div>
        <div class="slideover-footer">
            <button class="btn btn-secondary" on:click={() => addPanelOpen = false}>Cancelar</button>
            <button class="btn btn-success" disabled={addSaving || !addSelectedLugar} on:click={saveAddPoint}>
                {#if addSaving}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                Añadir punto
            </button>
        </div>
    </div>
{/if}

<!-- ── Delete confirm modal ──────────────────────────────────────────────── -->
{#if deleteConfirmOpen && deletingPoint}
    <div class="modal-backdrop-custom" role="presentation"></div>
    <div class="modal-dialog-custom" role="dialog" aria-modal="true">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Eliminar punto</h5>
            </div>
            <div class="modal-body">
                <p>¿Eliminar <strong>{deletingPoint.lugar?.nombre_lugar}</strong> (ordinal {deletingPoint.ordinal}) de la trayectoria?</p>
                <p class="text-muted small">Esta acción no puede deshacerse.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" on:click={cancelDelete}>Cancelar</button>
                <button class="btn btn-danger" disabled={deleteInProgress} on:click={confirmDelete}>
                    {#if deleteInProgress}<span class="spinner-border spinner-border-sm me-1"></span>{/if}
                    Eliminar
                </button>
            </div>
        </div>
    </div>
{/if}
