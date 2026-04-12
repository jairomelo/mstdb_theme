<script>
	import { onMount, tick, onDestroy } from 'svelte';
	import { peresclavizadas, personaNetwork, personaTrajectory } from '$lib/api';
	import cytoscape from 'cytoscape';
	import fcose from 'cytoscape-fcose';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';
	
	cytoscape.use(fcose);

	export let data;
	let peresc = null;
	let error = null;
	let networkData = null;
	let trajectoryData = null;
	let L = null;
	let map = null;

	// Network visualization variables
	let relationsCy = null;

	// Helper: does this persona have any place data (FK or relational)?
	function hasPlaceData(p) {
		return (p.lugares && p.lugares.length > 0) ||
			(p.procedencia && p.procedencia.lat) ||
			(p.lugar_nacimiento && p.lugar_nacimiento.lat) ||
			(p.lugar_defuncion && p.lugar_defuncion.lat);
	}

	onMount(async () => {
		try {
			peresc = await peresclavizadas(data.id);
			
			if (browser) {
				// Fetch network + trajectory from live API (parallel)
				const promises = [];

				if (peresc.relaciones && peresc.relaciones.length > 0) {
					promises.push(
						personaNetwork(data.id)
							.then(d => { networkData = d; })
							.catch(e => console.warn('Network data unavailable:', e))
					);
				}

				if (hasPlaceData(peresc)) {
					promises.push(
						personaTrajectory(data.id)
							.then(d => { trajectoryData = d; })
							.catch(e => console.warn('Trajectory data unavailable:', e))
					);
				}

				await Promise.all(promises);

				// Initialize visualizations after data is loaded
				await tick();
				if (peresc.relaciones && peresc.relaciones.length > 0) {
					initializeRelationsNetwork();
				}
				if (hasPlaceData(peresc)) {
					await initializeMap();
				}
			}
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch persona esclavizada:', e);
		}
	});

	function initializeRelationsNetwork() {
		if (!networkData || !browser) return;
		
		const container = document.getElementById('relations-network');
		if (!container) return;

		const currentPersonId = `p${data.id}`;
		const esclavizadaCtype = peresc.polymorphic_ctype;

		// networkData is already the persona-specific ego-network {nodes, edges}
		if (!networkData.nodes || networkData.nodes.length === 0) {
			container.innerHTML = `
				<div class="d-flex align-items-center justify-content-center h-100 text-muted">
					<div class="text-center">
						<i class="bi bi-diagram-2" style="font-size: 2rem;"></i>
						<p class="mt-2">No hay datos de red disponibles para visualizar las relaciones</p>
					</div>
				</div>
			`;
			return;
		}

		relationsCy = cytoscape({
			container,
			elements: [...networkData.nodes, ...networkData.edges],
			style: [
				{
					selector: 'node',
					style: {
						'background-color': '#4ECDC4',
						'border-width': 2,
						'border-color': '#26D0CE',
						label: 'data(label)',
						color: '#000',
						'text-valign': 'center',
						'text-halign': 'center',
						width: 40,
						height: 40,
						'font-size': '10px',
						'text-outline-width': 2,
						'text-outline-color': '#fff'
					}
				},
				{
					selector: `node[id = "${currentPersonId}"]`,
					style: {
						'background-color': '#FF6B6B',
						'border-color': '#FF4757',
						'border-width': 4,
						width: 50,
						height: 50
					}
				},
				{
					selector: `node[type = ${esclavizadaCtype}]`,
					style: {
						'background-color': '#FF6B6B',
						'border-color': '#FF4757'
					}
				},
				{
					selector: 'edge',
					style: {
						width: 2,
						'line-color': '#3498DB',
						'curve-style': 'bezier',
						'target-arrow-shape': 'none'
					}
				},
				{
					selector: 'edge[relation = "fam"]',
					style: {
						'line-color': '#E74C3C',
						width: 3
					}
				},
				{
					selector: 'edge[relation = "aso"]',
					style: {
						'line-color': '#3498DB'
					}
				},
				{
					selector: 'edge[relation = "tmp"]',
					style: {
						'line-color': '#F39C12'
					}
				}
			],
			layout: {
				name: 'fcose',
				animate: true,
				fit: true,
				padding: 20,
				randomize: false
			}
		});

		// Add click event to navigate to related person details
		relationsCy.on('tap', 'node', function(event) {
			const node = event.target;
			const nodeId = node.data('id').replace('p', '');
			const nodeType = node.data('type');
			
			if (nodeId !== data.id) {
				const detailUrl = nodeType === esclavizadaCtype 
					? `/Detail/personaesclavizada/${nodeId}`
					: `/Detail/personanoesclavizada/${nodeId}`;
				window.open(detailUrl, '_blank');
			}
		});

		// Add hover effect
		relationsCy.on('mouseover', 'node', function(event) {
			const node = event.target;
			node.style('border-width', '3px');
		});

		relationsCy.on('mouseout', 'node', function(event) {
			const node = event.target;
			const isCurrentPerson = node.data('id') === currentPersonId;
			node.style('border-width', isCurrentPerson ? '4px' : '2px');
		});
	}

	async function initializeMap() {
		if (!browser || !hasPlaceData(peresc)) return;
		
		const container = document.getElementById('places-map');
		if (!container) return;

		try {
			// Dynamically import Leaflet
			const leaflet = await import('leaflet');
			L = leaflet.default;

			// Clear any existing map
			if (map) {
				map.remove();
			}

			// Create map centered on first location or default to Oaxaca region
			const firstPlace = peresc.lugares[0]?.lugar;
			const centerLat = firstPlace?.lat ? parseFloat(firstPlace.lat) : 17.0;
			const centerLon = firstPlace?.lon ? parseFloat(firstPlace.lon) : -96.7;
			
			map = L.map(container).setView([centerLat, centerLon], 8);
			
			// Add tile layer
			L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
						attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
						maxZoom: 8
			}).addTo(map);

			// Add D3 overlay for better visualization
			const svg = d3.select(map.getPanes().overlayPane).append("svg");
			const g = svg.append("g").attr("class", "leaflet-zoom-hide");

			// Collect all places with coordinates from persona_x_lugares
			const places = (peresc.lugares || [])
				.filter(lugar => lugar.lugar.lat && lugar.lugar.lon)
				.map(lugar => ({
					name: lugar.lugar.nombre_lugar,
					type: lugar.lugar.tipo,
					situation: lugar.situacion_lugar,
					lat: parseFloat(lugar.lugar.lat),
					lon: parseFloat(lugar.lugar.lon)
				}));

			// Add direct FK places (procedencia, nacimiento, defuncion) if not already present
			const seenCoords = new Set(places.map(p => `${p.lat},${p.lon}`));
			const fkPlaces = [
				peresc.lugar_nacimiento ? { ...peresc.lugar_nacimiento, _situacion: 'Nacimiento' } : null,
				peresc.procedencia ? { ...peresc.procedencia, _situacion: 'Procedencia' } : null,
				peresc.lugar_defuncion ? { ...peresc.lugar_defuncion, _situacion: 'Defunción' } : null,
			].filter(Boolean);

			for (const fk of fkPlaces) {
				if (fk.lat && fk.lon) {
					const key = `${parseFloat(fk.lat)},${parseFloat(fk.lon)}`;
					if (!seenCoords.has(key)) {
						places.push({
							name: fk.nombre_lugar,
							type: fk.tipo,
							situation: fk._situacion,
							lat: parseFloat(fk.lat),
							lon: parseFloat(fk.lon)
						});
						seenCoords.add(key);
					}
				}
			}

			// trajectoryData is already persona-specific arcs from the API
			const personTrajectories = trajectoryData || [];

			function projectPoint(lat, lon) {
				const point = map.latLngToLayerPoint([lat, lon]);
				return [point.x, point.y];
			}

			function updateVisualization() {
				const bounds = map.getBounds();
				const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
				const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

				svg
					.attr("width", bottomRight.x - topLeft.x)
					.attr("height", bottomRight.y - topLeft.y)
					.style("left", `${topLeft.x}px`)
					.style("top", `${topLeft.y}px`);

				g.attr("transform", `translate(${-topLeft.x},${-topLeft.y})`);

				// Clear previous elements
				g.selectAll("*").remove();

				// Draw trajectory paths if available
				if (personTrajectories.length > 0) {
					// Arc color helper based on situacion
					function arcColor(d) {
						const fromSit = d.from.situacion || '';
						const toSit = d.to.situacion || '';
						if (fromSit === 'Nacimiento' || fromSit === 'Procedencia' || toSit === 'Procedencia') return '#2980b9';
						if (toSit === 'Defunción') return '#7f8c8d';
						return '#e74c3c';
					}

					// Create arrowhead markers for each arc type
					const defs = svg.append("defs");
					['#e74c3c', '#2980b9', '#7f8c8d'].forEach((color, i) => {
						defs.append("marker")
							.attr("id", `arrow-person-${i}`)
							.attr("viewBox", "0 -3 6 6")
							.attr("refX", 6)
							.attr("refY", 0)
							.attr("markerWidth", 4)
							.attr("markerHeight", 4)
							.attr("orient", "auto")
							.attr("fill", color)
							.append("path")
							.attr("d", "M0,-3L6,0L0,3Z");
					});

					function arrowId(d) {
						const c = arcColor(d);
						const idx = ['#e74c3c', '#2980b9', '#7f8c8d'].indexOf(c);
						return `url(#arrow-person-${idx >= 0 ? idx : 0})`;
					}

					// Draw trajectory lines
					g.selectAll(".trajectory-path")
						.data(personTrajectories)
						.enter()
						.append("path")
						.attr("class", "trajectory-path")
						.attr("d", d => {
							const [x1, y1] = projectPoint(d.from.lat, d.from.lon);
							const [x2, y2] = projectPoint(d.to.lat, d.to.lon);
							const dx = x2 - x1;
							const dy = y2 - y1;
							const dist = Math.sqrt(dx * dx + dy * dy);
							const dr = Math.max(dist * 1.2, 80);
							return `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`;
						})
						.attr("stroke", d => arcColor(d))
						.attr("stroke-width", 3)
						.attr("stroke-dasharray", d => (d.to.situacion === 'Defunción') ? '6,3' : null)
						.attr("fill", "none")
						.attr("opacity", 0.8)
						.attr("marker-end", d => arrowId(d))
						.on("mouseover", function() {
							d3.select(this)
								.attr("stroke-width", 5)
								.attr("opacity", 1);
						})
						.on("mouseout", function() {
							d3.select(this)
								.attr("stroke-width", 3)
								.attr("opacity", 0.8);
						})
						.append("title")
						.text(d => `${d.from.name} → ${d.to.name} (${d.date})`);
				}

				// Draw place circles
				g.selectAll(".place-circle")
					.data(places)
					.enter()
					.append("circle")
					.attr("class", "place-circle")
					.attr("cx", d => projectPoint(d.lat, d.lon)[0])
					.attr("cy", d => projectPoint(d.lat, d.lon)[1])
					.attr("r", 8)
					.attr("fill", d => {
						switch(d.type) {
							case 'ciudad': return '#3498db';
							case 'villa': return '#9b59b6';
							case 'pueblo': return '#e67e22';
							default: return '#2ecc71';
						}
					})
					.attr("stroke", "#fff")
					.attr("stroke-width", 2)
					.attr("opacity", 0.8)
					.on("mouseover", function() {
						d3.select(this)
							.attr("r", 12)
							.attr("opacity", 1);
					})
					.on("mouseout", function() {
						d3.select(this)
							.attr("r", 8)
							.attr("opacity", 0.8);
					})
					.append("title")
					.text(d => `${d.name} (${d.type})${d.situation ? ' - ' + d.situation : ''}`);

				// Add place labels
				g.selectAll(".place-label")
					.data(places)
					.enter()
					.append("text")
					.attr("class", "place-label")
					.attr("x", d => projectPoint(d.lat, d.lon)[0])
					.attr("y", d => projectPoint(d.lat, d.lon)[1] - 12)
					.attr("text-anchor", "middle")
					.attr("font-size", "12px")
					.attr("font-weight", "bold")
					.attr("fill", "#2c3e50")
					.attr("stroke", "#fff")
					.attr("stroke-width", 3)
					.attr("paint-order", "stroke")
					.text(d => d.name);
			}

			// Initial update and event listeners
			updateVisualization();
			map.on("zoomend moveend", updateVisualization);

			// Fit map to show all places
			if (places.length > 0) {
				const bounds = L.latLngBounds(places.map(p => [p.lat, p.lon]));
				map.fitBounds(bounds, { padding: [20, 20] });
			}

		} catch (error) {
			console.error('Error initializing map:', error);
			// Fallback to simple place list
			container.innerHTML = `
				<div class="places-map-placeholder">
					<div class="text-center p-4">
						<i class="bi bi-exclamation-triangle text-warning" style="font-size: 2rem;"></i>
						<h5 class="mt-2">No se pudo cargar el mapa</h5>
						<p class="text-muted">Lugares relacionados:</p>
						<div class="mt-3">
							${peresc.lugares.map(lugar => `
								<div class="badge bg-success me-2 mb-2">
									${lugar.lugar.nombre_lugar} (${lugar.lugar.tipo})
								</div>
							`).join('')}
						</div>
					</div>
				</div>
			`;
		}
	}

	onDestroy(() => {
		// Clean up map and cytoscape instances
		if (map) {
			map.remove();
			map = null;
		}
		if (relationsCy) {
			relationsCy.destroy();
			relationsCy = null;
		}
	});
