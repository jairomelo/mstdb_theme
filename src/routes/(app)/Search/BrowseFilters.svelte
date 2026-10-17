<script>
	import { setFilter, setFilters, clearFilters, unifiedStore } from '$lib/unified-store';
	import { filtersDefinition } from '$conf/columns';
	import SearchableSelect from './SearchableSelect.svelte';
	import IdSearchableSelect from './IdSearchableSelect.svelte';
	import { m } from '$lib/paraglide/messages.js';

	export let entityType;

	function resolveLabel(key) {
		return key ? m[key]() : '';
	}

	function localizeFilter(f) {
		return {
			...f,
			label: resolveLabel(f.labelKey),
			rangeLabel: f.rangeLabelKey ? resolveLabel(f.rangeLabelKey) : '',
			placeholder: f.placeholderKey ? resolveLabel(f.placeholderKey) : '',
			options: f.options
				? f.options.map((o) => ({ ...o, label: resolveLabel(o.labelKey) }))
				: f.options
		};
	}

	// Resolve message keys to text so reactive locale changes re-render labels.
	$: filterDefs = (filtersDefinition[entityType] || []).map(localizeFilter);
	$: currentFilters = $unifiedStore.tabs[entityType]?.filters || {};
	$: facets = $unifiedStore.facets || {};
	$: yearRange = facets.year_range || {};

	// Build grouped structure: ungrouped filters first, then named groups in order
	$: filterLayout = buildLayout(filterDefs);

	function buildLayout(defs) {
		const ungrouped = [];
		const groupMap = new Map(); // preserve insertion order
		for (const f of defs) {
			if (!f.groupKey) {
				ungrouped.push(f);
			} else {
				if (!groupMap.has(f.groupKey)) {
					groupMap.set(f.groupKey, {
						key: f.groupKey,
						name: resolveLabel(f.groupKey),
						filters: []
					});
				}
				groupMap.get(f.groupKey).filters.push(f);
			}
		}
		return { ungrouped, groups: [...groupMap.values()] };
	}

	// Track which groups are expanded — Trayectorias expanded by default, rest collapsed.
	// Add missing keys in place (no reassignment) to avoid a self-referential reactive loop.
	let expandedGroups = {};
	$: {
		for (const g of filterLayout.groups) {
			if (!(g.key in expandedGroups)) {
				expandedGroups[g.key] = g.key === 'conf_group_trayectorias';
			}
		}
	}

	function toggleGroup(key) {
		expandedGroups[key] = !expandedGroups[key];
		expandedGroups = expandedGroups;
	}

	// Count active filters per group
	function groupActiveCount(filters) {
		return filters.filter((f) => currentFilters[f.key]).length;
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
		yearDirty = false;
	}

	// Year range: local state so inputs don't trigger API on every keystroke
	let yearFrom = '';
	let yearTo = '';
	let yearDirty = false;

	function yearKeys() {
		const gte = filterDefs.find((f) => f.type === 'year' && f.key?.endsWith('__gte'))?.key;
		const lte = filterDefs.find((f) => f.type === 'year' && f.key?.endsWith('__lte'))?.key;
		return { gte, lte };
	}

	// Seed the inputs from the applied filters (mount + external changes such as a
	// drill-down from the chart), unless the user is mid-edit.
	$: {
		const { gte, lte } = yearKeys();
		if (!yearDirty) {
			if (gte) yearFrom = currentFilters[gte] ?? '';
			if (lte) yearTo = currentFilters[lte] ?? '';
		}
	}

	function applyYearRange(gteKey, lteKey) {
		setFilters(entityType, { [gteKey]: yearFrom || '', [lteKey]: yearTo || '' });
		yearDirty = false;
	}

	$: activeCount = Object.values(currentFilters).filter((v) => v).length;
</script>

