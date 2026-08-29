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

	let filtersCollapsed = false;

	$: isFiltered =
		!relationFilter.fam ||
		!relationFilter.aso ||
		!relationFilter.tmp ||
		!relationFilter.sub ||
		showOrphans ||
		centralityThreshold > minCentrality ||
		clusterSizeFilter > minClusterSize ||
		yearStart !== null ||
		yearEnd !== null;

	function toggleFilters() {
		filtersCollapsed = !filtersCollapsed;
	}

	function resetFilters() {
		relationFilter = {
			fam: true,
			aso: true,
			tmp: true,
			sub: true,
		};
		showOrphans = false;
		centralityThreshold = minCentrality;
		clusterSizeFilter = minClusterSize;
		const reloadRequired = yearStart !== null || yearEnd !== null;
		yearStart = null;
		yearEnd = null;

		if (reloadRequired) {
			fetchNetworkData();
		} else {
			applyFilter();
		}
	}

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

		// Build adjacency list (use node IDs from data)
		const adj = new Map();
		nodes.forEach(n => {
			const nodeId = n.data?.id || n.id;
			if (nodeId) adj.set(nodeId, []);
		});
		edges.forEach(e => {
			const source = e.data?.source || e.source;
			const target = e.data?.target || e.target;
			if (source && target) {
				adj.get(source)?.push(target);
				adj.get(target)?.push(source);
			}
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

		// Ensure container has computed dimensions
		await tick();
		const rect = container.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) {
			console.warn('Container has zero dimensions, retrying...');
			await new Promise(resolve => setTimeout(resolve, 100));
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

		// Ensure layout runs after graph is created
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

		applyFilter();
	}

	async function fetchNetworkData() {
		if (!browser) return;

		loading = true;
		error = null;

		try {
			const params = {};

			if (yearStart !== null || yearEnd !== null) {
				const start = yearStart !== null ? yearStart : yearMin;
				const end = yearEnd !== null ? yearEnd : yearMax;
				params.year = `${start},${end}`;
			}

			const data = await searchNetwork(params);
			graphData = data;
			// Container is gated behind loading=false, so reveal it before rendering
			loading = false;
			await tick();
			await renderGraph(data);
		} catch (e) {
			error = e.message || 'Failed to load network data';
			console.error('Network fetch error:', e);
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
		<div class="d-flex align-items-center justify-content-between mb-3">
			<h5 class="card-title mb-0">Red de personas relacionadas</h5>
		</div>

		<!-- Unified Compact Network Controls Panel -->
		<div class="network-controls-panel">
			<div class="network-toolbar">
				<div class="network-toolbar-group">
					<!-- Design Layout dropdown -->
					<div class="input-group input-group-sm w-auto">
						<span class="input-group-text bg-white border-end-0 text-muted">
							<i class="bi bi-diagram-3" aria-hidden="true"></i>
						</span>
						<select
							class="form-select form-select-sm border-start-0 ps-1"
							bind:value={layoutType}
							on:change={applyLayout}
							aria-label="Tipo de diseño"
						>
							<option value="fcose">FCoSE (Orgánico)</option>
							<option value="cose">CoSE</option>
							<option value="circle">Círculo</option>
							<option value="concentric">Concéntrico</option>
							<option value="grid">Cuadrícula</option>
						</select>
					</div>

					<!-- Reenfocar button -->
					<button
						type="button"
						class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
						on:click={resetView}
						title="Reenfocar vista"
					>
						<i class="bi bi-arrows-fullscreen" aria-hidden="true"></i>
						<span class="d-none d-sm-inline">Reenfocar</span>
					</button>
				</div>

				<div class="network-toolbar-group ms-auto">
					<!-- Filter toggle button -->
					<button
						type="button"
						class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
						class:active={!filtersCollapsed}
						on:click={toggleFilters}
						aria-expanded={!filtersCollapsed}
						aria-label="Alternar filtros"
					>
						<i class="bi bi-funnel{isFiltered ? '-fill text-primary' : ''}" aria-hidden="true"></i>
						<span>Filtros</span>
						{#if isFiltered}
							<span class="badge rounded-pill bg-primary" style="font-size: 0.6rem;">•</span>
						{/if}
					</button>

					<!-- Reset filters button -->
					{#if isFiltered}
						<button
							type="button"
							class="btn btn-sm btn-link text-decoration-none text-muted p-0 ms-1 small d-inline-flex align-items-center gap-1"
							on:click={resetFilters}
							title="Restablecer filtros"
						>
							<i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
							<span>Restablecer</span>
						</button>
					{/if}
				</div>
			</div>

			<!-- Filter options (collapsible) -->
			{#if !filtersCollapsed}
				<div class="network-filter-section">
					<!-- Relation Pills & Orphans Switch -->
					<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
						<div class="network-relation-pills" role="group" aria-label="Filtros de relaciones">
							<span class="small fw-semibold text-muted me-1">Relaciones:</span>

							<label class="network-pill-btn" class:active={relationFilter.fam} class:inactive={!relationFilter.fam}>
								<input class="visually-hidden" type="checkbox" bind:checked={relationFilter.fam} on:change={applyFilter} />
								<span class="color-dot" style="background-color: #D4A27F;"></span>
								<span>Parentesco</span>
							</label>

							<label class="network-pill-btn" class:active={relationFilter.aso} class:inactive={!relationFilter.aso}>
								<input class="visually-hidden" type="checkbox" bind:checked={relationFilter.aso} on:change={applyFilter} />
								<span class="color-dot" style="background-color: #9CA3AF;"></span>
								<span>Asociación</span>
							</label>

							<label class="network-pill-btn" class:active={relationFilter.tmp} class:inactive={!relationFilter.tmp}>
								<input class="visually-hidden" type="checkbox" bind:checked={relationFilter.tmp} on:change={applyFilter} />
								<span class="color-dot" style="background-color: #B8C99A;"></span>
								<span>Temporal</span>
							</label>

							<label class="network-pill-btn" class:active={relationFilter.sub} class:inactive={!relationFilter.sub}>
								<input class="visually-hidden" type="checkbox" bind:checked={relationFilter.sub} on:change={applyFilter} />
								<span class="color-dot" style="background-color: #9B8EC4;"></span>
								<span>Subordinación</span>
							</label>
						</div>

						<!-- Orphan Switch -->
						<div class="form-check form-switch mb-0">
							<input
								class="form-check-input"
								type="checkbox"
								id="show-orphans-toggle"
								bind:checked={showOrphans}
								on:change={applyFilter}
							/>
							<label class="form-check-label small fw-semibold text-muted" for="show-orphans-toggle">
								Mostrar huérfanos
							</label>
						</div>
					</div>

					<!-- Metrics and Range 3-column Grid -->
					<div class="row row-cols-1 row-cols-md-3 g-2">
						<!-- Centralidad -->
						<div class="col">
							<div class="network-metric-card">
								<div class="metric-header">
									<label for="centrality-threshold" class="metric-title">
										<i class="bi bi-diagram-2" aria-hidden="true"></i>
										Centralidad mín.
									</label>
									<span class="metric-badge">≥ {Number(centralityThreshold).toFixed(2)}</span>
								</div>
								<div class="metric-slider-wrapper">
									<span class="slider-bound">{minCentrality.toFixed(1)}</span>
									<input
										id="centrality-threshold"
										type="range"
										class="form-range"
										min={minCentrality}
										max={maxCentrality}
										step="0.01"
										bind:value={centralityThreshold}
										on:input={applyFilter}
										aria-label="Centralidad mínima"
									/>
									<span class="slider-bound">{maxCentrality.toFixed(1)}</span>
								</div>
							</div>
						</div>

						<!-- Tamaño de componente -->
						<div class="col">
							<div class="network-metric-card">
								<div class="metric-header">
									<label for="cluster-size-threshold" class="metric-title">
										<i class="bi bi-bounding-box-circles" aria-hidden="true"></i>
										Tamaño componente
									</label>
									<span class="metric-badge">≥ {Math.round(clusterSizeFilter)}</span>
								</div>
								<div class="metric-slider-wrapper">
									<span class="slider-bound">{minClusterSize}</span>
									<input
										id="cluster-size-threshold"
										type="range"
										class="form-range"
										min={minClusterSize}
										max={maxClusterSize}
										step="1"
										bind:value={clusterSizeFilter}
										on:input={applyFilter}
										aria-label="Tamaño mínimo de componente"
									/>
									<span class="slider-bound">{maxClusterSize}</span>
								</div>
							</div>
						</div>

						<!-- Rango de años -->
						<div class="col">
							<div class="network-metric-card">
								<div class="metric-header">
									<span class="metric-title">
										<i class="bi bi-calendar-range" aria-hidden="true"></i>
										Años (documento)
									</span>
									<span class="metric-badge">{yearMin} – {yearMax}</span>
								</div>
								<div class="d-flex gap-1 align-items-center">
									<input
										type="number"
										class="form-control form-control-sm"
										placeholder={String(yearMin)}
										bind:value={yearStart}
										min={yearMin}
										max={yearMax}
										on:change={fetchNetworkData}
										aria-label="Año de inicio"
									/>
									<span class="text-muted small">—</span>
									<input
										type="number"
										class="form-control form-control-sm"
										placeholder={String(yearMax)}
										bind:value={yearEnd}
										min={yearMin}
										max={yearMax}
										on:change={fetchNetworkData}
										aria-label="Año de fin"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Legend & Network Stats Bar -->
		<div class="network-legend-bar mb-3">
			<div class="d-flex flex-wrap align-items-center gap-3">
				<span class="network-legend-item">
					<span class="legend-color-chip" style="background:#C9735B;"></span>
					Persona esclavizada
				</span>
				<span class="network-legend-item">
					<span class="legend-color-chip" style="background:#9DB5B2;"></span>
					Persona no esclavizada
				</span>
				{#if graphData?.meta?.result_count !== undefined}
					<span class="network-legend-item">
						<span class="legend-color-chip border bg-white"></span>
						Vecino fuera de resultados
					</span>
				{/if}
			</div>

			{#if graphData?.meta}
				<div class="text-muted small ms-auto fw-semibold">
					<span>Nodos: <strong>{graphData.meta.node_count}</strong></span>
					<span class="mx-1">·</span>
					<span>Aristas: <strong>{graphData.meta.edge_count}</strong></span>
					{#if graphData.meta.result_count !== undefined}
						<span class="mx-1">·</span>
						<span>Base: <strong>{graphData.meta.result_count}</strong></span>
					{/if}
				</div>
			{/if}
		</div>

		{#if graphData?.meta?.truncated}
			<div class="alert alert-warning py-2 mb-3">
				<i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
				La red fue truncada por tamaño. Ajuste filtros para una visualización más precisa.
			</div>
		{/if}

		{#if loading}
			<div class="text-center py-5">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Cargando...</span>
				</div>
			</div>
		{:else if error}
			<div class="alert alert-danger mt-3">
				<i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>{error}
			</div>
		{:else}
			<div bind:this={container} class="border rounded" style="width: 100%; height: 560px; display: block;"></div>

			{#if graphData && (graphData.nodes || []).length === 0}
				<div class="alert alert-info mt-3">
					<i class="bi bi-info-circle me-1" aria-hidden="true"></i>No hay relaciones para los filtros activos.
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
