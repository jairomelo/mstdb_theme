<script>
	import { onMount, tick, onDestroy } from 'svelte';
	import cytoscape from 'cytoscape';
	import fcose from 'cytoscape-fcose';
	cytoscape.use(fcose);
	import { browser } from '$app/environment';
	import { peresclavizadas, pernoesclavizadas, searchNetwork } from '$lib/api.js';

	let cy;
	let loading = true;
	let error = null;
	let graphData = null;
	let container;

	let layoutType = 'fcose';
	let relationFilter = {
		fam: true,
		aso: true,
		tmp: true,
		sub: true,
	};
	let showOrphans = false;
	let centralityThreshold = 0;
	let minCentrality = 0;
	let maxCentrality = 1;

	let clusterSizeFilter = 0;
	let clusterSizes = [];
	let minClusterSize = 0;
	let maxClusterSize = 0;

	let yearStart = null;
	let yearEnd = null;
	let yearMin = 1500;
	let yearMax = 1900;

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

	function edgeIsVisible(edge) {
		const rel = edge.data('relation');
		return relationFilter[rel] !== false;
	}

	function applyFilter() {
		if (!cy) return;

		cy.edges().forEach((edge) => {
			edge.style('display', edgeIsVisible(edge) ? 'element' : 'none');
		});

		cy.nodes().forEach((node) => {
			const centrality = Number(node.data('centrality') || 0);
			const centralityMatch = centrality >= centralityThreshold;
			const clusterMatch = (node.data('cluster_size') || 0) >= clusterSizeFilter;
			const connectedToVisibleEdge = node.connectedEdges().some((e) => edgeIsVisible(e));
			const shouldShow = centralityMatch && clusterMatch && (showOrphans || connectedToVisibleEdge);
			node.style('display', shouldShow ? 'element' : 'none');
		});
	}

	function applyLayout() {
		if (!cy) return;
		cy.layout({
			name: layoutType,
			animate: true,
			fit: true,
			padding: 25,
			nodeSeparation: 100,
			nodeRepulsion: 4500,
			idealEdgeLength: 130,
			edgeElasticity: 0.2,
			gravity: 0.25,
			numIter: 2000,
		}).run();
	}

	function resetView() {
		if (!cy) return;
		cy.fit();
		cy.zoom(1);
	}

	function clearTooltipTimeout() {
		if (tooltipTimeout) {
			clearTimeout(tooltipTimeout);
			tooltipTimeout = null;
		}
	}

	function hideTooltipLater(delay = 180) {
		clearTooltipTimeout();
		tooltipTimeout = setTimeout(() => {
			tooltip = { ...tooltip, visible: false };
		}, delay);
	}

	function detailHref() {
		if (!tooltip.id) return '#';
		return tooltip.type === 'esclavizada'
			? `/Detail/personaesclavizada/${tooltip.id}`
			: `/Detail/personanoesclavizada/${tooltip.id}`;
	}

	// Compute cluster sizes using connected components algorithm
	function computeClusterSizes(nodes, edges) {
		const clusterMap = new Map();
		const visited = new Set();
		let clusterId = 0;

		// Build adjacency list
		const adj = new Map();
		nodes.forEach(n => adj.set(n.data.id, []));
		edges.forEach(e => {
			adj.get(e.data.source)?.push(e.data.target);
			adj.get(e.data.target)?.push(e.data.source);
		});

		// BFS to find connected components
		function bfs(startNodeId) {
			const queue = [startNodeId];
			const component = [];
			visited.add(startNodeId);

			while (queue.length > 0) {
				const nodeId = queue.shift();
				component.push(nodeId);

				(adj.get(nodeId) || []).forEach(neighborId => {
					if (!visited.has(neighborId)) {
						visited.add(neighborId);
						queue.push(neighborId);
					}
				});
			}

			return component;
		}

		// Find all clusters
		nodes.forEach(n => {
			const nodeId = n.data.id;
			if (!visited.has(nodeId)) {
				const component = bfs(nodeId);
				component.forEach(id => clusterMap.set(id, clusterId));
				clusterId++;
			}
		});

		// Count sizes per cluster
		const sizeCount = new Map();
		clusterMap.forEach((cid, nodeId) => {
			sizeCount.set(cid, (sizeCount.get(cid) || 0) + 1);
		});

		// Map node_id → cluster_size
		const nodeSizes = new Map();
		clusterMap.forEach((cid, nodeId) => {
			nodeSizes.set(nodeId, sizeCount.get(cid));
		});

		return nodeSizes;
	}

	async function renderGraph(data) {
		await tick();
		if (!container || !data) return;

		if (cy) {
			cy.destroy();
			cy = null;
		}

		// Compute cluster sizes and annotate nodes
		const clusterSizes = computeClusterSizes(data.nodes, data.edges);
		const annotatedNodes = data.nodes.map(n => ({
			...n,
			data: {
				...n.data,
				cluster_size: clusterSizes.get(n.data.id) || 1
			}
		}));

		const elements = [...annotatedNodes, ...data.edges];

		cy = cytoscape({
			container,
			elements,
			style: [
				{
					selector: 'node',
					style: {
						label: '',
						width: 'mapData(centrality, 0, 1, 16, 72)',
						height: 'mapData(centrality, 0, 1, 16, 72)',
						'background-color': '#9DB5B2',
						'border-width': 2,
						'border-color': '#7A9E9A',
					},
				},
				{
					selector: 'node[type = "esclavizada"]',
					style: {
						'background-color': '#C9735B',
						'border-color': '#A85A44',
					},
				},
				{
					selector: 'node[in_results = false]',
					style: {
						'background-opacity': 0.6,
						'border-style': 'dashed',
					},
				},
				{
					selector: 'edge',
					style: {
						width: 2,
						'line-color': '#9CA3AF',
						'curve-style': 'bezier',
						'target-arrow-shape': 'none',
						'opacity': 0.8,
					},
				},
				{
					selector: 'edge[relation = "fam"]',
					style: {
						'line-color': '#D4A27F',
						width: 2.2,
					},
				},
				{
					selector: 'edge[relation = "tmp"]',
					style: {
						'line-color': '#B8C99A',
					},
				},
				{
					selector: 'edge[relation = "sub"]',
					style: {
						'line-color': '#9B8EC4',
						'target-arrow-shape': 'triangle',
						'target-arrow-color': '#9B8EC4',
					},
				},
			],
			layout: {
				name: layoutType,
				animate: true,
				fit: true,
				padding: 25,
				nodeSeparation: 100,
				nodeRepulsion: 4500,
				idealEdgeLength: 130,
				edgeElasticity: 0.2,
				gravity: 0.25,
				numIter: 2000,
			},
		});

		const centralities = cy.nodes().map((n) => Number(n.data('centrality') || 0));
		minCentrality = centralities.length ? Math.min(...centralities) : 0;
		maxCentrality = centralities.length ? Math.max(...centralities) : 1;
		if (centralityThreshold < minCentrality || centralityThreshold > maxCentrality) {
			centralityThreshold = minCentrality;
		}

		const clusterSizesArray = cy.nodes().map((n) => Number(n.data('cluster_size') || 1));
		minClusterSize = clusterSizesArray.length ? Math.min(...clusterSizesArray) : 0;
		maxClusterSize = clusterSizesArray.length ? Math.max(...clusterSizesArray) : 1;
		if (clusterSizeFilter < minClusterSize || clusterSizeFilter > maxClusterSize) {
			clusterSizeFilter = minClusterSize;
		}

		cy.on('mouseover', 'node', async (event) => {
			const node = event.target;
			const nodeType = node.data('type');
			const nodeId = String(node.data('persona_id') || node.data('id')).replace(/^\D+/g, '');
			const pos = node.renderedPosition();
			const rect = container.getBoundingClientRect();

			clearTooltipTimeout();
			tooltip = {
				visible: true,
				x: pos.x + rect.left,
				y: pos.y + rect.top - 65,
				name: node.data('label') || '',
				id: nodeId,
				type: nodeType,
				loading: true,
				details: null,
			};

			try {
				let details = null;
				if (nodeType === 'esclavizada') {
					details = await peresclavizadas(nodeId);
				} else {
					details = await pernoesclavizadas(nodeId);
				}
				if (tooltip.visible && tooltip.id === nodeId) {
					tooltip = { ...tooltip, loading: false, details };
				}
			} catch (e) {
				if (tooltip.visible && tooltip.id === nodeId) {
					tooltip = { ...tooltip, loading: false };
				}
			}
		});

		cy.on('mouseout', 'node', () => hideTooltipLater());
		cy.on('pan zoom', () => {
			tooltip = { ...tooltip, visible: false };
		});

		applyFilter();
	}

	async function fetchNetworkData() {
		if (!browser) return;

		loading = true;
		error = null;

		try {
			const params = {};

			// Add year filter if specified
			if (yearStart !== null || yearEnd !== null) {
				const start = yearStart !== null ? yearStart : yearMin;
				const end = yearEnd !== null ? yearEnd : yearMax;
				params.year = `${start},${end}`;
			}

			const data = await searchNetwork(params);
			graphData = data;
			await renderGraph(data);
		} catch (e) {
			error = e.message || 'Failed to load network data';
			console.error('Network fetch error:', e);
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		await fetchNetworkData();
	});

	onDestroy(() => {
		clearTooltipTimeout();
		if (cy) {
			cy.destroy();
			cy = null;
		}
	});