<aside class="facet-sidebar">
	<!-- Header -->
	<div class="d-flex justify-content-between align-items-center mb-3">
		<h6 class="mb-0 fw-bold"><i class="bi bi-funnel me-1"></i> {m.filters_title()}</h6>
		{#if activeCount > 0}
			<button class="btn btn-sm btn-link text-decoration-none p-0" on:click={handleClear}>
				{m.conf_browse_clear({ count: activeCount })}
			</button>
		{/if}
	</div>

	<div class="filter-scroll">
		<!-- Ungrouped filters (e.g. Nombre search, date range) -->
		{#each filterLayout.ungrouped as filter, i}
			{@const isYearGte = filter.type === 'year' && filter.key.endsWith('__gte')}
			{@const isYearLte = filter.type === 'year' && filter.key.endsWith('__lte')}
			{@const nextFilter = filterLayout.ungrouped[i + 1]}

			{#if filter.type === 'text'}
				<div class="mb-3">
					<input
						type="text"
						class="form-control form-control-sm"
						placeholder={filter.placeholder || ''}
						value={currentFilters[filter.key] || ''}
						on:input={(e) => handleFilterChange(filter.key, e.target.value)}
					/>
				</div>
			{:else if isYearGte && nextFilter?.type === 'year'}
				<!-- Year range pair, always visible -->
				<div class="mb-3">
					<label class="form-label small mb-1">{m.conf_browse_date_range()}</label>
					<div class="d-flex align-items-center gap-2">
						<input
							type="number"
							class="form-control form-control-sm text-center"
							min={yearRange.min || ''}
							max={yearRange.max || ''}
							placeholder={yearRange.min || ''}
							bind:value={yearFrom}
							on:input={() => {
								yearDirty = true;
							}}
							on:keydown={(e) => {
								if (e.key === 'Enter') applyYearRange(filter.key, nextFilter.key);
							}}
						/>
						<span class="text-muted">–</span>
						<input
							type="number"
							class="form-control form-control-sm text-center"
							min={yearRange.min || ''}
							max={yearRange.max || ''}
							placeholder={yearRange.max || ''}
							bind:value={yearTo}
							on:input={() => {
								yearDirty = true;
							}}
							on:keydown={(e) => {
								if (e.key === 'Enter') applyYearRange(filter.key, nextFilter.key);
							}}
						/>
					</div>
					<button
						class="btn btn-sm btn-outline-primary w-100 mt-2"
						disabled={!yearDirty}
						on:click={() => applyYearRange(filter.key, nextFilter.key)}
					>
						{m.apply_button()}
					</button>
				</div>
			{:else if isYearLte && filterLayout.ungrouped[i - 1]?.type === 'year'}
				<!-- skip: already rendered with gte -->
			{/if}
		{/each}

		<!-- Grouped filters -->
		{#each filterLayout.groups as group}
			{@const active = groupActiveCount(group.filters)}
			<div class="filter-group">
				<button class="filter-group-header" on:click={() => toggleGroup(group.key)}>
					<i class="bi {expandedGroups[group.key] ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"
					></i>
					<span>{group.name}</span>
					{#if active > 0}
						<span class="ms-auto badge bg-primary" style="font-size: 0.65rem;">{active}</span>
					{/if}
				</button>
				{#if expandedGroups[group.key]}
					<div class="filter-group-body">
						{#each group.filters as filter, i}
							{@const nextFilter = group.filters[i + 1]}
							{@const isRangePair =
								filter.type === 'number' &&
								nextFilter?.type === 'number' &&
								filter.key.replace(/__(gte|lte)$/, '') ===
									nextFilter.key.replace(/__(gte|lte)$/, '')}

							{#if isRangePair}
								<!-- Number range pair (e.g. edad min/max) -->
								<div class="mb-2">
									<label class="form-label small mb-1">{filter.rangeLabel}</label>
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
							{:else if filter.type === 'number' && i > 0 && group.filters[i - 1]?.type === 'number' && filter.key.replace(/__(gte|lte)$/, '') === group.filters[i - 1].key.replace(/__(gte|lte)$/, '')}
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
										placeholder={m.conf_ph_buscar_por({ term: filter.label.toLowerCase() })}
										on:change={(e) => handleFilterChange(filter.key, e.detail, true)}
									/>
								</div>
							{:else if filter.type === 'id-searchable-select'}
								<div class="mb-2">
									<label class="form-label small mb-1">{filter.label}</label>
									<IdSearchableSelect
										options={facets[filter.facetKey] || []}
										value={currentFilters[filter.key] || ''}
										placeholder={m.conf_ph_buscar_por({ term: filter.label.toLowerCase() })}
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
