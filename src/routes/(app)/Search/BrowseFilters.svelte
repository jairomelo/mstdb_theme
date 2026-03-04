<script>
    import { setFilter, clearFilters, browseStore } from '$lib/browse-store';
    import { filtersDefinition } from '$conf/columns';

    export let entityType;

    $: filterDefs = filtersDefinition[entityType] || [];
    $: currentFilters = $browseStore.tabs[entityType]?.filters || {};
    $: hasActiveFilters = Object.values(currentFilters).some(v => v);

    let collapsed = true;

    let debounceTimers = {};

    function handleFilterChange(key, value, immediate = false) {
        if (immediate) {
            setFilter(entityType, key, value);
            return;
        }
        // Debounce text inputs
        clearTimeout(debounceTimers[key]);
        debounceTimers[key] = setTimeout(() => {
            setFilter(entityType, key, value);
        }, 400);
    }

    function handleClear() {
        clearFilters(entityType);
    }
</script>

<div class="browse-filters mb-3">
    <button
        class="btn btn-sm btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
        on:click={() => collapsed = !collapsed}
    >
        <span>
            <i class="bi bi-funnel me-1"></i>Filtros avanzados
            {#if hasActiveFilters}
                <span class="badge bg-primary ms-1">Activos</span>
            {/if}
        </span>
        <i class="bi {collapsed ? 'bi-chevron-down' : 'bi-chevron-up'}"></i>
    </button>

    {#if !collapsed}
        <div class="filter-panel border rounded-bottom p-3 bg-white">
            <div class="row g-2 align-items-end">
                {#each filterDefs as filter}
                    <div class="col-auto" style="min-width: 160px;">
                        <label class="form-label small mb-1" for="filter-{filter.key}">{filter.label}</label>

                        {#if filter.type === 'text'}
                            <input
                                id="filter-{filter.key}"
                                type="text"
                                class="form-control form-control-sm"
                                placeholder={filter.placeholder || ''}
                                value={currentFilters[filter.key] || ''}
                                on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                            />
                        {:else if filter.type === 'number'}
                            <input
                                id="filter-{filter.key}"
                                type="number"
                                class="form-control form-control-sm"
                                placeholder={filter.placeholder || ''}
                                value={currentFilters[filter.key] || ''}
                                on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                            />
                        {:else if filter.type === 'date'}
                            <input
                                id="filter-{filter.key}"
                                type="date"
                                class="form-control form-control-sm"
                                value={currentFilters[filter.key] || ''}
                                on:change={(e) => handleFilterChange(filter.key, e.target.value, true)}
                            />
                        {:else if filter.type === 'select'}
                            <select
                                id="filter-{filter.key}"
                                class="form-select form-select-sm"
                                value={currentFilters[filter.key] || ''}
                                on:change={(e) => handleFilterChange(filter.key, e.target.value, true)}
                            >
                                {#each filter.options as opt}
                                    <option value={opt.value}>{opt.label}</option>
                                {/each}
                            </select>
                        {/if}
                    </div>
                {/each}

                {#if hasActiveFilters}
                    <div class="col-auto">
                        <button class="btn btn-sm btn-outline-danger" on:click={handleClear}>
                            <i class="bi bi-x-circle me-1"></i>Limpiar
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .filter-panel {
        border-top: none !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
</style>
