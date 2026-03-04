<script>
    import { setFilter, clearFilters, unifiedStore } from '$lib/unified-store';
    import { filtersDefinition } from '$conf/columns';

    export let entityType;

    $: filterDefs = filtersDefinition[entityType] || [];
    $: currentFilters = $unifiedStore.tabs[entityType]?.filters || {};
    $: hasActiveFilters = Object.values(currentFilters).some(v => v);

    // Track which sections are expanded — first section open by default
    let expandedSections = {};
    $: {
        // Reset when entity type changes
        const newExpanded = {};
        filterDefs.forEach((f, i) => {
            // Keep existing state or default first to open
            newExpanded[f.key] = expandedSections[f.key] !== undefined
                ? expandedSections[f.key]
                : i === 0;
        });
        expandedSections = newExpanded;
    }

    function toggleSection(key) {
        expandedSections[key] = !expandedSections[key];
        expandedSections = expandedSections; // trigger reactivity
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
    }

    // Group related range filters (e.g. edad__gte + edad__lte → "Edad")
    function getFilterGroups(defs) {
        const groups = [];
        const consumed = new Set();

        for (let i = 0; i < defs.length; i++) {
            if (consumed.has(i)) continue;
            const f = defs[i];

            // Check if next filter shares the same root (e.g. edad__gte, edad__lte)
            const rootKey = f.key.replace(/__(gte|lte|gt|lt)$/, '');
            if (f.type === 'number' && i + 1 < defs.length) {
                const next = defs[i + 1];
                const nextRoot = next.key.replace(/__(gte|lte|gt|lt)$/, '');
                if (next.type === 'number' && rootKey === nextRoot) {
                    groups.push({ kind: 'range', label: rootKey.charAt(0).toUpperCase() + rootKey.slice(1), filters: [f, next] });
                    consumed.add(i);
                    consumed.add(i + 1);
                    continue;
                }
            }

            // Check if next filter shares the same root for dates
            if (f.type === 'date' && i + 1 < defs.length) {
                const next = defs[i + 1];
                if (next.type === 'date') {
                    groups.push({ kind: 'daterange', label: 'Fecha', filters: [f, next] });
                    consumed.add(i);
                    consumed.add(i + 1);
                    continue;
                }
            }

            groups.push({ kind: 'single', label: f.label, filters: [f] });
        }
        return groups;
    }

    $: filterGroups = getFilterGroups(filterDefs);

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

    {#each filterGroups as group}
        {@const sectionKey = group.filters[0].key}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggleSection(sectionKey)}>
                <i class="bi {expandedSections[sectionKey] ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>{group.label}</span>
                {#if group.filters.some(f => currentFilters[f.key])}
                    <span class="ms-auto badge bg-primary" style="font-size: 0.65rem;">Activo</span>
                {/if}
            </button>
            {#if expandedSections[sectionKey]}
                <div class="facet-options">
                    {#if group.kind === 'single'}
                        {@const filter = group.filters[0]}
                        {#if filter.type === 'text'}
                            <input
                                type="text"
                                class="form-control form-control-sm mt-1"
                                placeholder={filter.placeholder || ''}
                                value={currentFilters[filter.key] || ''}
                                on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                            />
                        {:else if filter.type === 'select'}
                            <!-- Render as radio-style options, matching FacetSidebar -->
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
                        {:else if filter.type === 'number'}
                            <input
                                type="number"
                                class="form-control form-control-sm mt-1"
                                placeholder={filter.placeholder || ''}
                                value={currentFilters[filter.key] || ''}
                                on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                            />
                        {:else if filter.type === 'date'}
                            <input
                                type="date"
                                class="form-control form-control-sm mt-1"
                                value={currentFilters[filter.key] || ''}
                                on:change={(e) => handleFilterChange(filter.key, e.target.value, true)}
                            />
                        {/if}
                    {:else if group.kind === 'range'}
                        <div class="d-flex gap-2 mt-1">
                            {#each group.filters as filter}
                                <input
                                    type="number"
                                    class="form-control form-control-sm"
                                    placeholder={filter.placeholder || filter.label}
                                    value={currentFilters[filter.key] || ''}
                                    on:input={(e) => handleFilterChange(filter.key, e.target.value)}
                                />
                            {/each}
                        </div>
                    {:else if group.kind === 'daterange'}
                        <div class="mt-1">
                            {#each group.filters as filter}
                                <label class="form-label small mb-1 mt-1">{filter.label}</label>
                                <input
                                    type="date"
                                    class="form-control form-control-sm"
                                    value={currentFilters[filter.key] || ''}
                                    on:change={(e) => handleFilterChange(filter.key, e.target.value, true)}
                                />
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/each}
</aside>