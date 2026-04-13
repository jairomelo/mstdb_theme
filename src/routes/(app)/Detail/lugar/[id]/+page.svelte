<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { tooltip } from '$lib/bootstrap-actions.js';
	import { lugares, lugarPersonasRelacionadas, lugarProcedencia } from '$lib/api';


	export let data;
	let lugar = null;
	let error = null;
	let personasRelacionadas = [];
	let currentPage = 1;
    let totalPages = 1;
    let loading = false;

	let procedenciaPersonas = [];
	let procPage = 1;
	let procTotalPages = 1;
	let procLoading = false;

	let L = null;
	let map = null;

	onMount(async () => {
		try {
			lugar = await lugares(data.id);
            await loadPersonas(1);
			if (lugar.procedencia_count > 0) {
				await loadProcedencia(1);
			}
			await initializeMap();
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch lugar:', e);
		}
	});

	onDestroy(() => {
		if (map) { map.remove(); map = null; }
	});

	async function initializeMap() {
		if (!browser || !lugar || !lugar.lat || !lugar.lon) return;
		const container = document.getElementById('lugar-map');
		if (!container) return;
		const leaflet = await import('leaflet');
		L = leaflet.default;
		if (map) { map.remove(); }
		const lat = parseFloat(lugar.lat);
		const lon = parseFloat(lugar.lon);
		map = L.map(container).setView([lat, lon], 6);
		L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
			maxZoom: 8
		}).addTo(map);
		L.circleMarker([lat, lon], {
			radius: 8, fillColor: '#e74c3c', color: '#c0392b',
			weight: 2, opacity: 1, fillOpacity: 0.8
		}).addTo(map).bindPopup(`<strong>${lugar.nombre_lugar}</strong><br>${lugar.tipo}`);
	}

	async function loadPersonas(page) {
        if (loading) return;
        loading = true;
        try {
            const response = await lugarPersonasRelacionadas(data.id, page);
            personasRelacionadas = response.results;
            currentPage = page;
            totalPages = Math.ceil(response.count / 20); 
        } catch (e) {
            console.error('Failed to fetch personas:', e);
        } finally {
            loading = false;
        }
    }

	async function loadProcedencia(page) {
		if (procLoading) return;
		procLoading = true;
		try {
			const response = await lugarProcedencia(data.id, page);
			procedenciaPersonas = response.results;
			procPage = page;
			procTotalPages = Math.ceil(response.count / 20);
		} catch (e) {
			console.error('Failed to fetch procedencia:', e);
		} finally {
			procLoading = false;
		}
	}

    function nextPage() {
        if (currentPage < totalPages) {
            loadPersonas(currentPage + 1);
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            loadPersonas(currentPage - 1);
        }
    }

	function procNextPage() {
		if (procPage < procTotalPages) loadProcedencia(procPage + 1);
	}
	function procPrevPage() {
		if (procPage > 1) loadProcedencia(procPage - 1);
	}

	function personaDetailPath(persona) {
		const ct = persona.polymorphic_ctype;
		const isEsclavizada = ct === 25 || (typeof ct === 'string' && ct.includes('esclavizada'));
		return isEsclavizada ? 'personaesclavizada' : 'personanoesclavizada';
	}
</script>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if lugar}
		<div class="card mb-4">
			<div class="card-header bg-primary text-white">
				<h1 class="card-title mb-0">{lugar.nombre_lugar} ({lugar.tipo})</h1>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<p>
							<strong><i class="bi bi-fingerprint me-2"></i>Otros nombres:</strong>
							{lugar.otros_nombres || 'ninguno'}
						</p>
					</div>
					<div class="col-md-6">
						<p>
							<strong><i class="bi bi-file-earmark-text me-2"></i>Localización (georreferenciación):</strong>
							{lugar.lat || 'latitud'},{lugar.lon || 'longitud'}
						</p>
					</div>
				</div>
				{#if lugar.lat && lugar.lon}
				<div id="lugar-map" style="height: 350px; width: 100%; border-radius: 0 0 0.375rem 0.375rem;"></div>
				{/if}
			</div>
		</div>

		{#if personasRelacionadas.length > 0}
            <div class="card mb-4">
                <div class="card-header bg-secondary text-white">
                    <h2 class="card-title h5 mb-0">
                        <i class="bi bi-people me-2"></i>Personas relacionadas con este lugar
                    </h2>
                </div>
                <ul class="list-group list-group-flush">
                    {#each personasRelacionadas as per}
                        <li class="list-group-item">
                            <div class="row">
                                <div class="col-md-6">
                                    {#each per.personas as persona}
                                        <a class="{personaDetailPath(persona) === 'personaesclavizada' ? 'text-primary' : 'text-secondary'}" 
                                           href="/Detail/{personaDetailPath(persona)}/{persona.persona_id}">
                                            <h3 class="h6 mb-2">{persona.nombre_normalizado}</h3>
                                        </a>
                                    {/each}
                                    {#if per.fecha_inicial_lugar_raw || per.fecha_final_lugar_raw}
                                        <p class="mb-1"><small>Periodo: {per.fecha_inicial_lugar_raw || '?'} - {per.fecha_final_lugar_raw || '?'}</small></p>
                                    {/if}
                                    {#if per.situacion_lugar}
                                        <p class="mb-1"><small>Situación: {per.situacion_lugar}</small></p>
                                    {/if}
                                </div>
                                <div class="col-md-6">
                                    {#if per.documento}
                                        <p class="mb-1">
                                            <small>Registro: 
                                                <a href="/Detail/documento/{per.documento.documento_id}">
                                                    {per.documento.titulo?.length > 50 
                                                        ? per.documento.titulo.substring(0, 50) + '...'
                                                        : per.documento.titulo}
                                                </a>
                                            </small>
                                        </p>
                                    {/if}
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-primary btn-sm" on:click={prevPage} disabled={currentPage === 1}>
                            <i class="bi bi-chevron-left"></i> Anterior
                        </button>
                        <span class="small text-muted">Página {currentPage} de {totalPages}</span>
                        <button class="btn btn-primary btn-sm" on:click={nextPage} disabled={currentPage === totalPages}>
                            Siguiente <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        {/if}

		{#if loading}
            <div class="text-center my-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        {/if}

		{#if procedenciaPersonas.length > 0}
		<div class="card mb-4">
			<div class="card-header bg-success text-white">
				<h2 class="card-title h5 mb-0">
					<i class="bi bi-geo-alt me-2"></i>Personas provenientes de este lugar
				</h2>
			</div>
			<ul class="list-group list-group-flush">
				{#each procedenciaPersonas as proc}
					<li class="list-group-item">
						<a href="/Detail/personaesclavizada/{proc.persona_id}">
							<h3 class="h6 mb-2">{proc.nombre_normalizado}</h3>
						</a>
					</li>
				{/each}
			</ul>
			<div class="card-footer">
				<div class="d-flex justify-content-between align-items-center">
					<button class="btn btn-success btn-sm" on:click={procPrevPage} disabled={procPage === 1}>
						<i class="bi bi-chevron-left"></i> Anterior
					</button>
					<span class="small text-muted">Página {procPage} de {procTotalPages}</span>
					<button class="btn btn-success btn-sm" on:click={procNextPage} disabled={procPage === procTotalPages}>
						Siguiente <i class="bi bi-chevron-right"></i>
					</button>
				</div>
			</div>
		</div>
		{/if}

		{#if procLoading}
            <div class="text-center my-3">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        {/if}

	{:else}
		<div class="d-flex justify-content-center">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
		</div>
	{/if}
</div>
