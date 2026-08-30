<script>
	import { onMount, tick, onDestroy } from 'svelte';
	import { pernoesclavizadas, personaNoEsclavizadaNetwork, whoami } from '$lib/api';
	import SuggestMerge from '$lib/components/hub/SuggestMerge.svelte';
	import { formatDate } from '$lib/utils';
	import cytoscape from 'cytoscape';
	import fcose from 'cytoscape-fcose';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';
	import html2canvas from 'html2canvas';
	
	cytoscape.use(fcose);

	export let data;
	let pernoesc = null;
	let error = null;
	let networkData = null;
	let canEdit = false;
	let L = null;
	let map = null;

	// Network visualization variables
	let relationsCy = null;
	let activeRelFilter = null;
	let showSexo = false;

	onMount(async () => {
		whoami().then(u => { canEdit = u.is_staff || u.groups?.includes('colectores'); }).catch(() => {});
		try {
			pernoesc = await pernoesclavizadas(data.id);
			
			// Load network data for relations visualization
			if (browser) {
				const promises = [];

				if (pernoesc.relaciones && pernoesc.relaciones.length > 0) {
					promises.push(
						personaNoEsclavizadaNetwork(data.id)
							.then(d => { networkData = d; })
							.catch(e => console.warn('Network data unavailable:', e))
					);
				}

				await Promise.all(promises);

				// Initialize map and network after data is loaded
				await tick();
				if (networkData) {
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
		if (!networkData || !browser) return;

		const container = document.getElementById('relations-network');
		if (!container) return;

		if (relationsCy) {
			relationsCy.destroy();
		}

		const currentPersonId = `p${data.id}`;

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
			container: container,
			elements: [...networkData.nodes, ...networkData.edges],
			style: [
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
						'text-max-width': '72px',
						'width': 28,
						'height': 28,
						'text-outline-width': 1.5,
						'text-outline-color': '#fff',
						'text-outline-opacity': 0.8
					}
				},
				{
					selector: 'node[type = "esclavizada"]',
					style: {
						'background-color': '#C9735B',
						'border-color': '#A85A44'
					}
				},
				{
					selector: `node[id = "${currentPersonId}"]`,
					style: {
						'background-color': '#3B6D8C',
						'border-color': '#2A4F66',
						'border-width': 3,
						'width': 38,
						'height': 38,
						'font-size': '10px',
						'font-weight': 'bold',
						'color': '#1a2a36'
					}
				},
				{
					selector: 'edge',
					style: {
						'width': 1.5,
						'line-color': '#C8D1D9',
						'line-opacity': 0.7,
						'curve-style': 'bezier',
						'target-arrow-shape': 'none'
					}
				},
				{
					selector: 'edge[relation = "fam"]',
					style: {
						'line-color': '#D4A27F',
						'width': 2
					}
				},
				{
					selector: 'edge[relation = "tmp"]',
					style: {
						'line-color': '#B8C99A'
					}
				},
				{
					selector: 'edge[relation = "sub"]',
					style: {
						'line-color': '#9B8EC4',
						'target-arrow-shape': 'triangle',
						'target-arrow-color': '#9B8EC4',
						'line-opacity': 0.85
					}
				}
			],
			layout: {
				name: 'fcose',
				animate: true,
				animationDuration: 600,
				fit: true,
				padding: 35,
				nodeSeparation: 120,
				idealEdgeLength: 120,
				edgeElasticity: 0.45,
				nodeRepulsion: 6500,
				gravity: 0.25,
				gravityRange: 1.5,
				numIter: 2500,
				randomize: true
			}
		});

		relationsCy.on('tap', 'node', function(event) {
			const node = event.target;
			const nodeId = node.data('id').replace('p', '');
			const nodeType = node.data('type');

			if (nodeId !== String(data.id)) {
				const detailUrl = nodeType === 'esclavizada'
					? `/Detail/personaesclavizada/${nodeId}`
					: `/Detail/personanoesclavizada/${nodeId}`;
				window.open(detailUrl, '_blank');
			}
		});

		relationsCy.on('mouseover', 'node', function(event) {
			event.target.style({ 'border-width': 3, 'overlay-opacity': 0.08 });
		});

		relationsCy.on('mouseout', 'node', function(event) {
			const node = event.target;
			const isCurrentPerson = node.data('id') === currentPersonId;
			node.style({ 'border-width': isCurrentPerson ? 3 : 2, 'overlay-opacity': 0 });
		});

		const edgeTooltip = document.getElementById('relations-edge-tooltip');

		relationsCy.on('mouseover', 'edge', function(event) {
			const desc = event.target.data('descripcion');
			if (!desc || !edgeTooltip) return;
			const pos = event.renderedPosition;
			edgeTooltip.textContent = desc;
			edgeTooltip.style.display = 'block';
			edgeTooltip.style.left = `${pos.x + 10}px`;
			edgeTooltip.style.top = `${pos.y - 30}px`;
			event.target.style({ 'width': 3, 'line-opacity': 1 });
		});

		relationsCy.on('mousemove', 'edge', function(event) {
			const desc = event.target.data('descripcion');
			if (!desc || !edgeTooltip) return;
			const pos = event.renderedPosition;
			edgeTooltip.style.left = `${pos.x + 10}px`;
			edgeTooltip.style.top = `${pos.y - 30}px`;
		});

		relationsCy.on('mouseout', 'edge', function(event) {
			if (edgeTooltip) edgeTooltip.style.display = 'none';
			event.target.style({ 'width': null, 'line-opacity': null });
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
			L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
						attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
						maxZoom: 8
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

	function downloadBlob(blob, filename) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function slugify(name) {
		return (name || 'persona').trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '').toLowerCase();
	}

	function exportNetwork() {
		if (!relationsCy) return;
		const blob = relationsCy.png({ output: 'blob', bg: '#f8fafa', full: true, scale: 2 });
		downloadBlob(blob, `red_${slugify(pernoesc?.nombre_normalizado)}.png`);
	}

	async function exportMap() {
		const container = document.getElementById('places-map');
		if (!container) return;
		try {
			const canvas = await html2canvas(container, { useCORS: true, scale: 2 });
			canvas.toBlob(blob => {
				if (blob) downloadBlob(blob, `mapa_${slugify(pernoesc?.nombre_normalizado)}.png`);
			});
		} catch (e) {
			console.error('Map export failed:', e);
		}
	}

	function filterByRelation(relType) {
		if (!relationsCy) return;
		if (activeRelFilter === relType) {
			activeRelFilter = null;
			relationsCy.elements().show();
		} else {
			activeRelFilter = relType;
			const currentPersonId = `p${data.id}`;
			relationsCy.elements().hide();
			const matchingEdges = relationsCy.edges(`[relation = "${relType}"]`);
			matchingEdges.show();
			const connectedNodes = matchingEdges.connectedNodes();
			connectedNodes.show();
			relationsCy.$id(currentPersonId).show();
		}
	}

	function toggleSexo() {
		if (!relationsCy) return;
		showSexo = !showSexo;
		if (showSexo) {
			relationsCy.nodes('[sexo = "m"]').style('shape', 'diamond');
			relationsCy.nodes('[sexo = "v"]').style('shape', 'round-rectangle');
			relationsCy.nodes('[sexo = "i"]').style('shape', 'ellipse');
		} else {
			relationsCy.nodes().style('shape', 'ellipse');
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

<svelte:head>
	<title>{pernoesc ? `${pernoesc.nombre_normalizado} — Persona No Esclavizada — Trayectorias Afro` : 'Persona No Esclavizada — Trayectorias Afro'}</title>
</svelte:head>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if pernoesc}

	<div class="entity-banner persona-no-esclavizada">
		<h1>{pernoesc.nombre_normalizado || 'Persona No Esclavizada'}</h1>
		<div class="d-flex align-items-center gap-2 flex-wrap mt-1">
			<span class="entity-type">Persona No Esclavizada</span>
			<SuggestMerge entity="pn" currentId={pernoesc.persona_id} currentLabel={pernoesc.nombre_normalizado} />
		</div>
	</div>

		<div class="detailwrap">
			<div class="detail">
				<h3>ID</h3>
				<div class="detail-bottom"><p>{pernoesc.persona_idno}</p></div>
			</div>
			<div class="detail">
				<h3>Nombres</h3>
				<div class="detail-bottom"><p>{pernoesc.nombres || 'No disponible'}</p></div>
			</div>
			<div class="detail">
				<h3>Apellidos</h3>
				<div class="detail-bottom"><p>{pernoesc.apellidos || 'No disponible'}</p></div>
			</div>
			{#if pernoesc.sexo}
			<div class="detail">
				<h3>Sexo</h3>
				<div class="detail-bottom"><p>{pernoesc.sexo}</p></div>
			</div>
			{/if}
			{#if pernoesc.edad}
			<div class="detail">
				<h3>Edad</h3>
				<div class="detail-bottom"><p>{pernoesc.edad} {pernoesc.unidad_temporal_edad || 'años'}</p></div>
			</div>
			{/if}
		</div>

		<!-- Places Map -->
		{#if pernoesc.lugares && pernoesc.lugares.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-success text-white d-flex justify-content-between align-items-start">
					<div>
						<h2 class="card-title h5 mb-0"><i class="bi bi-geo-alt me-2"></i>Lugares relacionados</h2>
						<small class="text-white-50">Vecindad, residencia, habitación.</small>
					</div>
					<button class="btn btn-sm btn-outline-light" on:click={exportMap} title="Guardar imagen del mapa">
						<i class="bi bi-download me-1"></i>PNG
					</button>
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

		<!-- Relations Network -->
		{#if networkData}
			<div class="card mb-4">
				<div class="card-header bg-info text-white d-flex justify-content-between align-items-start">
					<div>
						<h2 class="card-title h5 mb-0"><i class="bi bi-diagram-2 me-2"></i>Red de Relaciones</h2>
						<small class="text-white-50">Haz clic en un nodo para ver los detalles de esa persona</small>
					</div>
				<div class="d-flex gap-2">
					<button class="btn btn-sm btn-outline-light" on:click={exportNetwork} title="Guardar imagen de la red">
						<i class="bi bi-download me-1"></i>PNG
					</button>
					{#if canEdit}
						<a href="/User/catalogar/relaciones?persona_id={data.id}" class="btn btn-sm btn-outline-light">
							<i class="bi bi-pencil-square me-1"></i>Editar relaciones
						</a>
					{/if}
				</div>
				</div>
				<div class="card-body p-2 pb-0">
					<div class="d-flex flex-wrap gap-1 align-items-center mb-2">
						<small class="text-muted me-1">Filtrar:</small>
						<button class="btn btn-sm network-filter-btn" class:active={activeRelFilter === 'fam'} style="--fc: #D4A27F;" on:click={() => filterByRelation('fam')}>Parentesco</button>

						<button class="btn btn-sm network-filter-btn" class:active={activeRelFilter === 'tmp'} style="--fc: #B8C99A;" on:click={() => filterByRelation('tmp')}>Temporal</button>
						<button class="btn btn-sm network-filter-btn" class:active={activeRelFilter === 'sub'} style="--fc: #9B8EC4;" on:click={() => filterByRelation('sub')}>Subordinación</button>
						<span class="mx-1 text-muted">|</span>
						<button class="btn btn-sm network-filter-btn" class:active={showSexo} style="--fc: #6c757d;" on:click={toggleSexo}>
							<i class="bi bi-shapes me-1"></i>Sexo
						</button>
					</div>
				</div>
				<div class="card-body pt-0">
					<div style="position: relative;">
						<div id="relations-network" style="height: 400px; border: 1px solid #dee2e6; border-radius: 0.375rem;"></div>
						<div id="relations-edge-tooltip" class="network-edge-tooltip" aria-hidden="true"></div>
					</div>
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
					{#if showSexo}
					<div class="row text-center mt-2 border-top pt-2">
						<div class="col-md-4">
							<small class="text-muted">
								<span class="shape-legend diamond me-1"></span>
								Mujer
							</small>
						</div>
						<div class="col-md-4">
							<small class="text-muted">
								<span class="shape-legend rectangle me-1"></span>
								Varón
							</small>
						</div>
						<div class="col-md-4">
							<small class="text-muted">
								<span class="shape-legend circle me-1"></span>
								Desconocido
							</small>
						</div>
					</div>
					{/if}
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
				<i class="bi bi-clock-history me-1"></i>Creado: {formatDate(pernoesc.created_at)}
			</small>
			<small
				class="ms-3"
				data-bs-toggle="tooltip"
				data-bs-placement="top"
				title="Última actualización"
			>
				<i class="bi bi-clock me-1"></i>Actualizado: {formatDate(pernoesc.updated_at)}
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

	.entity-banner.persona-no-esclavizada {
		border-color: #2980b9;
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
		background-color: #C9735B;
		border-color: #A85A44;
	}

	.color-legend-mini.non-enslaved {
		background-color: #9DB5B2;
		border-color: #7A9E9A;
	}

	.color-legend-mini.current {
		background-color: #3B6D8C;
		border-color: #2A4F66;
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
		background: #f8fafa;
		border-radius: 0.375rem;
	}

	#places-map {
		background: white;
	}
</style>
