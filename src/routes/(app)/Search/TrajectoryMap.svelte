<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';
	import { aggregatedTrajectories } from '$lib/api';
	import RouteDetailPanel from './RouteDetailPanel.svelte';

	export let filters = {};

	let L = null;
	let map = null;
	let svg, g;
	let loading = true;
	let error = null;
	let routes = [];
	let places = [];
	let showPlaces = true;
	let circleLayer = null;
	let mapContainer;

	// Modal state
	let selectedRoute = null;

	$: if (browser && map && filters) {
		loadData();
	}

	onMount(async () => {
		if (!browser) return;
		try {
			const leaflet = await import('leaflet');
			L = leaflet.default;

			map = L.map(mapContainer).setView([10, -70], 4);
			L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
				maxZoom: 8
			}).addTo(map);

			svg = d3.select(map.getPanes().overlayPane).append('svg');

			const defs = svg.append('defs');
			defs.append('marker')
				.attr('id', 'traj-arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 10).attr('refY', 0)
				.attr('markerWidth', 6).attr('markerHeight', 6)
				.attr('orient', 'auto')
				.attr('fill', '#004080')
				.append('path').attr('d', 'M0,-5L10,0L0,5');

			g = svg.append('g').attr('class', 'leaflet-zoom-hide');

			circleLayer = L.layerGroup().addTo(map);

			await loadData();
			map.on('zoomend moveend', updateArcs);
		} catch (e) {
			console.error(e);
			error = e.message;
			loading = false;
		}
	});

	onDestroy(() => {
		if (map) { map.remove(); map = null; }
	});

	async function loadData() {
		if (!map) return;
		loading = true;
		error = null;
		try {
			const params = {};
			if (filters.sexo) params.sexo = filters.sexo;
			if (filters.etnonimo) params.etnonimo = filters.etnonimo;
			if (filters.calidad) params.calidad = filters.calidad;
			if (filters.hispanizacion) params.hispanizacion = filters.hispanizacion;
			if (filters.edad__gte) params.edad__gte = filters.edad__gte;
			if (filters.edad__lte) params.edad__lte = filters.edad__lte;
			if (filters.fecha_inicial__gte) params.fecha_inicial__gte = filters.fecha_inicial__gte;
			if (filters.fecha_inicial__lte) params.fecha_inicial__lte = filters.fecha_inicial__lte;

			const data = await aggregatedTrajectories(params);
			routes = data.routes || [];
			places = data.places || [];
			updateArcs();
			updatePlaces();
			loading = false;
		} catch (e) {
			console.error('Failed to load aggregated trajectories:', e);
			error = e.message;
			loading = false;
		}
	}

	function projectPoint(lat, lon) {
		const pt = map.latLngToLayerPoint([lat, lon]);
		return [pt.x, pt.y];
	}

	function updateArcs() {
		if (!map || !g) return;
		const bounds = map.getBounds();
		const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
		const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

		svg.attr('width', bottomRight.x - topLeft.x)
			.attr('height', bottomRight.y - topLeft.y)
			.style('left', `${topLeft.x}px`)
			.style('top', `${topLeft.y}px`);
		g.attr('transform', `translate(${-topLeft.x},${-topLeft.y})`);

		g.selectAll('path').remove();

		const maxCount = Math.max(...routes.map(r => r.count), 1);

		g.selectAll('path')
			.data(routes)
			.enter()
			.append('path')
			.attr('d', d => {
				const [x1, y1] = projectPoint(d.from_lat, d.from_lon);
				const [x2, y2] = projectPoint(d.to_lat, d.to_lon);
				const dx = x2 - x1;
				const dy = y2 - y1;
				const width = Math.max(2, Math.log(d.count + 1) * 3);
				const angle = Math.atan2(dy, dx);
				const perpX = Math.sin(angle) * width;
				const perpY = -Math.cos(angle) * width;
				const midX = (x1 + x2) / 2;
				return `M ${x1},${y1 - width / 2}
						C ${midX},${y1 - width / 2} ${midX},${y2 - width / 2} ${x2},${y2 - width / 2}
						L ${x2},${y2 + width / 2}
						C ${midX},${y2 + width / 2} ${midX},${y1 + width / 2} ${x1},${y1 + width / 2}
						Z`;
			})
			.attr('fill', '#ff6600')
			.attr('stroke', 'none')
			.attr('opacity', d => 0.3 + 0.5 * (d.count / maxCount))
			.attr('class', 'trajectory-arc')
			.on('click', (event, d) => {
				selectedRoute = d;
			})
			.append('title')
			.text(d => `${d.from_nombre} → ${d.to_nombre}: ${d.count} persona(s)`);
	}

	function updatePlaces() {
		if (!circleLayer || !L) return;
		circleLayer.clearLayers();
		if (!showPlaces) return;

		const maxPersonas = Math.max(...places.map(p => p.persona_count), 1);

		for (const p of places) {
			const radius = Math.max(5, Math.sqrt(p.persona_count / maxPersonas) * 25);
			L.circleMarker([p.lat, p.lon], {
				radius,
				fillColor: '#2980b9',
				color: '#1a5276',
				weight: 1,
				opacity: 0.9,
				fillOpacity: 0.6,
			}).bindPopup(`<strong>${p.nombre}</strong><br>Personas: ${p.persona_count}<br>Entrantes: ${p.incoming} | Salientes: ${p.outgoing}`)
			  .addTo(circleLayer);
		}
	}

	function togglePlaces() {
		showPlaces = !showPlaces;
		updatePlaces();
	}

	function closeModal() {
		selectedRoute = null;
	}
</script>

<div class="trajectory-map-wrapper">
	<div class="d-flex align-items-center gap-2 mb-2">
		<button
			class="btn btn-sm"
			class:btn-primary={showPlaces}
			class:btn-outline-secondary={!showPlaces}
			on:click={togglePlaces}
		>
			<i class="bi bi-geo-alt me-1"></i>Lugares
		</button>
		<small class="text-muted">
			{routes.length} rutas &middot; {places.length} lugares
		</small>
	</div>

	<div bind:this={mapContainer} class="trajectory-map-container"></div>

	{#if loading}
		<div class="text-center py-3">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
			<p class="text-muted mt-2">Cargando trayectorias agregadas...</p>
		</div>
	{:else if error}
		<div class="alert alert-danger mt-2">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>{error}
		</div>
	{:else if routes.length === 0}
		<div class="alert alert-info mt-2">
			<i class="bi bi-info-circle me-2"></i>No se encontraron trayectorias con los filtros aplicados.
		</div>
	{/if}
</div>

{#if selectedRoute}
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="modal d-block" tabindex="-1" role="dialog" on:click|self={closeModal} on:keydown={e => e.key === 'Escape' && closeModal()}>
	<div class="modal-dialog modal-lg modal-dialog-scrollable">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">
					<i class="bi bi-arrow-right-circle me-2"></i>
					{selectedRoute.from_nombre} → {selectedRoute.to_nombre}
				</h5>
				<button type="button" class="btn-close" on:click={closeModal}></button>
			</div>
			<div class="modal-body">
				<RouteDetailPanel fromId={selectedRoute.from_lugar_id} toId={selectedRoute.to_lugar_id}
					fromNombre={selectedRoute.from_nombre} toNombre={selectedRoute.to_nombre}
					count={selectedRoute.count} {filters} />
			</div>
		</div>
	</div>
</div>
<div class="modal-backdrop show"></div>
{/if}
