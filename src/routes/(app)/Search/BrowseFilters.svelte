<script>
    import { setFilter, setFilters, clearFilters, unifiedStore } from '$lib/unified-store';
    import { filtersDefinition } from '$conf/columns';
    import SearchableSelect from './SearchableSelect.svelte';
    import IdSearchableSelect from './IdSearchableSelect.svelte';

    export let entityType;

    $: filterDefs = filtersDefinition[entityType] || [];
    $: currentFilters = $unifiedStore.tabs[entityType]?.filters || {};
    $: facets = $unifiedStore.facets || {};
    $: yearRange = facets.year_range || {};

    // Build grouped structure: ungrouped filters first, then named groups in order
    $: filterLayout = buildLayout(filterDefs);

    function buildLayout(defs) {
        const ungrouped = [];
        const groupMap = new Map(); // preserve insertion order
        for (const f of defs) {
            if (!f.group) {
                ungrouped.push(f);
            } else {
                if (!groupMap.has(f.group)) groupMap.set(f.group, []);
                groupMap.get(f.group).push(f);
            }
        }
        const groups = [];
        for (const [name, filters] of groupMap) {
            groups.push({ name, filters });
        }
        return { ungrouped, groups };
    }

    // Track which groups are expanded — all collapsed by default
    let expandedGroups = {};
    $: {
        // Reset on entity change, keep existing state
        const ng = {};
        for (const g of filterLayout.groups) {
            ng[g.name] = expandedGroups[g.name] !== undefined ? expandedGroups[g.name] : false;
        }
        expandedGroups = ng;
    }

    function toggleGroup(name) {
        expandedGroups[name] = !expandedGroups[name];
        expandedGroups = expandedGroups;
    }

    // Count active filters per group
    function groupActiveCount(filters) {
        return filters.filter(f => currentFilters[f.key]).length;
    }

    let debounceTimers = {};

    function handleFilterChange(key, value, immediate = false) {
        if (immediate) {
            setFilter(entityType, key, value);
            return;
        }
        clearTimeout(debounceTimers[key]);
        debounceTimers[key] = setTimeout(() => {
            setFilter(entityType, key, value);
        }, 400);
    }

    function handleClear() {
        clearFilters(entityType);
        yearFrom = '';
        yearTo = '';
    }

    // Year range: local state so inputs don't trigger API on every keystroke
    let yearFrom = '';
    let yearTo = '';
    let yearDirty = false;

    $: if (yearRange.min !== undefined) {
        if (!yearFrom && !currentFilters[filterDefs.find(f => f.key?.endsWith('__gte'))?.key]) {
            yearFrom = '';
        }
        if (!yearTo && !currentFilters[filterDefs.find(f => f.key?.endsWith('__lte'))?.key]) {
            yearTo = '';
        }
    }

    function applyYearRange(gteKey, lteKey) {
        setFilters(entityType, { [gteKey]: yearFrom || '', [lteKey]: yearTo || '' });
        yearDirty = false;
    }

    $: activeCount = Object.values(currentFilters).filter(v => v).length;
</script>