</script>

<div class="card">
	<div class="card-body">
		<h5 class="card-title">Red de personas relacionadas</h5>

		<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
			<select class="form-select form-select-sm w-auto" bind:value={layoutType} on:change={applyLayout} aria-label="Tipo de diseño">
				<option value="fcose">FCoSE</option>
				<option value="cose">CoSE</option>
				<option value="circle">Círculo</option>
				<option value="concentric">Concéntrico</option>
				<option value="grid">Cuadrícula</option>
			</select>

			<button class="btn btn-sm btn-outline-secondary" on:click={resetView}>
				<i class="bi bi-arrows-fullscreen me-1" aria-hidden="true"></i>Reenfocar
			</button>
		</div>

		<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
			<span class="form-label mb-0" aria-hidden="true">Relaciones:</span>
			<label class="form-check form-check-inline mb-0">
				<input class="form-check-input" type="checkbox" bind:checked={relationFilter.fam} on:change={applyFilter}>
				<span class="form-check-label">Parentesco</span>
			</label>
			<label class="form-check form-check-inline mb-0">
				<input class="form-check-input" type="checkbox" bind:checked={relationFilter.aso} on:change={applyFilter}>
				<span class="form-check-label">Asociación</span>
			</label>
			<label class="form-check form-check-inline mb-0">
				<input class="form-check-input" type="checkbox" bind:checked={relationFilter.tmp} on:change={applyFilter}>
				<span class="form-check-label">Temporal</span>
			</label>
			<label class="form-check form-check-inline mb-0">
				<input class="form-check-input" type="checkbox" bind:checked={relationFilter.sub} on:change={applyFilter}>
				<span class="form-check-label">Subordinación</span>
			</label>
			<label class="form-check form-check-inline mb-0 ms-2">
				<input class="form-check-input" type="checkbox" bind:checked={showOrphans} on:change={applyFilter}>
				<span class="form-check-label">Mostrar nodos huérfanos</span>
			</label>
		</div>

		<div class="mb-3">
			<label for="centrality-threshold" class="form-label">Centralidad mínima</label>
			<input
				id="centrality-threshold"
				type="range"
				class="form-range"
				min={minCentrality}
				max={maxCentrality}
				step="0.01"
				bind:value={centralityThreshold}
				on:input={applyFilter}
			>
			<small class="text-muted">Mostrando nodos con centralidad mayor o igual a {Number(centralityThreshold).toFixed(2)}</small>
		</div>

		<div class="mb-3">
			<label for="cluster-size-threshold" class="form-label">Tamaño mínimo de componente</label>
			<input
				id="cluster-size-threshold"
				type="range"
				class="form-range"
				min={minClusterSize}
				max={maxClusterSize}
				step="1"
				bind:value={clusterSizeFilter}
				on:input={applyFilter}
			>
			<small class="text-muted">Mostrando nodos en componentes de tamaño ≥ {Math.round(clusterSizeFilter)}</small>
		</div>

		<div class="mb-3">
			<label class="form-label">Rango de años (documento)</label>
			<div class="d-flex gap-2 align-items-center">
				<input
					type="number"
					class="form-control form-control-sm"
					style="max-width: 100px;"
					placeholder="Año inicio"
					bind:value={yearStart}
					min={yearMin}
					max={yearMax}
					on:change={fetchNetworkData}
				>
				<span>—</span>
				<input
					type="number"
					class="form-control form-control-sm"
					style="max-width: 100px;"
					placeholder="Año fin"
					bind:value={yearEnd}
					min={yearMin}
					max={yearMax}
					on:change={fetchNetworkData}
				>
				<small class="text-muted ms-2">({yearMin}–{yearMax})</small>
			</div>
		</div>

		<div class="d-flex flex-wrap gap-3 align-items-center mb-2 small text-muted">
			<span><span class="badge" style="background:#C9735B">&nbsp;</span> Persona esclavizada</span>
			<span><span class="badge" style="background:#9DB5B2">&nbsp;</span> Persona no esclavizada</span>
			<span><span class="badge bg-light text-dark border">&nbsp;</span> Vecino fuera de resultados</span>
		</div>

		{#if graphData?.meta?.truncated}
			<div class="alert alert-warning py-2">
				<i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
				La red fue truncada por tamaño. Ajuste filtros para una visualización más precisa.
			</div>
		{/if}

		{#if loading}
			<div class="text-center py-3">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Cargando...</span>
				</div>
			</div>
		{:else if error}
			<div class="alert alert-danger mt-3">
				<i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>{error}
			</div>
		{:else}
			<div bind:this={container} class="border rounded" style="height: 560px;"></div>

			{#if graphData && (graphData.nodes || []).length === 0}
				<div class="alert alert-info mt-3">
					<i class="bi bi-info-circle me-1" aria-hidden="true"></i>No hay relaciones para los filtros activos.
				</div>
			{:else if graphData?.meta}
				<div class="text-muted small mt-2">
					Nodos: {graphData.meta.node_count} · Aristas: {graphData.meta.edge_count} · Resultados base: {graphData.meta.result_count}
				</div>
			{/if}
		{/if}

		{#if tooltip.visible}
			<div
				class="card shadow position-fixed"
				style="left: {tooltip.x + 12}px; top: {tooltip.y}px; z-index: 1200; max-width: 340px;"
				role="tooltip"
				on:mouseenter={clearTooltipTimeout}
				on:mouseleave={() => hideTooltipLater(100)}
			>
				<div class="card-body py-2 px-3">
					<div class="fw-semibold">{tooltip.name}</div>
					<div class="small text-muted mb-1">ID: {tooltip.id}</div>
					{#if tooltip.loading}
						<div class="small text-muted">Cargando detalles...</div>
					{:else if tooltip.details}
						<div class="small">
							{#if tooltip.details.sexo}<div><strong>Sexo:</strong> {tooltip.details.sexo}</div>{/if}
							{#if tooltip.details.edad}<div><strong>Edad:</strong> {tooltip.details.edad}</div>{/if}
							{#if tooltip.details.ocupaciones?.length}<div><strong>Ocupaciones:</strong> {tooltip.details.ocupaciones.join(', ')}</div>{/if}
							{#if tooltip.details.etnonimos?.length}<div><strong>Etnónimos:</strong> {tooltip.details.etnonimos.join(', ')}</div>{/if}
						</div>
					{/if}
					<a class="btn btn-sm btn-outline-primary mt-2" href={detailHref()}>
						<i class="bi bi-box-arrow-up-right me-1" aria-hidden="true"></i>Ver ficha
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
</style>
