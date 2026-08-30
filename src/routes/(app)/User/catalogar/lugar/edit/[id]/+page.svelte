<script>
    import { onMount, onDestroy, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import {
        lugares, updateLugar, mergeCandidates, mergeExecute, mergeSuggest, whoami,
    } from '$lib/api';
    import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';
    import FormField from '$lib/components/forms/FormField.svelte';
    import { loginUrl } from '$lib/auth';

    export let data;

    let me = null;
    let lugar = null;
    let loadError = null;

    // Form fields
    let nombre_lugar = '';
    let otros_nombres = '';
    let tipo = null;        // { value: id, label: string }
    let es_parte_de = null; // { value: id, label: string }
    let lat = '';
    let lon = '';

    let saving = false;
    let saveError = null;
    let saveSuccess = false;
    let formErrors = {};

    // Map
    let L = null;
    let map = null;
    let marker = null;
    let mapContainer;

    // Merge candidates
    let candidates = [];
    let candidatesLoading = false;

    // Merge confirmation state
    let mergeTarget = null;
    let mergeInProgress = false;
    let mergeError = null;
    let mergeSuccess = null;

    onMount(async () => {
        if (!browser) return;
        try {
            me = await whoami();
            const allowed = me?.is_staff || me?.groups?.includes('colectores');
            if (!allowed) { goto(loginUrl()); return; }
        } catch {
            goto(loginUrl());
            return;
        }
        try {
            lugar = await lugares(data.id);
            populateForm();
            await tick(); // wait for {#if lugar} block to render the map container
            await initMap();
            await loadCandidates();
        } catch (e) {
            loadError = e.message ?? 'No se pudo cargar el lugar.';
        }
    });

    onDestroy(() => {
        if (map) { try { map.remove(); } catch {} }
    });

    function populateForm() {
        nombre_lugar  = lugar.nombre_lugar ?? '';
        otros_nombres = lugar.otros_nombres ?? '';
        lat = lugar.lat  != null ? String(lugar.lat)  : '';
        lon = lugar.lon  != null ? String(lugar.lon)  : '';
        tipo = lugar.tipo_id != null
            ? { value: lugar.tipo_id, label: lugar.tipo ?? '' }
            : null;
        es_parte_de = lugar.es_parte_de != null
            ? { value: lugar.es_parte_de.lugar_id, label: lugar.es_parte_de.nombre_lugar }
            : null;
    }

    async function initMap() {
        if (!browser || !mapContainer) return;
        const leaflet = await import('leaflet');
        L = leaflet.default;
        if (map) map.remove();

        const hasCoords = lugar.lat != null && lugar.lon != null;
        const center = hasCoords ? [parseFloat(lugar.lat), parseFloat(lugar.lon)] : [4.5, -74.0];

        map = L.map(mapContainer).setView(center, hasCoords ? 6 : 5);
        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
            { attribution: 'Tiles &copy; Esri', maxZoom: 8 }
        ).addTo(map);

        if (hasCoords) placeMarker(parseFloat(lugar.lat), parseFloat(lugar.lon));

        map.on('click', (e) => placeMarker(e.latlng.lat, e.latlng.lng));
    }

    function placeMarker(latV, lonV) {
        if (!L || !map) return;
        if (marker) marker.remove();
        marker = L.circleMarker([latV, lonV], {
            radius: 9, fillColor: '#e74c3c', color: '#c0392b',
            weight: 2, opacity: 1, fillOpacity: 0.85,
        }).addTo(map).bindPopup(nombre_lugar || 'Nuevo punto');
        lat = String(parseFloat(latV.toFixed(6)));
        lon = String(parseFloat(lonV.toFixed(6)));
    }

    // Keep marker label in sync with nombre_lugar changes
    $: if (marker) {
        try { marker.setPopupContent(nombre_lugar || 'Nuevo punto'); } catch {}
    }

    function coordError() {
        const latN = lat !== '' ? Number(lat) : null;
        const lonN = lon !== '' ? Number(lon) : null;
        if ((latN === null) !== (lonN === null))
            return 'Latitud y longitud deben proporcionarse juntas.';
        return null;
    }

    async function handleSave() {
        formErrors = {};
        saveError = null;
        saveSuccess = false;

        const coordErr = coordError();
        if (coordErr) { formErrors = { lat: [coordErr] }; return; }

        saving = true;
        try {
            const payload = {
                nombre_lugar,
                otros_nombres: otros_nombres || null,
                tipo: tipo?.value ?? null,
                es_parte_de: es_parte_de?.value ?? null,
                lat: lat !== '' ? Number(lat) : null,
                lon: lon !== '' ? Number(lon) : null,
            };
            await updateLugar(data.id, payload);
            // Re-fetch to get fresh detail (including tipo_id, es_parte_de)
            lugar = await lugares(data.id);
            populateForm();
            saveSuccess = true;
            await loadCandidates();
        } catch (e) {
            if (e.data) {
                formErrors = e.data;
                saveError = 'Corrige los errores del formulario.';
            } else {
                saveError = 'Error al guardar los cambios.';
            }
        } finally {
            saving = false;
        }
    }

    function fieldError(field) {
        const e = formErrors[field];
        return Array.isArray(e) ? e.join(' ') : (e ?? null);
    }

    async function loadCandidates() {
        if (!lugar?.nombre_lugar || lugar.nombre_lugar.length < 2) return;
        candidatesLoading = true;
        try {
            const res = await mergeCandidates('lug', lugar.nombre_lugar);
            const currentId = String(lugar.lugar_id);
            candidates = (res.results ?? res ?? []).filter(c => String(c.id) !== currentId);
        } catch {
            candidates = [];
        } finally {
            candidatesLoading = false;
        }
    }

    function startMerge(candidate) {
        mergeTarget = candidate;
        mergeError = null;
    }

    function cancelMerge() {
        mergeTarget = null;
        mergeError = null;
    }

    async function executeMerge() {
        if (!mergeTarget) return;
        mergeInProgress = true;
        mergeError = null;
        try {
            await mergeExecute({
                entity: 'lug',
                canonical_id: lugar.lugar_id,
                duplicate_id: mergeTarget.id,
            });
            mergeSuccess = `Fusión completada: "${mergeTarget.label}" absorbido en "${lugar.nombre_lugar}".`;
            candidates = candidates.filter(c => c !== mergeTarget);
            cancelMerge();
        } catch (e) {
            mergeError = e.data?.error ?? 'Error ejecutando la fusión.';
        } finally {
            mergeInProgress = false;
        }
    }

    async function suggestMerge() {
        if (!mergeTarget) return;
        mergeInProgress = true;
        mergeError = null;
        try {
            await mergeSuggest({
                entity: 'lug',
                canonical_id: lugar.lugar_id,
                duplicate_id: mergeTarget.id,
            });
            mergeSuccess = `Sugerencia enviada: "${mergeTarget.label}" como posible duplicado.`;
            cancelMerge();
        } catch (e) {
            mergeError = e.data?.error ?? 'Error al enviar la sugerencia.';
        } finally {
            mergeInProgress = false;
        }
    }

    function similarityBadgeClass(score) {
        if (score >= 90) return 'bg-danger';
        if (score >= 70) return 'bg-warning text-dark';
        return 'bg-secondary';
    }
