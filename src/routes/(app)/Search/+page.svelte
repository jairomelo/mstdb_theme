<script>
	import { onMount, onDestroy } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';
	import {
		unifiedStore,
		fetchResults,
		setActiveTab,
		setViewMode,
		setPageSize,
		setPage,
		performSearch,
		clearSearch,
		loadCounts,
		PAGE_SIZES,
		ENTITY_TYPES,
		abortAll,
		fetchCrosstab,
		setCrosstabConfig,
		fetchSearchNetwork,
		setNetworkScope,
		setFilters
	} from '$lib/unified-store';
	import { exportCsv } from '$lib/api';
	import { entityTabConfig } from '$conf/columns';
	import { setRandomHeroImage } from '$lib/heroBackground';

	import EntityTable from './EntityTable.svelte';
	import BrowseFilters from './BrowseFilters.svelte';
	import BrowseCards from './BrowseCards.svelte';
	import ColumnConfigModal from './ColumnConfigModal.svelte';
	import TrajectoryMap from './TrajectoryMap.svelte';
	import CrosstabView from './CrosstabView.svelte';
	import SearchNetwork from './SearchNetwork.svelte';

	export let data;
	let {
		searchQuery,
		archivoId,
		tab: initialTab,
		view: initialView,
		filters: initialFilters = {}
	} = data;

	let query = searchQuery || '';
	let exactSearch = searchQuery?.startsWith('"') && searchQuery?.endsWith('"');
	let showColumnConfig = false;
	let desiredPage = '';
	let heroSectionElement;

	$: activeTab = $unifiedStore.activeTab;
	$: viewMode = $unifiedStore.viewMode;
	$: tabState = $unifiedStore.tabs[activeTab];
	$: totalPages = tabState?.totalPages || 0;
	$: counts = $unifiedStore.counts;
	$: typeCounts = $unifiedStore.typeCounts || {};
	$: isSearch = !!$unifiedStore.query;
	$: isPeopleTab = activeTab === 'personaesclavizada' || activeTab === 'personanoesclavizada';
	$: networkState = tabState?.network;

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
		setRandomHeroImage(heroSectionElement);
		if (initialView === 'card' || initialView === 'table') {
			setViewMode(initialView);
		}
		if (initialTab && ENTITY_TYPES.includes(initialTab)) {
			setActiveTab(initialTab);
		}

		await loadCounts();

		// Apply URL-based filters before fetching
		const targetTab = initialTab || $unifiedStore.activeTab;
		if (Object.keys(initialFilters).length > 0) {
			setFilters(targetTab, initialFilters);
		} else if (query) {
			performSearch(query, exactSearch);
		} else {
			fetchResults(targetTab);
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

	function handleNetworkScopeChange(event) {
		setNetworkScope(activeTab, event.detail.scopeMode);
	}

	function handleExport() {
		const state = $unifiedStore;
		const tab = state.tabs[activeTab];
		const url = exportCsv(activeTab, {
			query: state.query,
			exactSearch: state.exactSearch,
			filters: tab?.filters,
			ordering: tab?.sortField
				? tab.sortDir === 'desc'
					? `-${tab.sortField}`
					: tab.sortField
				: undefined
		});
		window.open(url, '_blank');
	}

	function goFirst() {
		setPage(activeTab, 1);
	}
	function goPrev() {
		if (tabState.currentPage > 1) setPage(activeTab, tabState.currentPage - 1);
	}
	function goNext() {
		if (tabState.currentPage < totalPages) setPage(activeTab, tabState.currentPage + 1);
	}
	function goLast() {
		setPage(activeTab, totalPages);
	}

	function goToPage() {
		const p = parseInt(desiredPage);
		if (p >= 1 && p <= totalPages) {
			setPage(activeTab, p);
			desiredPage = '';
		}
	}

	onDestroy(() => {
		abortAll();
	});
</script>

<svelte:head>
	<title>{m.mean_light_flamingo_mix()}</title>
</svelte:head>

<!-- Search hero banner -->
<section class="search-hero" bind:this={heroSectionElement}>
	<div class="overlay"></div>
	<div class="search-hero-content">
		<form on:submit|preventDefault={handleSearch} class="w-100">
			<div class="input-group mb-2">
				<input
					bind:value={query}
					class="form-control form-control-lg"
					placeholder={m.upper_noble_crocodile_kiss()}
					aria-label={m.happy_blue_wombat_aid()}
				/>
				{#if query}
					<button
						type="button"
						class="btn btn-outline-light"
						aria-label={m.helpful_due_beetle_flip()}
						on:click={handleClearSearch}
						title={m.helpful_due_beetle_flip()}
					>
						<i class="bi bi-x-lg" aria-hidden="true"></i>
					</button>
				{/if}
				<button type="submit" class="btn btn-primary btn-lg" aria-label={m.happy_blue_wombat_aid()}>
					<i class="bi bi-search" aria-hidden="true"></i>
				</button>
			</div>
			<div class="d-flex justify-content-between align-items-center">
				<small class="text-white-50">
					{#if !isSearch}
						<i class="bi bi-grid-3x3-gap me-1"></i>{m.few_sunny_goldfish_trim()}
					{:else}
						<i class="bi bi-search me-1"></i>{m.green_patient_racoon_vent()} <em>{$unifiedStore.query}</em>
					{/if}
				</small>
				<div class="form-check">
					<input
						class="form-check-input"
						type="checkbox"
						bind:checked={exactSearch}
						id="exactSearchCheck"
					/>
					<label class="form-check-label text-white-50" for="exactSearchCheck">
						{m.simple_muddy_scallop_coax()}
						<i
							class="bi bi-info-circle ms-1"
							data-bs-toggle="tooltip"
							data-bs-placement="right"
							title={m.proof_round_newt_build()}
						></i>
					</label>
				</div>
			</div>
		</form>
	</div>
</section>

<div class="container-fluid py-4 px-4">
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
								<span
									class="badge ms-1"
									class:bg-primary={activeTab === et}
									class:bg-secondary={activeTab !== et}>{badge.toLocaleString()}</span
								>
							{:else if $unifiedStore.tabs[et]?.isLoading}
								<span class="badge bg-secondary ms-1"><i class="bi bi-hourglass-split"></i></span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>

			<!-- View mode switcher -->
			<div
				class="view-mode-switcher d-flex justify-content-center py-2 border-start border-end border-bottom bg-white mb-0"
				role="group"
				aria-label={m.awful_suave_porpoise_fall()}
			>
				<div class="btn-group">
					<button
						class="btn btn-sm"
						class:btn-primary={viewMode === 'table'}
						class:btn-outline-secondary={viewMode !== 'table'}
						on:click={() => setViewMode('table')}
						aria-pressed={viewMode === 'table'}
					>
						<i class="bi bi-table me-1" aria-hidden="true"></i>{m.aloof_tense_pelican_file()}
					</button>
					<button
						class="btn btn-sm"
						class:btn-primary={viewMode === 'card'}
						class:btn-outline-secondary={viewMode !== 'card'}
						on:click={() => setViewMode('card')}
						aria-pressed={viewMode === 'card'}
					>
						<i class="bi bi-grid-3x3-gap me-1" aria-hidden="true"></i>{m.stout_less_gecko_praise()}
					</button>
					{#if activeTab === 'personaesclavizada'}
						<button
							class="btn btn-sm"
							class:btn-primary={viewMode === 'map'}
							class:btn-outline-secondary={viewMode !== 'map'}
							on:click={() => setViewMode('map')}
							aria-pressed={viewMode === 'map'}
						>
							<i class="bi bi-globe-americas me-1" aria-hidden="true"></i>{m.active_cozy_termite_learn()}
						</button>
					{/if}
					{#if activeTab === 'personaesclavizada' || activeTab === 'personanoesclavizada'}
						<button
							class="btn btn-sm"
							class:btn-primary={viewMode === 'crosstab'}
							class:btn-outline-secondary={viewMode !== 'crosstab'}
							on:click={() => setViewMode('crosstab')}
							aria-pressed={viewMode === 'crosstab'}
						>
							<i class="bi bi-layout-three-columns me-1" aria-hidden="true"></i>{m.brave_lower_tiger_jest()}
						</button>
						<button
							class="btn btn-sm"
							class:btn-primary={viewMode === 'network'}
							class:btn-outline-secondary={viewMode !== 'network'}
							on:click={() => {
								setViewMode('network');
								fetchSearchNetwork(activeTab);
							}}
							aria-pressed={viewMode === 'network'}
						>
							<i class="bi bi-diagram-3 me-1" aria-hidden="true"></i>{m.big_salty_turkey_propel()}
						</button>
					{/if}
				</div>
			</div>

			<!-- Control bar -->
			<div
				class="browse-controls d-flex flex-wrap align-items-center gap-2 p-2 bg-light border rounded-bottom mb-3"
			>
				<!-- Page size -->
				<div class="d-flex align-items-center gap-1">
					<label for="pageSize" class="form-label mb-0 small text-muted">{m.gray_green_penguin_pause()}</label>
					<select
						id="pageSize"
						class="form-select form-select-sm"
						style="width: auto;"
						value={tabState?.pageSize}
						on:change={handlePageSizeChange}
					>
						{#each PAGE_SIZES as size}
							<option value={size}>{size}</option>
						{/each}
					</select>
				</div>

				<!-- Column config (table mode only) -->
				{#if viewMode === 'table'}
					<button
						class="btn btn-sm btn-outline-secondary"
						on:click={() => (showColumnConfig = true)}
					>
						<i class="bi bi-columns me-1"></i>{m.fresh_super_osprey_shine()}
					</button>
				{/if}

				<!-- Export CSV (hidden in crosstab mode — CrosstabView has its own) -->
				{#if viewMode !== 'crosstab'}
					<button class="btn btn-sm btn-outline-secondary" on:click={handleExport}>
						<i class="bi bi-download me-1"></i>CSV
					</button>
				{/if}
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
						<span class="visually-hidden">{m.loading()}</span>
					</div>
				</div>
			{:else if viewMode === 'crosstab' && isPeopleTab}
				<CrosstabView entityType={activeTab} />
			{:else if viewMode === 'network' && isPeopleTab}
				<SearchNetwork
					graphData={networkState?.graphData}
					isLoading={networkState?.isLoading}
					error={networkState?.error}
					scopeMode={networkState?.scopeMode || 'strict'}
					on:scopechange={handleNetworkScopeChange}
				/>
			{:else if tabState?.results?.length > 0}
				<!-- Results -->
				{#if viewMode === 'table'}
					<EntityTable entityType={activeTab} results={tabState.results} />
				{:else if viewMode === 'map' && activeTab === 'personaesclavizada'}
					<TrajectoryMap
						filters={tabState.filters}
						query={$unifiedStore.query}
						exactSearch={$unifiedStore.exactSearch}
					/>
				{:else}
					<BrowseCards entityType={activeTab} results={tabState.results} />
				{/if}

				<!-- Pagination -->
				<nav
					class="d-flex justify-content-center align-items-center gap-2 my-3"
					aria-label={m.pagination()}
				>
					<button
						class="btn btn-sm btn-outline-secondary"
						aria-label={m.first_page()}
						title={m.first_page()}
						disabled={tabState.currentPage <= 1}
						on:click={goFirst}
					>
						<i class="bi bi-chevron-double-left" aria-hidden="true"></i>
					</button>
					<button
						class="btn btn-sm btn-outline-secondary"
						aria-label={m.previously()}
						title={m.previously()}
						disabled={tabState.currentPage <= 1}
						on:click={goPrev}
					>
						<i class="bi bi-chevron-left" aria-hidden="true"></i>
					</button>

					<span class="small text-muted">
						{m.from_to({ currentPage: tabState.currentPage })} {m.total_pages( {totalPages: totalPages} )}
					</span>

					<button
						class="btn btn-sm btn-outline-secondary"
						aria-label={m.next_page()}
						title={m.next_page()}
						disabled={tabState.currentPage >= totalPages}
						on:click={goNext}
					>
						<i class="bi bi-chevron-right" aria-hidden="true"></i>
					</button>
					<button
						class="btn btn-sm btn-outline-secondary"
						aria-label={m.last_page()}
						title={m.last_page()}
						disabled={tabState.currentPage >= totalPages}
						on:click={goLast}
					>
						<i class="bi bi-chevron-double-right" aria-hidden="true"></i>
					</button>

					<div class="input-group input-group-sm" style="width: 140px;">
						<input
							type="number"
							class="form-control"
							bind:value={desiredPage}
							min="1"
							max={totalPages}
							placeholder="Ir a..."
						/>
						<button
							class="btn btn-outline-secondary"
							aria-label={m.gotopage()}
							on:click={goToPage}
						>
							<i class="bi bi-arrow-right" aria-hidden="true"></i>
						</button>
					</div>
				</nav>
			{:else if !tabState?.isLoading}
				<div class="alert alert-info mt-3">
					<i class="bi bi-info-circle me-2"></i>
					{#if isSearch}
						{m.nice_flaky_trout_compose()} <em>{$unifiedStore.query}</em>. {m.topical_away_bumblebee_strive()}
					{:else}
						{m.alert_careful_sloth_arise()}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Column config modal -->
{#if showColumnConfig}
	<ColumnConfigModal entityType={activeTab} on:close={() => (showColumnConfig = false)} />
{/if}
