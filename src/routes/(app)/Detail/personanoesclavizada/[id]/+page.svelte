<script>
	import { onMount, tick, onDestroy } from 'svelte';
	import { pernoesclavizadas } from '$lib/api';
	import cytoscape from 'cytoscape';
	import fcose from 'cytoscape-fcose';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';
	
	cytoscape.use(fcose);

	export let data;
	let pernoesc = null;
	let error = null;
	let networkData = null;
	let L = null;
	let map = null;

	// Network visualization variables
	let relationsCy = null;
	let hasNetworkConnections = false;

	onMount(async () => {
		try {
			pernoesc = await pernoesclavizadas(data.id);
			
			// Load network data for relations visualization
			if (browser) {
				const networkRes = await fetch('/temp/persona_network.json');
				
				if (networkRes.ok) {
					networkData = await networkRes.json();
					
					// Check if current person has connections in the network
					const currentPersonId = `p${data.id}`;
					hasNetworkConnections = networkData.edges.some(edge => 
						edge.data.source === currentPersonId || edge.data.target === currentPersonId
					);
				}
				
				// Initialize map and network after data is loaded
				await tick();
				if (hasNetworkConnections) {
					initializeRelationsNetwork();
				}
				if (pernoesc.lugares && pernoesc.lugares.length > 0) {
					await initializeMap();
				}
			}
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch persona no esclavizada:', e);
		}
	});

	function initializeRelationsNetwork() {
		if (!networkData) return;

		const container = document.getElementById('relations-network');
		if (!container) return;

		// Clear any existing network
		if (relationsCy) {
			relationsCy.destroy();
		}

		// Get the current person's ID in the format used by the network
		const currentPersonId = `p${data.id}`;
		
		// Find all edges that involve the current person
		const relatedEdges = networkData.edges.filter(edge => 
			edge.data.source === currentPersonId || edge.data.target === currentPersonId
		);

		// Find all person IDs connected to the current person
		const relatedPersonIds = new Set();
		relatedEdges.forEach(edge => {
			relatedPersonIds.add(edge.data.source);
			relatedPersonIds.add(edge.data.target);
		});

		// Filter network data to include only related persons
		const filteredNodes = networkData.nodes.filter(node => 
			relatedPersonIds.has(node.data.id)
		);
		
		const filteredEdges = relatedEdges;

		if (filteredNodes.length === 0) {
			// Show a message if no network data is available
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
			container: container,
			elements: [...filteredNodes, ...filteredEdges],
			style: [
				{
					selector: 'node',
					style: {
						'background-color': function(node) {
							const nodeId = node.data('id');
							const nodeType = node.data('type');
							
							if (nodeId === currentPersonId) {
								return '#4ECDC4'; // Current person (teal for no esclavizada)
							} else if (nodeType === 29) {
								return '#FF6B6B'; // Persona esclavizada (red)
							} else {
								return '#4ECDC4'; // Persona no esclavizada (teal)
							}
						},
						'label': 'data(label)',
						'text-valign': 'center',
						'text-halign': 'center',
						'color': '#2c3e50',
						'font-size': '10px',
						'font-weight': 'bold',
						'text-wrap': 'wrap',
						'text-max-width': '60px',
						'width': 40,
						'height': 40,
						'border-width': function(node) {
							return node.data('id') === currentPersonId ? 4 : 2;
						},
						'border-color': '#2c3e50'
					}
				},
				{
					selector: 'edge',
					style: {
						'width': 2,
						'line-color': '#95A5A6',
						'target-arrow-color': '#95A5A6',
						'target-arrow-shape': 'triangle',
						'arrow-scale': 1.2,
						'curve-style': 'bezier'
					}
				},
				{
					selector: 'edge[relation = "fam"]',
					style: {
						'line-color': '#E74C3C'
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
				const detailUrl = nodeType === 29 
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
		if (!browser || !pernoesc.lugares || pernoesc.lugares.length === 0) return;
		
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
			const firstPlace = pernoesc.lugares[0]?.lugar;
			const centerLat = firstPlace?.lat ? parseFloat(firstPlace.lat) : 17.0;
			const centerLon = firstPlace?.lon ? parseFloat(firstPlace.lon) : -96.7;
			
			map = L.map(container).setView([centerLat, centerLon], 8);
			
			// Add tile layer
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors'
			}).addTo(map);

			// Add D3 overlay for better visualization
			const svg = d3.select(map.getPanes().overlayPane).append("svg");
			const g = svg.append("g").attr("class", "leaflet-zoom-hide");

			// Collect all unique places with coordinates (deduplicate)
			const seenPlaces = new Map();
			pernoesc.lugares
				.filter(lugar => lugar.lugar.lat && lugar.lugar.lon)
				.forEach(lugar => {
					const key = `${lugar.lugar.nombre_lugar}-${lugar.lugar.tipo}`;
					if (!seenPlaces.has(key)) {
						seenPlaces.set(key, {
							name: lugar.lugar.nombre_lugar,
							type: lugar.lugar.tipo,
							situation: lugar.situacion_lugar,
							lat: parseFloat(lugar.lugar.lat),
							lon: parseFloat(lugar.lugar.lon)
						});
					}
				});
			
			const places = Array.from(seenPlaces.values());

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

				// Draw place circles (no trajectories for persona no esclavizada)
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
							${pernoesc.lugares.map(lugar => `
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
	{:else if pernoesc}

	<div class="entity-banner">
		<h1><img src="/icons/i_pernoesc.webp" alt="Persona Esclavizada"> Persona No Esclavizada</h1>
	</div>

		<div class="card mb-4">
			<div class="card-header bg-primary text-white">
				<h1 class="card-title mb-0">{pernoesc.nombre_normalizado || 'Persona Esclavizada'}</h1>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<p><strong><i class="bi bi-fingerprint me-2"></i>ID:</strong> {pernoesc.persona_idno}</p>
						<p>
							<strong><i class="bi bi-person me-2"></i>Nombres:</strong>
							{pernoesc.nombres || 'No disponible'}
						</p>
						<p>
							<strong><i class="bi bi-person-badge me-2"></i>Apellidos:</strong>
							{pernoesc.apellidos || 'No disponible'}
						</p>
						<p>
							<strong><i class="bi bi-gender-ambiguous me-2"></i>Sexo:</strong>
							{pernoesc.sexo || 'No disponible'}
						</p>
						<p>
							<strong><i class="bi bi-calendar-event me-2"></i>Edad:</strong>
							{pernoesc.edad}
							{pernoesc.unidad_temporal_edad || 'años'}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Relations Network -->
		{#if hasNetworkConnections}
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

		<!-- Places Map -->
		{#if pernoesc.lugares && pernoesc.lugares.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-success text-white">
					<h2 class="card-title h5 mb-0"><i class="bi bi-geo-alt me-2"></i>Lugares relacionados</h2>
					<small class="text-white-50">Mapa interactivo mostrando ubicaciones únicas</small>
				</div>
				<div class="card-body">
					<div id="places-map" style="height: 400px; border: 1px solid #dee2e6; border-radius: 0.375rem;"></div>
				</div>
				<div class="card-footer">
					<div class="row text-center">
						<div class="col-md-3">
							<small class="text-muted">
								<div class="place-legend ciudad me-1"></div>
								Ciudad
							</small>
						</div>
						<div class="col-md-3">
							<small class="text-muted">
								<div class="place-legend villa me-1"></div>
								Villa
							</small>
						</div>
						<div class="col-md-3">
							<small class="text-muted">
								<div class="place-legend pueblo me-1"></div>
								Pueblo
							</small>
						</div>
						<div class="col-md-3">
							<small class="text-muted">
								<div class="place-legend other me-1"></div>
								Otro
							</small>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Documents Section (moved to bottom) -->
		{#if pernoesc.documentos && pernoesc.documentos.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-secondary text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-file-earmark-text me-2"></i>Documentos relacionados
					</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each pernoesc.documentos as doc}
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
					pernoesc.created_at
				).toLocaleString()}
			</small>
			<small
				class="ms-3"
				data-bs-toggle="tooltip"
				data-bs-placement="top"
				title="Última actualización"
			>
				<i class="bi bi-clock me-1"></i>Actualizado: {new Date(pernoesc.updated_at).toLocaleString()}
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
		background-color: #4ECDC4;
		border-color: #26D0CE;
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

	.place-legend.other {
		background-color: #2ecc71;
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
