<script>
	import { onMount, tick } from 'svelte';
	import cytoscape from 'cytoscape';
	import fcose from 'cytoscape-fcose';
	cytoscape.use(fcose);
	import { browser } from '$app/environment';

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
						label: 'data(label)',
						'background-color': '#0074D9',
						color: '#fff',
						'text-valign': 'center',
						'text-halign': 'center',
						width: 30, // Default size, will be updated dynamically
						height: 30, // Default size, will be updated dynamically
						'font-size': '10px'
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
						width: 2, // Increased from 1 to 2
						'line-color': '#999', // Default color, darker than before
						'curve-style': 'bezier',
						'target-arrow-shape': 'none',
						label: 'data(relation)',
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
						width: 3 // Slightly thicker for family relations
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
	}
</script>

<div class="card">
	<div class="card-body">
		<h5 class="card-title">Red de personas relacionadas</h5>

		<div class="d-flex align-items-center mb-3 gap-3">
			<label class="form-label mb-0">Filtrar por tipo:</label>
			<select class="form-select w-auto" bind:value={personTypeFilter} on:change={applyFilter}>
				<option value="all">Todos</option>
				<option value="29">Esclavizada</option>
				<option value="30">No esclavizada</option>
			</select>

			<label class="form-label mb-0">Filtrar relación:</label>
			<select class="form-select w-auto" bind:value={selectedRelation} on:change={applyFilter}>
				{#each relationOptions as rel}
					<option value={rel}>{rel === 'all' ? 'Todas' : rel}</option>
				{/each}
			</select>

			<label class="form-label mb-0">Diseño:</label>
			<select class="form-select w-auto" bind:value={layoutType} on:change={applyLayout}>
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
			<label class="form-label">Filtrar por centralidad:</label>
			<input
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
			<div class="fw-bold mb-2">Leyenda:</div>
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
			</div>
		</div>

		<!-- Always render the container -->
		<div id="network" class:hidden={loading || error}></div>

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
</style>
