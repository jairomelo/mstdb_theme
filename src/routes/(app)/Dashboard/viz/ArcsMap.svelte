<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';
	import { aggregatedTrajectories } from '$lib/api';

	let L;
	let map;
	let loading = true;
	let error = null;
	let routes = [];
	let places = [];
	let routeLimit = 100;
	let origin = '';
	let destination = '';
	let startDate = '';
	let endDate = '';
	let mapContainer;

	let svg, g;

	async function loadData() {
		try {
			loading = true;
			error = null;
			const params = {};
			if (startDate) params.fecha_inicial__gte = startDate;
			if (endDate) params.fecha_inicial__lte = endDate;
			const data = await aggregatedTrajectories(params);
			routes = data.routes || [];
			places = data.places || [];
			update();
			loading = false;
		} catch (e) {
			console.error(e);
			error = e.message;
			loading = false;
		}
	}

	onMount(async () => {
		if (!browser) return;

		try {
			const leaflet = await import('leaflet');
			L = leaflet.default;

			map = L.map(mapContainer).setView([17.5, -96], 6);
			L.tileLayer(
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
				{
					attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
					maxZoom: 8
				}
			).addTo(map);

			svg = d3.select(map.getPanes().overlayPane).append('svg');

			const defs = svg.append('defs');
			defs
				.append('marker')
				.attr('id', 'arrowhead')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 10)
				.attr('refY', 0)
				.attr('markerWidth', 6)
				.attr('markerHeight', 6)
				.attr('orient', 'auto')
				.attr('fill', '#004080')
				.append('path')
				.attr('d', 'M0,-5L10,0L0,5');

			g = svg.append('g').attr('class', 'leaflet-zoom-hide');

			await loadData();
			map.on('zoomend moveend', update);
		} catch (e) {
			console.error(e);
			error = e.message;
			loading = false;
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			map = null;
		}
	});

	function projectPoint(lat, lon) {
		const point = map.latLngToLayerPoint([lat, lon]);
		return [point.x, point.y];
	}

	function update() {
		if (!map || !svg || !g) return;
		const bounds = map.getBounds();
		const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
		const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

		svg
			.attr('width', bottomRight.x - topLeft.x)
			.attr('height', bottomRight.y - topLeft.y)
			.style('left', `${topLeft.x}px`)
			.style('top', `${topLeft.y}px`);

		g.attr('transform', `translate(${-topLeft.x},${-topLeft.y})`);

		const visibleRoutes = routes
			.filter(
				(route) =>
					(!origin || route.from_lugar_id === Number(origin)) &&
					(!destination || route.to_lugar_id === Number(destination))
			)
			.sort((a, b) => b.count - a.count)
			.slice(0, routeLimit);
		const maxCount = Math.max(...visibleRoutes.map((route) => route.count), 1);

		g.selectAll('path').remove();

		g.selectAll('path')
			.data(visibleRoutes)
			.enter()
			.append('path')
			.attr('d', (d) => {
				const [x1, y1] = projectPoint(d.from_lat, d.from_lon);
				const [x2, y2] = projectPoint(d.to_lat, d.to_lon);
				const width = Math.max(2, Math.log(d.count + 1) * 3);
				const midX = (x1 + x2) / 2;
				return `M ${x1},${y1 - width / 2}
                C ${midX},${y1 - width / 2} ${midX},${y2 - width / 2} ${x2},${y2 - width / 2}
                L ${x2},${y2 + width / 2}
                C ${midX},${y2 + width / 2} ${midX},${y1 + width / 2} ${x1},${y1 + width / 2}
                Z`;
			})
			.attr('stroke', 'none')
			.attr('fill', '#ff6600')
			.attr('opacity', (d) => 0.3 + 0.5 * (d.count / maxCount))
			.append('title')
			.text((d) => `${d.from_nombre} → ${d.to_nombre}: ${d.count} persona(s)`);
	}

	$: if (map) update();
</script>

{#if browser}
	<div class="map-container card">
		<div class="card-body">
			<div class="row g-3 mb-3">
				<div class="col-md-3">
					<label class="form-label" for="route-limit">Rutas mostradas: {routeLimit}</label>
					<input
						id="route-limit"
						class="form-range"
						type="range"
						min="10"
						max="500"
						step="10"
						bind:value={routeLimit}
					/>
				</div>
				<div class="col-md-3">
					<label class="form-label" for="origin">Origen</label>
					<select id="origin" class="form-select" bind:value={origin}>
						<option value="">Todos los lugares</option>
						{#each places as place}
							<option value={place.lugar_id}>{place.nombre}</option>
						{/each}
					</select>
				</div>
				<div class="col-md-3">
					<label class="form-label" for="destination">Destino</label>
					<select id="destination" class="form-select" bind:value={destination}>
						<option value="">Todos los lugares</option>
						{#each places as place}
							<option value={place.lugar_id}>{place.nombre}</option>
						{/each}
					</select>
				</div>
				<div class="col-md-3">
					<label class="form-label" for="start-date">Fecha inicial</label>
					<div class="input-group">
						<input id="start-date" class="form-control" type="date" bind:value={startDate} />
						<input class="form-control" type="date" aria-label="Fecha final" bind:value={endDate} />
						<button class="btn btn-outline-secondary" type="button" on:click={loadData}
							>Aplicar</button
						>
					</div>
				</div>
			</div>
			<p class="small text-muted mb-3">
				{Math.min(
					routeLimit,
					routes.filter(
						(route) =>
							(!origin || route.from_lugar_id === Number(origin)) &&
							(!destination || route.to_lugar_id === Number(destination))
					).length
				)} de {routes.length} rutas agregadas
			</p>
			<div bind:this={mapContainer} id="map"></div>
			{#if loading}
				<div class="text-center mt-3">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
					<p class="text-muted mt-2">Cargando trayectorias...</p>
				</div>
			{:else if error}
				<div class="alert alert-danger mt-3" role="alert">
					<i class="bi bi-exclamation-triangle-fill me-2"></i>
					Error cargando trayectorias: {error}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.map-container {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.form-select {
		max-width: 300px;
	}

	#map {
		width: 100%;
		height: 600px;
		border-radius: 0.5rem;
		border: 1px solid var(--bs-border-color);
	}

	:global(svg path) {
		transition: opacity 0.2s ease;
	}

	:global(svg path:hover) {
		opacity: 0.8 !important;
	}
</style>