</script>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if peresc}

	<div class="entity-banner persona-esclavizada">
		<h1>{peresc.nombre_normalizado || 'Persona Esclavizada'}</h1>
		<span class="entity-type">Persona Esclavizada</span>
	</div>

		<div class="detailwrap">
			<div class="detail">
				<h3>ID</h3>
				<div class="detail-bottom"><p>{peresc.persona_idno}</p></div>
			</div>
			<div class="detail">
				<h3>Nombres</h3>
				<div class="detail-bottom"><p>{peresc.nombres || 'No disponible'}</p></div>
			</div>
			<div class="detail">
				<h3>Apellidos</h3>
				<div class="detail-bottom"><p>{peresc.apellidos || 'No disponible'}</p></div>
			</div>
			{#if peresc.sexo}
			<div class="detail">
				<h3>Sexo</h3>
				<div class="detail-bottom"><p>{peresc.sexo}</p></div>
			</div>
			{/if}
			{#if peresc.edad}
			<div class="detail">
				<h3>Edad</h3>
				<div class="detail-bottom"><p>{peresc.edad} {peresc.unidad_temporal_edad || 'años'}</p></div>
			</div>
			{/if}
			{#if peresc.etnonimos}
			<div class="detail">
				<h3>Etnónimos</h3>
				<div class="detail-bottom"><p>{peresc.etnonimos.join(', ')}</p></div>
			</div>
			{/if}
			{#if peresc.hispanizacion}
			<div class="detail">
				<h3>Agencia / Adaptación</h3>
				<div class="detail-bottom"><p>{peresc.hispanizacion}</p></div>
			</div>
			{/if}
			{#if peresc.marcas_corporales}
			<div class="detail">
				<h3>Marcas corporales</h3>
				<div class="detail-bottom"><p>{peresc.marcas_corporales}</p></div>
			</div>
			{/if}
			{#if peresc.salud}
			<div class="detail">
				<h3>Salud</h3>
				<div class="detail-bottom"><p>{peresc.salud}</p></div>
			</div>
			{/if}
			{#if peresc.conducta}
			<div class="detail">
				<h3>Conducta</h3>
				<div class="detail-bottom"><p>{peresc.conducta}</p></div>
			</div>
			{/if}
		</div>

		<!-- Places Map -->
		{#if hasPlaceData(peresc)}
			<div class="card mb-4">
				<div class="card-header bg-success text-white">
					<h2 class="card-title h5 mb-0"><i class="bi bi-geo-alt me-2"></i>Trayectoria</h2>
					<small class="text-white-50">Lugares conocidos y trayectoria de la persona</small>
				</div>
				<div class="card-body">
					<div id="places-map" style="height: 400px; border: 1px solid #dee2e6; border-radius: 0.375rem;"></div>
				</div>
				<div class="card-footer">
					<div class="row text-center">
						<div class="col-md-2">
							<small class="text-muted">
								<div class="place-legend ciudad me-1"></div>
								Ciudad
							</small>
						</div>
						<div class="col-md-2">
							<small class="text-muted">
								<div class="place-legend villa me-1"></div>
								Villa
							</small>
						</div>
						<div class="col-md-2">
							<small class="text-muted">
								<div class="place-legend pueblo me-1"></div>
								Pueblo
							</small>
						</div>
						<div class="col-md-2">
							<small class="text-muted">
								<div class="trajectory-legend me-1"></div>
								Trayectoria
							</small>
						</div>
						<div class="col-md-2">
							<small class="text-muted">
								<div class="trajectory-legend origin me-1"></div>
								Procedencia
							</small>
						</div>
						<div class="col-md-2">
							<small class="text-muted">
								<div class="trajectory-legend defuncion me-1"></div>
								Defunción
							</small>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Relations Network -->
		{#if peresc.relaciones && peresc.relaciones.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-info text-white">
					<h2 class="card-title h5 mb-0"><i class="bi bi-diagram-2 me-2"></i>Red de Relaciones</h2>
					<small class="text-white-50">Haz clic en un nodo para ver los detalles de esa persona</small>
				</div>
				<div class="card-body">
					<div id="relations-network" style="height: 400px; border: 1px solid #dee2e6; border-radius: 0.375rem;"></div>
				</div>
				<div class="card-footer">
					<div class="row text-center">
						<div class="col-md-4">
							<small class="text-muted">
								<div class="color-legend-mini enslaved me-1"></div>
								Esclavizada
							</small>
						</div>
						<div class="col-md-4">
							<small class="text-muted">
								<div class="color-legend-mini non-enslaved me-1"></div>
								No esclavizada
							</small>
						</div>
						<div class="col-md-4">
							<small class="text-muted">
								<div class="color-legend-mini current me-1"></div>
								Persona actual
							</small>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Documents Section (moved to bottom) -->
		{#if peresc.documentos && peresc.documentos.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-secondary text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-file-earmark-text me-2"></i>Documentos relacionados
					</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each peresc.documentos as doc}
						<li class="list-group-item">
							<h3 class="h6">{doc.titulo}</h3>
							<p class="mb-1"><small>ID: {doc.documento_idno}</small></p>
							<p class="mb-1"><small>Archivo: {doc.archivo.nombre}</small></p>
							<p class="mb-1"><small>Fecha: {doc.fecha_inicial} - {doc.fecha_final}</small></p>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="mt-3 text-muted">
			<small data-bs-toggle="tooltip" data-bs-placement="top" title="Fecha de creación">
				<i class="bi bi-clock-history me-1"></i>Creado: {new Date(
					peresc.created_at
				).toLocaleString()}
			</small>
			<small
				class="ms-3"
				data-bs-toggle="tooltip"
				data-bs-placement="top"
				title="Última actualización"
			>
				<i class="bi bi-clock me-1"></i>Actualizado: {new Date(peresc.updated_at).toLocaleString()}
			</small>
		</div>
	{:else}
		<div class="d-flex justify-content-center">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
		</div>
	{/if}
</div>

<style>
	/* enslaved.org-style detail blocks */
	.entity-banner {
		padding: 1.5rem 0 1rem;
		border-bottom: 3px solid;
		margin-bottom: 1.5rem;
	}

	.entity-banner.persona-esclavizada {
		border-color: #c0392b;
	}

	.entity-banner h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.25rem;
		color: #2c3e50;
	}

	.entity-banner .entity-type {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #7f8c8d;
		font-weight: 600;
	}

	.detailwrap {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		margin-bottom: 2rem;
	}

	.detailwrap .detail {
		flex: 1 1 200px;
		max-width: 100%;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e9ecef;
	}

	.detailwrap .detail h3 {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #7f8c8d;
		font-weight: 600;
		margin: 0 0 0.35rem;
	}

	.detailwrap .detail .detail-bottom {
		margin: 0;
	}

	.detailwrap .detail .detail-bottom p {
		margin: 0;
		font-size: 1rem;
		color: #2c3e50;
		line-height: 1.4;
	}

	/* Network & map cards */
	.color-legend-mini {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid;
	}

	.color-legend-mini.enslaved {
		background-color: #FF6B6B;
		border-color: #FF4757;
	}

	.color-legend-mini.non-enslaved {
		background-color: #4ECDC4;
		border-color: #26D0CE;
	}

	.color-legend-mini.current {
		background-color: #FF6B6B;
		border-color: #FF4757;
		border-width: 2px;
	}

	:global(.places-map-placeholder) {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 0.375rem;
		min-height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.place-legend {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid #fff;
	}

	.place-legend.ciudad {
		background-color: #3498db;
	}

	.place-legend.villa {
		background-color: #9b59b6;
	}

	.place-legend.pueblo {
		background-color: #e67e22;
	}

	.trajectory-legend {
		display: inline-block;
		width: 20px;
		height: 2px;
		background-color: #e74c3c;
		position: relative;
		vertical-align: middle;
	}

	.trajectory-legend.origin {
		background-color: #2980b9;
	}

	.trajectory-legend.defuncion {
		background-color: #7f8c8d;
		border-top: 1px dashed #7f8c8d;
		background: none;
	}

	.trajectory-legend::after {
		content: '';
		position: absolute;
		right: -2px;
		top: -3px;
		width: 0;
		height: 0;
		border-left: 6px solid #e74c3c;
		border-top: 4px solid transparent;
		border-bottom: 4px solid transparent;
	}

	.trajectory-legend.origin::after {
		border-left-color: #2980b9;
	}

	.trajectory-legend.defuncion::after {
		border-left-color: #7f8c8d;
	}

	:global(.leaflet-container) {
		border-radius: 0.375rem;
	}

	#relations-network {
		background: white;
	}

	#places-map {
		background: white;
	}
</style>
