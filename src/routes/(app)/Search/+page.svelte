<script>
	import { onMount } from 'svelte';
	import {
		unifiedStore, fetchResults, setActiveTab, setViewMode,
		setPageSize, setPage, performSearch, clearSearch,
		loadCounts, PAGE_SIZES, ENTITY_TYPES,
	} from '$lib/unified-store';
	import { exportCsv } from '$lib/api';
	import { entityTabConfig } from '$conf/columns';

	import EntityTable from './EntityTable.svelte';
	import BrowseFilters from './BrowseFilters.svelte';
	import BrowseCards from './BrowseCards.svelte';
	import ColumnConfigModal from './ColumnConfigModal.svelte';

	export let data;
	let { searchQuery, archivoId, tab: initialTab, view: initialView } = data;

	let query = searchQuery || '';
	let exactSearch = searchQuery?.startsWith('"') && searchQuery?.endsWith('"');
	let showColumnConfig = false;
	let desiredPage = '';

	$: activeTab = $unifiedStore.activeTab;
	$: viewMode = $unifiedStore.viewMode;
	$: tabState = $unifiedStore.tabs[activeTab];
	$: totalPages = tabState?.totalPages || 0;
	$: counts = $unifiedStore.counts;
	$: typeCounts = $unifiedStore.typeCounts || {};
	$: isSearch = !!$unifiedStore.query;

	// Tab badge: in search mode use typeCounts (all types returned by API);
	// for the active tab prefer totalResults (reflects applied filters).
	// In browse mode use DB counts from loadCounts().
	function badgeCount(entityType) {
		if (isSearch) {
			if (entityType === activeTab) {
				const tab = $unifiedStore.tabs[entityType];
				if (tab?.totalResults > 0) return tab.totalResults;
			}
			return typeCounts[entityType] || 0;
		}
		const tab = $unifiedStore.tabs[entityType];
		if (tab?.totalResults > 0) return tab.totalResults;
		return counts[entityType] ?? '';
	}

	onMount(async () => {
		if (initialView === 'card' || initialView === 'table') {
			setViewMode(initialView);
		}
		if (initialTab && ENTITY_TYPES.includes(initialTab)) {
			setActiveTab(initialTab);
		}

		await loadCounts();

		if (query) {
			performSearch(query, exactSearch);
		} else {
			fetchResults($unifiedStore.activeTab);
		}
	});

	function handleSearch() {
		if (!query || query.trim() === '') {
			clearSearch();
			return;
		}
		performSearch(query, exactSearch);
	}

	function handleClearSearch() {
		query = '';
		clearSearch();
	}

	function handleTabClick(entityType) {
		setActiveTab(entityType);
	}

	function handlePageSizeChange(e) {
		setPageSize(activeTab, parseInt(e.target.value));
	}

	function handleExport() {
		const url = exportCsv(activeTab);
		window.open(url, '_blank');
	}

	function goFirst() { setPage(activeTab, 1); }
	function goPrev() { if (tabState.currentPage > 1) setPage(activeTab, tabState.currentPage - 1); }
	function goNext() { if (tabState.currentPage < totalPages) setPage(activeTab, tabState.currentPage + 1); }
	function goLast() { setPage(activeTab, totalPages); }

	function goToPage() {
		const p = parseInt(desiredPage);
		if (p >= 1 && p <= totalPages) {
			setPage(activeTab, p);
			desiredPage = '';
		}
	}
</script>

