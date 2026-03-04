<script>
    import { onMount } from 'svelte';
    import {
        browseStore, loadCounts, fetchBrowseResults, setActiveTab,
        setViewMode, setPageSize, setPage, PAGE_SIZES, ENTITY_TYPES,
    } from '$lib/browse-store';
    import { exportCsv } from '$lib/api';
    import { entityTabConfig } from '$conf/columns';
    import EntityTable from './EntityTable.svelte';
    import BrowseFilters from './BrowseFilters.svelte';
    import BrowseCards from './BrowseCards.svelte';
    import ColumnConfigModal from './ColumnConfigModal.svelte';

    let showColumnConfig = false;

    onMount(async () => {
        await loadCounts();
        // Load default tab
        fetchBrowseResults($browseStore.activeTab);
    });

    $: activeTab = $browseStore.activeTab;
    $: viewMode = $browseStore.viewMode;
    $: counts = $browseStore.counts;
    $: tab = $browseStore.tabs[activeTab];
    $: totalPages = tab?.totalPages || 0;

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

    // Pagination helpers
    function goFirst() { setPage(activeTab, 1); }
    function goPrev() { if (tab.currentPage > 1) setPage(activeTab, tab.currentPage - 1); }
    function goNext() { if (tab.currentPage < totalPages) setPage(activeTab, tab.currentPage + 1); }
    function goLast() { setPage(activeTab, totalPages); }

    let desiredPage = '';
    function goToPage() {
        const p = parseInt(desiredPage);
        if (p >= 1 && p <= totalPages) {
            setPage(activeTab, p);
            desiredPage = '';
        }
    }
</script>

<div class="browse-view">
<!-- Entity type tabs -->

<!-- Sidebar + Content layout (same as search mode) -->
<div class="row">
    <!-- Sidebar filters -->
    <div class="col-lg-3">
        <BrowseFilters entityType={activeTab} />
    </div>

    <!-- Main content area -->
    <div class="col-lg-9">

        <ul class="nav nav-tabs mb-0 border-bottom-0">
            {#each ENTITY_TYPES as entityType}
                {@const cfg = entityTabConfig[entityType]}
                <li class="nav-item">
                    <button
                        class="nav-link d-flex align-items-center gap-1"
                        class:active={activeTab === entityType}
                        on:click={() => handleTabClick(entityType)}
                    >
                        <i class="bi {cfg.icon}"></i>
                        <span class="d-none d-md-inline">{cfg.label}</span>
                        {#if counts[entityType] !== undefined}
                            <span class="badge bg-secondary ms-1">{counts[entityType].toLocaleString()}</span>
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
                <select id="pageSize" class="form-select form-select-sm" style="width: auto;" value={tab?.pageSize} on:change={handlePageSizeChange}>
                    {#each PAGE_SIZES as size}
                        <option value={size}>{size}</option>
                    {/each}
                </select>
            </div>

            <!-- Column config button (table mode only) -->
            {#if viewMode === 'table'}
                <button class="btn btn-sm btn-outline-secondary" on:click={() => showColumnConfig = true}>
                    <i class="bi bi-columns me-1"></i>Columnas
                </button>
            {/if}

            <!-- Export CSV -->
            <button class="btn btn-sm btn-outline-secondary" on:click={handleExport}>
                <i class="bi bi-download me-1"></i>CSV
            </button>

            <!-- Results count -->
            <span class="ms-auto small text-muted">
                {#if tab?.isLoading}
                    <i class="bi bi-hourglass-split"></i> Cargando...
                {:else}
                    {tab?.totalResults?.toLocaleString() || 0} resultados
                {/if}
            </span>
        </div>


        {#if tab?.error}
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>{tab.error}
            </div>
        {/if}

        {#if tab?.isLoading}
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        {:else if tab?.results?.length > 0}
            {#if viewMode === 'table'}
                <EntityTable entityType={activeTab} results={tab.results} />
            {:else}
                <BrowseCards entityType={activeTab} results={tab.results} />
            {/if}

            <!-- Pagination -->
            <nav class="d-flex justify-content-center align-items-center gap-2 my-3" aria-label="Paginación">
                <button class="btn btn-sm btn-outline-secondary" disabled={tab.currentPage <= 1} on:click={goFirst}>
                    <i class="bi bi-chevron-double-left"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" disabled={tab.currentPage <= 1} on:click={goPrev}>
                    <i class="bi bi-chevron-left"></i>
                </button>

                <span class="small text-muted">
                    Página {tab.currentPage} de {totalPages}
                </span>

                <button class="btn btn-sm btn-outline-secondary" disabled={tab.currentPage >= totalPages} on:click={goNext}>
                    <i class="bi bi-chevron-right"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" disabled={tab.currentPage >= totalPages} on:click={goLast}>
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
        {:else if !tab?.isLoading}
            <div class="alert alert-info mt-3">
                <i class="bi bi-info-circle me-2"></i>No se encontraron resultados. Intente ajustar los filtros.
            </div>
        {/if}
    </div>
</div>

<!-- Column config modal -->
{#if showColumnConfig}
    <ColumnConfigModal entityType={activeTab} on:close={() => showColumnConfig = false} />
{/if}
</div>
