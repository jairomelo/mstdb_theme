<script>
	import { onMount, tick } from 'svelte';
	import cytoscape from 'cytoscape';
	import fcose from 'cytoscape-fcose';
	cytoscape.use(fcose);
	import { browser } from '$app/environment';
	import { peresclavizadas, pernoesclavizadas } from '$lib/api.js';

	let cy;
	let loading = true;
	let error = null;

	let layoutType = 'fcose';
	let personTypeFilter = 'all';

	let centralityThreshold = 0;
	let minCentrality = 0;
	let maxCentrality = 0;

	let relationOptions = [];
	let selectedRelation = 'all';
	let tooltip = {
		visible: false,
		x: 0,
		y: 0,
		name: '',
		id: '',
		type: '',
		loading: false,
		details: null
	};
	let tooltipTimeout;

	function applyLayout() {
		if (!cy) return;
		cy.layout({
			name: layoutType,
			animate: true,
			fit: true,
			padding: 30
		}).run();
	}

	function resetZoom() {
		if (cy) {
			cy.fit();
		}
	}

	function handleTooltipMouseEnter() {
		// Cancel any pending hide timeout when hovering over tooltip
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
			tooltipTimeout = null;
		}
	}

	function handleTooltipMouseLeave() {
		// Hide tooltip when leaving the tooltip area
		tooltipTimeout = setTimeout(() => {
			tooltip = { ...tooltip, visible: false };
		}, 100); // Shorter delay when leaving tooltip
	}

	function applyFilter() {
		if (!cy) return;

        cy.nodes().forEach(node => node.style('display', 'element'));

		cy.edges().forEach((edge) => {
			const match = selectedRelation === 'all' || edge.data('relation') === selectedRelation;
			edge.style('display', match ? 'element' : 'none');
		});

		cy.nodes().forEach((node) => {
			const typeMatch =
				personTypeFilter === 'all' || node.data('type').toString() === personTypeFilter;
			const centralityMatch = node.data('centrality') >= centralityThreshold;
			const connectedToVisibleEdge = node.connectedEdges().some((e) => e.visible());

			const match = typeMatch && centralityMatch && connectedToVisibleEdge;
			node.style('display', match ? 'element' : 'none');
		});
	}

	onMount(async () => {
		if (!browser) return;
		try {
			const res = await fetch('/temp/persona_network.json');
			if (!res.ok) throw new Error('Failed to load network data');
			const network = await res.json();

			await tick(); // Ensure DOM is ready before drawing
			drawNetwork(network);
			loading = false;
		} catch (e) {
			error = e.message;
			loading = false;
		}
	});

	function drawNetwork(data) {
		const container = document.getElementById('network');
		if (!container) {
			console.error('❌ #network container not found!');
			return;
		}

		console.log('✅ Drawing network in:', container);

		cy = cytoscape({
			container,
			elements: [...data.nodes, ...data.edges],
			style: [
				{
					selector: 'node',
					style: {
						label: '', // Hide labels by default
						'background-color': '#0074D9',
						color: '#000',
						'text-valign': 'center',
						'text-halign': 'center',
						width: 30, // Default size, will be updated dynamically
						height: 30, // Default size, will be updated dynamically
						'font-size': '12px',
						'text-outline-width': 2,
						'text-outline-color': '#fff'
					}
				},
				{
					selector: 'node:selected',
					style: {
						label: 'data(label)',
						'border-width': 4,
						'border-color': '#FFD700'
					}
				},
				{
					selector: 'node[type = 29]',
					style: {
						'background-color': '#FF6B6B',
						'border-width': 2,
						'border-color': '#FF4757'
					}
				},
				{
					selector: 'node[type = 30]',
					style: {
						'background-color': '#4ECDC4',
						'border-width': 2,
						'border-color': '#26D0CE'
					}
				},
				{
					selector: 'edge',
					style: {
						width: 2, 
						'line-color': '#999', 
						'curve-style': 'bezier',
						'target-arrow-shape': 'none',
						'font-size': '8px',
						color: '#666'
					}
				},
				{
					selector: 'edge[relation = "aso"]', // Association relations
					style: {
						'line-color': '#3498DB', // Blue
						width: 2
					}
				},
				{
					selector: 'edge[relation = "fam"]', // Family relations
					style: {
						'line-color': '#E74C3C', // Red
						width: 3 
					}
				},
				{
					selector: 'edge[relation = "tmp"]', // Temporal relations
					style: {
						'line-color': '#F39C12', // Orange
						width: 2
					}
				}
			],
			layout: {
				name: layoutType,
				animate: true,
				randomize: true,
				fit: true,
				padding: 30,
				nodeSeparation: 100,
				nodeRepulsion: 4500,
				idealEdgeLength: 150,
				edgeElasticity: 0.1,
				gravity: 0.25,
				initialEnergyOnIncremental: 0.5
			}
		});

		relationOptions = [...new Set(cy.edges().map((e) => e.data('relation')))].sort();
		relationOptions.unshift('all');

		const centralities = cy.nodes().map((n) => n.data('centrality'));
		minCentrality = Math.min(...centralities);
		maxCentrality = Math.max(...centralities);
		centralityThreshold = minCentrality;

		// Update node sizes based on actual centrality range
		cy.style()
			.selector('node')
			.style({
				width: `mapData(centrality, ${minCentrality}, ${maxCentrality}, 15, 80)`,
				height: `mapData(centrality, ${minCentrality}, ${maxCentrality}, 15, 80)`
			})
			.update();

		// Add hover events for tooltip
		cy.on('mouseover', 'node', async function(event) {
			const node = event.target;
			const renderedPosition = node.renderedPosition();
			const containerRect = container.getBoundingClientRect();
			
			// Clear any existing timeout
			if (tooltipTimeout) {
				clearTimeout(tooltipTimeout);
				tooltipTimeout = null;
			}
			
			const nodeId = node.data('id').replace(/^\D+/g, '');
			const nodeType = node.data('type');
			
			// Show tooltip immediately with basic info
			tooltip = {
				visible: true,
				x: renderedPosition.x + containerRect.left,
				y: renderedPosition.y + containerRect.top - 60,
				name: node.data('label'),
				id: nodeId,
				type: nodeType,
				loading: true,
				details: null
			};

			// Fetch detailed person data
			try {
				let personDetails;
				if (nodeType === 29) {
					// Enslaved person
					personDetails = await peresclavizadas(nodeId);
				} else if (nodeType === 30) {
					// Non-enslaved person
					personDetails = await pernoesclavizadas(nodeId);
				}

				// Update tooltip with fetched details (only if still visible and for same node)
				if (tooltip.visible && tooltip.id === nodeId) {
					tooltip = {
						...tooltip,
						loading: false,
						details: personDetails
					};
				}
			} catch (error) {
				console.warn('Failed to fetch person details:', error);
				// Update tooltip to show loading finished even if failed
				if (tooltip.visible && tooltip.id === nodeId) {
					tooltip = {
						...tooltip,
						loading: false,
						details: null
					};
				}
			}
		});

		cy.on('mouseout', 'node', function(event) {
			// Add delay before hiding tooltip
			tooltipTimeout = setTimeout(() => {
				tooltip = { ...tooltip, visible: false };
			}, 200); // 200ms delay
		});

		cy.on('pan zoom', function() {
			tooltip = { ...tooltip, visible: false };
		});

		cy.on('tap', 'node', function(event) {
			const node = event.target;
			// Hide tooltip on click
			tooltip = { ...tooltip, visible: false };
			// Unselect all other nodes
			cy.nodes().unselect();
			// Select this node
			node.select();
		});

		// Add click on background to deselect
		cy.on('tap', function(event) {
			if (event.target === cy) {
				tooltip = { ...tooltip, visible: false };
				cy.nodes().unselect();
			}
		});
	}