<aside class="facet-sidebar">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 fw-bold"><i class="bi bi-funnel me-1"></i> Filtros</h6>
        {#if activeCount > 0}
            <button class="btn btn-sm btn-link text-decoration-none p-0" on:click={handleClear}>
                Limpiar ({activeCount})
            </button>
        {/if}
    </div>

    <div class="filter-scroll">
        <!-- Ungrouped filters (e.g. Nombre search) -->
        {#each filterLayout.ungrouped as filter}
            <div class="mb-3">
                {#if filter.type === 'text'}
                    <input
                        type="text"
                        class="form-control form-control-sm"
                        placeholder={filter.placeholder || ''}
                        value={currentFilters[filter.key] || ''}
                        on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                {/if}
            </div>
        {/each}

        <!-- Grouped filters -->
        {#each filterLayout.groups as group}
            {@const active = groupActiveCount(group.filters)}
            <div class="filter-group">
                <button class="filter-group-header" on:click={() => toggleGroup(group.name)}>
                    <i class="bi {expandedGroups[group.name] ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                    <span>{group.name}</span>
                    {#if active > 0}
                        <span class="ms-auto badge bg-primary" style="font-size: 0.65rem;">{active}</span>
                    {/if}
                </button>
                {#if expandedGroups[group.name]}
                    <div class="filter-group-body">
                        {#each group.filters as filter, i}
                            {@const isYearGte = filter.type === 'year' && filter.key.endsWith('__gte')}
                            {@const isYearLte = filter.type === 'year' && filter.key.endsWith('__lte')}
                            {@const nextFilter = group.filters[i + 1]}
                            {@const isRangePair = filter.type === 'number' && nextFilter?.type === 'number'
                                && filter.key.replace(/__(gte|lte)$/, '') === nextFilter.key.replace(/__(gte|lte)$/, '')}

                            {#if isYearGte && nextFilter?.type === 'year'}
                                <!-- Year range pair -->
                                <div class="mb-2">
                                    <label class="form-label small mb-1">Rango de fechas</label>
                                    <div class="d-flex align-items-center gap-2">
                                        <input
                                            type="number"
                                            class="form-control form-control-sm text-center"
                                            min={yearRange.min || ''}
                                            max={yearRange.max || ''}
                                            placeholder={yearRange.min || ''}
                                            bind:value={yearFrom}
                                            on:input={() => { yearDirty = true; }}
                                            on:keydown={(e) => { if (e.key === 'Enter') applyYearRange(filter.key, nextFilter.key); }}
                                        />
                                        <span class="text-muted">–</span>
                                        <input
                                            type="number"
                                            class="form-control form-control-sm text-center"
                                            min={yearRange.min || ''}
                                            max={yearRange.max || ''}
                                            placeholder={yearRange.max || ''}
                                            bind:value={yearTo}
                                            on:input={() => { yearDirty = true; }}
                                            on:keydown={(e) => { if (e.key === 'Enter') applyYearRange(filter.key, nextFilter.key); }}
                                        />
                                    </div>
                                    <button
                                        class="btn btn-sm btn-outline-primary w-100 mt-2"
                                        disabled={!yearDirty}
                                        on:click={() => applyYearRange(filter.key, nextFilter.key)}
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            {:else if isYearLte && group.filters[i - 1]?.type === 'year'}
                                <!-- skip: already rendered with gte -->
                            {:else if isRangePair}
                                <!-- Number range pair (e.g. edad min/max) -->
                                <div class="mb-2">
                                    <label class="form-label small mb-1">{filter.key.replace(/__(gte|lte)$/, '').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</label>
                                    <div class="d-flex gap-2">
                                        <input
                                            type="number"
                                            class="form-control form-control-sm"
                                            placeholder={filter.placeholder || filter.label}
                                            value={currentFilters[filter.key] || ''}
                                            on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            class="form-control form-control-sm"
                                            placeholder={nextFilter.placeholder || nextFilter.label}
                                            value={currentFilters[nextFilter.key] || ''}
                                            on:input={(e) => handleFilterChange(nextFilter.key, e.target.value)}
                                        />
                                    </div>
                                </div>
                            {:else if filter.type === 'number' && i > 0 && group.filters[i - 1]?.type === 'number'
                                && filter.key.replace(/__(gte|lte)$/, '') === group.filters[i - 1].key.replace(/__(gte|lte)$/, '')}
                                <!-- skip: already rendered as range pair -->
                            {:else if filter.type === 'text'}
                                <div class="mb-2">
                                    <label class="form-label small mb-1">{filter.label}</label>
                                    <input
                                        type="text"
                                        class="form-control form-control-sm"
                                        placeholder={filter.placeholder || ''}
                                        value={currentFilters[filter.key] || ''}
                                        on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                                    />
                                </div>
                            {:else if filter.type === 'searchable-select'}
                                <div class="mb-2">
                                    <label class="form-label small mb-1">{filter.label}</label>
                                    <SearchableSelect
                                        options={facets[filter.facetKey] || []}
                                        value={currentFilters[filter.key] || ''}
                                        placeholder="Buscar {filter.label.toLowerCase()}..."
                                        on:change={(e) => handleFilterChange(filter.key, e.detail, true)}
                                    />
                                </div>
                            {:else if filter.type === 'id-searchable-select'}
                                <div class="mb-2">
                                    <label class="form-label small mb-1">{filter.label}</label>
                                    <IdSearchableSelect
                                        options={facets[filter.facetKey] || []}
                                        value={currentFilters[filter.key] || ''}
                                        placeholder="Buscar {filter.label.toLowerCase()}..."
                                        multi={filter.multi || false}
                                        on:change={(e) => handleFilterChange(filter.key, e.detail, true)}
                                    />
                                </div>
                            {:else if filter.type === 'select'}
                                <div class="mb-2">
                                    <label class="form-label small mb-1">{filter.label}</label>
                                    {#each filter.options as opt}
                                        <label class="facet-option">
                                            <input
                                                type="radio"
                                                name="browse-filter-{filter.key}"
                                                checked={(currentFilters[filter.key] || '') === opt.value}
                                                on:change={() => handleFilterChange(filter.key, opt.value, true)}
                                            />
                                            <span class="facet-label">{opt.label}</span>
                                        </label>
                                    {/each}
                                </div>
                            {:else if filter.type === 'number'}
                                <div class="mb-2">
                                    <label class="form-label small mb-1">{filter.label}</label>
                                    <input
                                        type="number"
                                        class="form-control form-control-sm"
                                        placeholder={filter.placeholder || ''}
                                        value={currentFilters[filter.key] || ''}
                                        on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                                    />
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</aside>