<div class="container-fluid mt-4 px-4">
	<!-- Search bar -->
	<div class="row mb-3">
		<div class="col-lg-8 offset-lg-2">
			<form on:submit|preventDefault={handleSearch} class="search-form">
				<div class="input-group mb-2">
					<input
						bind:value={query}
						class="form-control"
						placeholder="Buscar en la base de datos..."
						aria-label="Buscar"
					/>
					{#if query}
						<button type="button" class="btn btn-outline-secondary" on:click={handleClearSearch} title="Limpiar búsqueda">
							<i class="bi bi-x-lg"></i>
						</button>
					{/if}
					<button type="submit" class="btn btn-primary">
						<i class="bi bi-search me-1"></i> Buscar
					</button>
				</div>
				<div class="d-flex justify-content-between align-items-center">
					<div>
						{#if !isSearch}
							<small class="text-muted">
								<i class="bi bi-grid-3x3-gap me-1"></i>Explorando la base de datos
							</small>
						{:else}
							<small class="text-muted">
								<i class="bi bi-search me-1"></i>Resultados para <em>{$unifiedStore.query}</em>
							</small>
						{/if}
					</div>
					<div class="form-check">
						<input
							class="form-check-input"
							type="checkbox"
							bind:checked={exactSearch}
							id="exactSearchCheck"
						/>
						<label class="form-check-label" for="exactSearchCheck">
							Búsqueda exacta
							<i class="bi bi-info-circle ms-1"
							   data-bs-toggle="tooltip"
							   data-bs-placement="right"
							   title="Busca la frase exacta (equivalente a usar comillas)"></i>
						</label>
					</div>
				</div>
			</form>
		</div>
	</div>

	<!-- Sidebar + Content -->
	<div class="row">
		<!-- Sidebar filters -->
		<div class="col-lg-3">
			<BrowseFilters entityType={activeTab} />
		</div>

		<!-- Main content area -->
		<div class="col-lg-9">
			<!-- Entity type tabs -->
			<ul class="nav nav-tabs mb-0 border-bottom-0 browse-view">
				{#each ENTITY_TYPES as et}
					{@const cfg = entityTabConfig[et]}
					{@const badge = badgeCount(et)}
					<li class="nav-item">
						<button
							class="nav-link d-flex align-items-center gap-1"
							class:active={activeTab === et}
							on:click={() => handleTabClick(et)}
						>
							<i class="bi {cfg.icon}"></i>
							<span class="d-none d-md-inline">{cfg.label}</span>
							{#if badge !== '' && badge !== 0}
							<span class="badge ms-1" class:bg-primary={activeTab === et} class:bg-secondary={activeTab !== et}>{badge.toLocaleString()}</span>
						{:else if $unifiedStore.tabs[et]?.isLoading}
							<span class="badge bg-secondary ms-1"><i class="bi bi-hourglass-split"></i></span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>

			<!-- Control bar -->
			<div class="browse-controls d-flex flex-wrap align-items-center gap-2 p-2 bg-light border rounded-bottom mb-3">
				<!-- View toggle -->
				<div class="btn-group btn-group-sm" role="group">
					<button
						class="btn"
						class:btn-primary={viewMode === 'table'}
						class:btn-outline-secondary={viewMode !== 'table'}
						on:click={() => setViewMode('table')}
						title="Vista de tabla"
					>
						<i class="bi bi-table"></i>
					</button>
					<button
						class="btn"
						class:btn-primary={viewMode === 'card'}
						class:btn-outline-secondary={viewMode !== 'card'}
						on:click={() => setViewMode('card')}
						title="Vista de tarjetas"
					>
						<i class="bi bi-grid-3x3-gap"></i>
					</button>
				</div>

				<!-- Page size -->
				<div class="d-flex align-items-center gap-1">
					<label for="pageSize" class="form-label mb-0 small text-muted">Mostrar</label>
					<select id="pageSize" class="form-select form-select-sm" style="width: auto;" value={tabState?.pageSize} on:change={handlePageSizeChange}>
						{#each PAGE_SIZES as size}
							<option value={size}>{size}</option>
						{/each}
					</select>
				</div>

				<!-- Column config (table mode only) -->
				{#if viewMode === 'table'}
					<button class="btn btn-sm btn-outline-secondary" on:click={() => showColumnConfig = true}>
						<i class="bi bi-columns me-1"></i>Columnas
					</button>
				{/if}

				<!-- Export CSV -->
				<button class="btn btn-sm btn-outline-secondary" on:click={handleExport}>
					<i class="bi bi-download me-1"></i>CSV
				</button>
			</div>

			<!-- Error -->
			{#if tabState?.error}
				<div class="alert alert-danger">
					<i class="bi bi-exclamation-triangle me-2"></i>{tabState.error}
				</div>
			{/if}

			<!-- Loading -->
			{#if tabState?.isLoading}
				<div class="text-center py-4">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
				</div>
			{:else if tabState?.results?.length > 0}
				<!-- Results -->
				{#if viewMode === 'table'}
					<EntityTable entityType={activeTab} results={tabState.results} />
				{:else}
					<BrowseCards entityType={activeTab} results={tabState.results} />
				{/if}

				<!-- Pagination -->
				<nav class="d-flex justify-content-center align-items-center gap-2 my-3" aria-label="Paginación">
					<button class="btn btn-sm btn-outline-secondary" disabled={tabState.currentPage <= 1} on:click={goFirst}>
						<i class="bi bi-chevron-double-left"></i>
					</button>
					<button class="btn btn-sm btn-outline-secondary" disabled={tabState.currentPage <= 1} on:click={goPrev}>
						<i class="bi bi-chevron-left"></i>
					</button>

					<span class="small text-muted">
						Página {tabState.currentPage} de {totalPages}
					</span>

					<button class="btn btn-sm btn-outline-secondary" disabled={tabState.currentPage >= totalPages} on:click={goNext}>
						<i class="bi bi-chevron-right"></i>
					</button>
					<button class="btn btn-sm btn-outline-secondary" disabled={tabState.currentPage >= totalPages} on:click={goLast}>
						<i class="bi bi-chevron-double-right"></i>
					</button>

					<div class="input-group input-group-sm" style="width: 140px;">
						<input type="number" class="form-control" bind:value={desiredPage}
							min="1" max={totalPages} placeholder="Ir a..." />
						<button class="btn btn-outline-secondary" on:click={goToPage}>
							<i class="bi bi-arrow-right"></i>
						</button>
					</div>
				</nav>
			{:else if !tabState?.isLoading}
				<div class="alert alert-info mt-3">
					<i class="bi bi-info-circle me-2"></i>
					{#if isSearch}
						No se encontraron resultados para <em>{$unifiedStore.query}</em>. Intente con otros términos o ajuste los filtros.
					{:else}
						No se encontraron resultados. Intente ajustar los filtros.
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Column config modal -->
{#if showColumnConfig}
	<ColumnConfigModal entityType={activeTab} on:close={() => showColumnConfig = false} />
{/if}

<style>
	.search-form {
		position: relative;
	}

	.form-check {
		margin-left: 0.5rem;
	}

	.form-check-label {
		font-size: 0.9rem;
		color: #666;
		white-space: nowrap;
	}

	/* Inactive tab links: muted gray with darker hover */
	.browse-view .nav-link:not(.active) {
		color: #999;
	}
	.browse-view .nav-link:not(.active):hover {
		color: #444;
	}
</style>