</script>

<div class="card">
	<div class="card-body">
		<h5 class="card-title">Red de personas relacionadas</h5>

		<div class="d-flex align-items-center mb-3 gap-3">
			<label for="person-type-filter" class="form-label mb-0">Filtrar por tipo:</label>
			<select id="person-type-filter" class="form-select w-auto" bind:value={personTypeFilter} on:change={applyFilter}>
				<option value="all">Todos</option>
				<option value="29">Esclavizada</option>
				<option value="30">No esclavizada</option>
			</select>

			<label for="relation-filter" class="form-label mb-0">Filtrar relación:</label>
			<select id="relation-filter" class="form-select w-auto" bind:value={selectedRelation} on:change={applyFilter}>
				{#each relationOptions as rel}
					<option value={rel}>{rel === 'all' ? 'Todas' : rel}</option>
				{/each}
			</select>

			<label for="layout-type" class="form-label mb-0">Diseño:</label>
			<select id="layout-type" class="form-select w-auto" bind:value={layoutType} on:change={applyLayout}>
				<option value="fcose">FCoSE</option>
				<option value="cose">CoSE</option>
				<option value="circle">Círculo</option>
				<option value="concentric">Concéntrico</option>
				<option value="grid">Cuadrícula</option>
			</select>

			<button class="btn btn-outline-primary btn-sm" on:click={resetZoom}>
				<i class="bi bi-arrows-fullscreen me-1"></i> Reenfocar
			</button>
		</div>

		<div class="mb-3">
			<label for="centrality-slider" class="form-label">Filtrar por centralidad:</label>
			<input
				id="centrality-slider"
				type="range"
				min={minCentrality}
				max={maxCentrality}
				step="0.001"
				bind:value={centralityThreshold}
				on:input={applyFilter}
				class="form-range"
			/>
			<small>Mostrando nodos con centralidad ≥ {centralityThreshold}</small>
		</div>

		<!-- Color Legend -->
		<div class="mb-3">
			<div class="fw-bold mb-2">Leyenda e interacciones:</div>
			<div class="d-flex gap-4 align-items-start flex-wrap">
				<div>
					<div class="fw-semibold mb-2" style="font-size: 0.9rem;">Colores por tipo:</div>
					<div class="d-flex gap-3 align-items-center">
						<div class="d-flex align-items-center">
							<div class="color-legend enslaved me-2"></div>
							<small>Esclavizada</small>
						</div>
						<div class="d-flex align-items-center">
							<div class="color-legend non-enslaved me-2"></div>
							<small>No esclavizada</small>
						</div>
					</div>
				</div>
				<div>
					<div class="fw-semibold mb-2" style="font-size: 0.9rem;">Tamaño por centralidad:</div>
					<div class="d-flex gap-2 align-items-center">
						<div class="size-legend small"></div>
						<small>Baja</small>
						<div class="size-legend medium"></div>
						<small>Media</small>
						<div class="size-legend large"></div>
						<small>Alta</small>
					</div>
				</div>
				<div>
					<div class="fw-semibold mb-2" style="font-size: 0.9rem;">Conexiones por relación:</div>
					<div class="d-flex flex-column gap-1">
						<div class="d-flex align-items-center">
							<div class="edge-legend aso me-2"></div>
							<small>Asociación (aso)</small>
						</div>
						<div class="d-flex align-items-center">
							<div class="edge-legend fam me-2"></div>
							<small>Familiar (fam)</small>
						</div>
						<div class="d-flex align-items-center">
							<div class="edge-legend tmp me-2"></div>
							<small>Temporal (tmp)</small>
						</div>
					</div>
				</div>
				<div>
					<div class="fw-semibold mb-2" style="font-size: 0.9rem;">Interacciones:</div>
					<div class="d-flex flex-column gap-1">
						<small><i class="bi bi-cursor me-1"></i>Hover: ver tarjeta info</small>
						<small><i class="bi bi-hand-index me-1"></i>Click: seleccionar nodo</small>
						<small><i class="bi bi-box-arrow-up-right me-1"></i>Botón: ir a detalles</small>
					</div>
				</div>
			</div>
		</div>

		<!-- Always render the container -->
		<div id="network" class:hidden={loading || error}></div>

		<!-- Tooltip -->
		{#if tooltip.visible}
			<div 
				class="node-tooltip" 
				style="left: {tooltip.x}px; top: {tooltip.y}px;"
				on:mouseenter={handleTooltipMouseEnter}
				on:mouseleave={handleTooltipMouseLeave}
				role="tooltip"
			>
				<div class="tooltip-header">
					<strong>{tooltip.name}</strong>
					<div class="tooltip-type" class:enslaved={tooltip.type === 29} class:non-enslaved={tooltip.type === 30}>
						{tooltip.type === 29 ? 'Esclavizada' : 'No esclavizada'}
					</div>
				</div>
				
				<!-- Show loading spinner while fetching details -->
				{#if tooltip.loading}
					<div class="tooltip-loading">
						<div class="spinner-border spinner-border-sm text-primary me-2" role="status">
							<span class="visually-hidden">Cargando...</span>
						</div>
						<small class="text-muted">Cargando detalles...</small>
					</div>
				{:else if tooltip.details}
					<!-- Show fetched details -->
					<div class="tooltip-details">
						{#if tooltip.details.sexo}
							<div class="detail-item">
								<small class="text-muted">Sexo:</small>
								<small class="fw-medium">{tooltip.details.sexo}</small>
							</div>
						{/if}
						{#if tooltip.details.edad}
							<div class="detail-item">
								<small class="text-muted">Edad:</small>
								<small class="fw-medium">{tooltip.details.edad} {#if tooltip.details.unidad_temporal_edad != undefined}{tooltip.details.unidad_temporal_edad}{/if}</small>
							</div>
						{/if}
						{#if tooltip.details.hispanizacion && tooltip.details.hispanizacion.length > 0}
						  <!-- iterate over the hispanizacion list -->
							<div class="detail-item">
								<small class="text-muted">Agencia / Adaptación:</small>
								<small class="fw-medium">
									{#each tooltip.details.hispanizacion as hisp, i}
										{hisp}{#if i < tooltip.details.hispanizacion.length - 1}, {/if}
									{/each}
								</small>
							</div>
						{/if}
						{#if tooltip.details.etnonimos && tooltip.details.etnonimos.length > 0}
							<div class="detail-item">
								<small class="text-muted">Etnónimos:</small>
								<small class="fw-medium">
									{#each tooltip.details.etnonimos as etno, i}
										{etno}{#if i < tooltip.details.etnonimos.length - 1}, {/if}
									{/each}
								</small>
							</div>
						{/if}
						{#if tooltip.details.ocupaciones && tooltip.details.ocupaciones.length > 0}
							<div class="detail-item">
								<small class="text-muted">Ocupación:</small>
								<small class="fw-medium">
									{#each tooltip.details.ocupaciones as ocup, i}
										{ocup}{#if i < tooltip.details.ocupaciones.length - 1}, {/if}
									{/each}
								</small>
							</div>
						{/if}
						<!-- Add more fields as needed -->
					</div>
				{/if}
				
				<div class="tooltip-actions">
					<a 
						href={"/Detail/" + (tooltip.type === 29 ? "personaesclavizada" : "personanoesclavizada") + "/" + tooltip.id}
						class="btn btn-sm btn-primary"
						on:click={() => tooltip = { ...tooltip, visible: false }}
					>
						<i class="bi bi-eye me-1"></i>Ver detalles
					</a>
				</div>
			</div>
		{/if}

		{#if loading}
			<div class="text-center mt-3">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Cargando...</span>
				</div>
				<p class="text-muted mt-2">Cargando red...</p>
			</div>
		{:else if error}
			<div class="alert alert-danger mt-3" role="alert">
				<i class="bi bi-exclamation-triangle-fill me-2"></i>
				Error cargando red: {error}
			</div>
		{/if}
	</div>
</div>

<style>
	#network {
		width: 100%;
		height: 600px;
		border-radius: 0.5rem;
		border: 1px solid var(--bs-border-color);
		background: white;
	}

	.hidden {
		display: none;
	}

	.form-select {
		font-size: 0.875rem;
		padding: 0.25rem 0.5rem;
	}

	.btn-sm {
		font-size: 0.8rem;
	}

	.color-legend {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid;
	}

	.color-legend.enslaved {
		background-color: #FF6B6B;
		border-color: #FF4757;
	}

	.color-legend.non-enslaved {
		background-color: #4ECDC4;
		border-color: #26D0CE;
	}

	.size-legend {
		border-radius: 50%;
		background-color: #6c757d;
		border: 2px solid #495057;
	}

	.size-legend.small {
		width: 10px;
		height: 10px;
	}

	.size-legend.medium {
		width: 16px;
		height: 16px;
	}

	.size-legend.large {
		width: 24px;
		height: 24px;
	}

	.edge-legend {
		width: 30px;
		height: 3px;
		border-radius: 1px;
	}

	.edge-legend.aso {
		background-color: #3498DB;
	}

	.edge-legend.fam {
		background-color: #E74C3C;
		height: 4px; /* Slightly thicker like the actual edges */
	}

	.edge-legend.tmp {
		background-color: #F39C12;
	}

	.node-tooltip {
		position: fixed;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 12px;
		z-index: 1000;
		min-width: 200px;
		font-size: 0.9rem;
		transform: translateX(-50%);
		pointer-events: auto; /* Allow interactions with tooltip */
		cursor: default;
	}

	.tooltip-header {
		margin-bottom: 8px;
	}

	.tooltip-header strong {
		display: block;
		color: #2c3e50;
		margin-bottom: 4px;
		font-size: 1rem;
	}

	.tooltip-type {
		font-size: 0.8rem;
		padding: 2px 8px;
		border-radius: 12px;
		display: inline-block;
		font-weight: 500;
		background-color: #e9ecef;
		color: #495057;
	}

	.tooltip-type.enslaved {
		background-color: #FF6B6B;
		color: white;
	}

	.tooltip-type.non-enslaved {
		background-color: #4ECDC4;
		color: white;
	}

	.tooltip-actions {
		margin-top: 8px;
	}

	.tooltip-actions .btn {
		font-size: 0.8rem;
		padding: 4px 8px;
	}

	.tooltip-loading {
		display: flex;
		align-items: center;
		margin: 8px 0;
		padding: 4px 0;
	}

	.tooltip-details {
		margin: 8px 0;
		border-top: 1px solid #e9ecef;
		padding-top: 8px;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
		gap: 8px;
	}

	.detail-item:last-child {
		margin-bottom: 0;
	}

	.detail-item .text-muted {
		flex-shrink: 0;
		min-width: 50px;
	}

	.detail-item .fw-medium {
		text-align: right;
		word-break: break-word;
	}
</style>