</script>

<svelte:head>
    <title>{lugar ? `Editar — ${lugar.nombre_lugar}` : 'Editar lugar'} — Trayectorias Afro</title>
</svelte:head>

<div class="container-fluid mt-3">

    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
            <li class="breadcrumb-item"><a href="/Detail/lugar/{data.id}">
                {lugar?.nombre_lugar ?? `Lugar ${data.id}`}
            </a></li>
            <li class="breadcrumb-item active" aria-current="page">Editar</li>
        </ol>
    </nav>

    {#if loadError}
        <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{loadError}
        </div>
    {:else if !lugar}
        <div class="d-flex justify-content-center py-5">
            <span class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Cargando…</span>
            </span>
        </div>
    {:else}
        <div class="d-flex align-items-center justify-content-between mb-3">
            <h1 class="h4 mb-0">
                <i class="bi bi-geo-alt me-2"></i>Editar lugar
                <span class="text-muted fw-normal">— {lugar.nombre_lugar}</span>
            </h1>
            <a href="/Detail/lugar/{data.id}" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-arrow-left me-1"></i>Ver detalle
            </a>
        </div>

        {#if saveSuccess}
            <div class="alert alert-success alert-dismissible py-2 mb-3" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>Cambios guardados correctamente.
                <button type="button" class="btn-close" aria-label="Cerrar"
                    on:click={() => saveSuccess = false}></button>
            </div>
        {/if}
        {#if saveError}
            <div class="alert alert-danger alert-dismissible py-2 mb-3" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{saveError}
                <button type="button" class="btn-close" aria-label="Cerrar"
                    on:click={() => saveError = null}></button>
            </div>
        {/if}
        {#if mergeSuccess}
            <div class="alert alert-success alert-dismissible py-2 mb-3" role="alert">
                <i class="bi bi-git me-2"></i>{mergeSuccess}
                <button type="button" class="btn-close" aria-label="Cerrar"
                    on:click={() => mergeSuccess = null}></button>
            </div>
        {/if}

        <div class="row g-3">

            <!-- ── Left: edit form ── -->
            <div class="col-lg-5">
                <div class="card h-100">
                    <div class="card-header fw-semibold">
                        <i class="bi bi-pencil-square me-1"></i>Datos del lugar
                    </div>
                    <div class="card-body">
                        <form on:submit|preventDefault={handleSave} novalidate>

                            <FormField label="Nombre del lugar" id="nombre_lugar" required
                                error={fieldError('nombre_lugar')}>
                                <input
                                    id="nombre_lugar"
                                    class="form-control"
                                    class:is-invalid={fieldError('nombre_lugar')}
                                    bind:value={nombre_lugar}
                                    required
                                    maxlength="255"
                                />
                            </FormField>

                            <FormField label="Tipo de lugar" id="tipo" error={fieldError('tipo')}>
                                <SearchableSelect
                                    id="tipo"
                                    bind:value={tipo}
                                    endpoint="vocabularios/tipos-lugar/"
                                    placeholder="Buscar tipo…"
                                />
                            </FormField>

                            <FormField label="Es parte de" id="es_parte_de"
                                error={fieldError('es_parte_de')}
                                hint="Lugar geográfico que lo contiene">
                                <SearchableSelect
                                    id="es_parte_de"
                                    bind:value={es_parte_de}
                                    endpoint="lugares/"
                                    placeholder="Buscar lugar contenedor…"
                                />
                            </FormField>

                            <div class="row g-2 mb-3">
                                <div class="col-6">
                                    <FormField label="Latitud" id="lat" error={fieldError('lat')}
                                        hint="Ej. 4.710989">
                                        <input
                                            id="lat"
                                            type="number"
                                            step="any"
                                            min="-90"
                                            max="90"
                                            class="form-control"
                                            class:is-invalid={fieldError('lat')}
                                            bind:value={lat}
                                        />
                                    </FormField>
                                </div>
                                <div class="col-6">
                                    <FormField label="Longitud" id="lon" error={fieldError('lon')}
                                        hint="Ej. -74.072090">
                                        <input
                                            id="lon"
                                            type="number"
                                            step="any"
                                            min="-180"
                                            max="180"
                                            class="form-control"
                                            class:is-invalid={fieldError('lon')}
                                            bind:value={lon}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            <FormField label="Otros nombres" id="otros_nombres"
                                error={fieldError('otros_nombres')}
                                hint="Variantes, nombres históricos o alternativos">
                                <textarea
                                    id="otros_nombres"
                                    class="form-control"
                                    rows="2"
                                    bind:value={otros_nombres}
                                ></textarea>
                            </FormField>

                            {#if formErrors.__all__}
                                <div class="alert alert-danger py-2 mb-3" role="alert">
                                    <small>{formErrors.__all__.join(' ')}</small>
                                </div>
                            {/if}

                            <div class="d-flex gap-2 mt-3">
                                <button type="submit" class="btn btn-primary" disabled={saving}>
                                    {#if saving}
                                        <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                                    {/if}
                                    Guardar cambios
                                </button>
                                <a href="/Detail/lugar/{data.id}" class="btn btn-outline-secondary">
                                    Cancelar
                                </a>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            <!-- ── Right: map + candidates ── -->
            <div class="col-lg-7 d-flex flex-column gap-3">

                <!-- Map card -->
                <div class="card">
                    <div class="card-header fw-semibold">
                        <i class="bi bi-map me-1"></i>Ubicación geográfica
                    </div>
                    <div bind:this={mapContainer} style="height: 320px;"></div>
                    <div class="card-footer text-muted small py-1">
                        <i class="bi bi-cursor me-1"></i>
                        Haz clic en el mapa para colocar o mover el marcador y actualizar las coordenadas.
                    </div>
                </div>

                <!-- Merge candidates card -->
                <div class="card">
                    <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
                        <span><i class="bi bi-git me-1"></i>Posibles duplicados</span>
                        {#if candidatesLoading}
                            <span class="spinner-border spinner-border-sm text-secondary" role="status" aria-label="Buscando"></span>
                        {:else}
                            <span class="badge bg-secondary">{candidates.length}</span>
                        {/if}
                    </div>

                    {#if candidates.length === 0 && !candidatesLoading}
                        <div class="card-body text-muted small text-center py-3">
                            <i class="bi bi-check-circle text-success me-1"></i>
                            No se encontraron lugares con nombre similar.
                        </div>
                    {:else}
                        <ul class="list-group list-group-flush">
                            {#each candidates as c}
                                <li class="list-group-item py-2 px-3">
                                    {#if mergeTarget === c}
                                        <!-- Inline confirmation -->
                                        <div class="d-flex flex-column gap-2">
                                            <div class="alert alert-warning py-2 mb-0 small" role="note">
                                                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                                                <strong>Confirmar:</strong>
                                                <span class="text-success fw-semibold">"{lugar.nombre_lugar}"</span>
                                                absorberá a
                                                <span class="text-danger fw-semibold">"{c.label}"</span>
                                                {#if !me?.is_staff}
                                                    (se enviará como sugerencia al staff)
                                                {:else}
                                                    (operación irreversible)
                                                {/if}
                                            </div>
                                            {#if mergeError}
                                                <div class="alert alert-danger py-1 mb-0 small" role="alert">{mergeError}</div>
                                            {/if}
                                            <div class="d-flex gap-2">
                                                {#if me?.is_staff}
                                                    <button
                                                        class="btn btn-sm btn-danger"
                                                        on:click={executeMerge}
                                                        disabled={mergeInProgress}
                                                    >
                                                        {#if mergeInProgress}
                                                            <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                                                        {/if}
                                                        <i class="bi bi-git me-1"></i>Fusionar
                                                    </button>
                                                {:else}
                                                    <button
                                                        class="btn btn-sm btn-warning"
                                                        on:click={suggestMerge}
                                                        disabled={mergeInProgress}
                                                    >
                                                        {#if mergeInProgress}
                                                            <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                                                        {/if}
                                                        <i class="bi bi-flag me-1"></i>Sugerir fusión
                                                    </button>
                                                {/if}
                                                <button
                                                    class="btn btn-sm btn-outline-secondary"
                                                    on:click={cancelMerge}
                                                    disabled={mergeInProgress}
                                                >Cancelar</button>
                                            </div>
                                        </div>
                                    {:else}
                                        <div class="d-flex align-items-center justify-content-between gap-2">
                                            <div class="flex-grow-1 min-width-0">
                                                <span class="fw-semibold small">{c.label}</span>
                                                <span class="text-muted small ms-1">ID {c.id}</span>
                                            </div>
                                            <div class="d-flex align-items-center gap-2 flex-shrink-0">
                                                <span class="badge {similarityBadgeClass(c.score)}" title="Similitud: {c.score}%">
                                                    {c.score}%
                                                </span>
                                                <a
                                                    href="/Detail/lugar/{c.id}"
                                                    class="btn btn-sm btn-outline-secondary py-0 px-2"
                                                    target="_blank"
                                                    rel="noopener"
                                                    title="Ver este lugar"
                                                    aria-label="Ver {c.label}"
                                                >
                                                    <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                                                </a>
                                                <button
                                                    class="btn btn-sm btn-outline-warning py-0 px-2"
                                                    on:click={() => startMerge(c)}
                                                    title="Marcar como duplicado de {lugar.nombre_lugar}"
                                                    aria-label="Fusionar {c.label} en {lugar.nombre_lugar}"
                                                >
                                                    <i class="bi bi-git" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </div>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                        {#if !me?.is_staff}
                            <div class="card-footer text-muted small py-1">
                                <i class="bi bi-info-circle me-1"></i>
                                Como colector puedes sugerir fusiones; el staff las ejecutará.
                            </div>
                        {/if}
                    {/if}
                </div>

            </div>
        </div>
    {/if}
</div>
