import { writable, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { searchAll, searchNetwork, fetchCounts, exportCsv, fetchWithBaseUrl } from '$lib/api';
import { defaultVisibleColumns } from '$conf/columns';
import { DEFAULT_CROSSTAB_CONFIG } from '$conf/crosstab';
import log from '$lib/logger';
import { buildSearchUrl } from '$lib/searchUrl';
import queryString from 'query-string';

// ── Abort controllers for in-flight requests ─────────────────────────
const abortControllers = {};

function abortPrevious(key) {
	if (abortControllers[key]) {
		abortControllers[key].abort();
	}
	abortControllers[key] = new AbortController();
	return abortControllers[key].signal;
}

// ── Entity type definitions ──────────────────────────────────────────
export const ENTITY_TYPES = [
	'personaesclavizada',
	'personanoesclavizada',
	'lugar',
	'corporacion',
	'documento'
];

export const PAGE_SIZES = [30, 90, 150, 300];

function isPeopleType(entityType) {
	return entityType === 'personaesclavizada' || entityType === 'personanoesclavizada';
}

/**
 * Sync the browser URL with the current search state via a SvelteKit
 * navigation. Push for discrete user actions (new search, tab/page change)
 * so Back restores them; replace for keystrokes and intermediate filters.
 * goto() keeps SvelteKit's history state intact, which raw
 * history.replaceState would wipe and break SPA Back/Forward.
 */
function updateUrl({ push = false } = {}) {
	if (typeof window === 'undefined') return; // SSR guard

	const state = get(unifiedStore);
	const currentTab = state.activeTab;
	const tab = state.tabs[currentTab] || {};

	goto(
		buildSearchUrl({
			tab: currentTab,
			view: state.viewMode,
			q: state.query,
			exactSearch: state.exactSearch,
			page: tab.currentPage,
			pageSize: tab.pageSize,
			ordering: tab.sortField
				? tab.sortDir === 'desc'
					? `-${tab.sortField}`
					: tab.sortField
				: '',
			filters: tab.filters || {}
		}),
		{ keepFocus: true, noScroll: true, replaceState: !push }
	);
}

function filtersMatch(a, b) {
	const ka = Object.keys(a);
	const kb = Object.keys(b);
	if (ka.length !== kb.length) return false;
	return ka.every((k) => a[k] === b[k]);
}

function isViewValidForTab(view, entityType) {
	if (view === 'table' || view === 'card') return true;
	if (view === 'map') return entityType === 'personaesclavizada';
	if (view === 'crosstab' || view === 'network') return isPeopleType(entityType);
	return false;
}

/**
 * Restore search state from the parsed URL (+page.js load data). Called on
 * mount and on every load re-run (Back/Forward, goto navigations), so it
 * must be idempotent: it patches only what differs and never writes the URL.
 */
export function applyUrlState({
	tab,
	view = 'table',
	q,
	exactSearch = false,
	page,
	pageSize,
	ordering,
	filters = {}
} = {}) {
	const current = get(unifiedStore);
	const targetTab = tab && ENTITY_TYPES.includes(tab) ? tab : current.activeTab;
	const tabState = current.tabs[targetTab];

	const nextFilters = { ...filters };
	const filtersChanged = !filtersMatch(nextFilters, tabState.filters);
	const queryChanged = (q || '') !== current.query || exactSearch !== current.exactSearch;

	let sortField = tabState.sortField;
	let sortDir = tabState.sortDir;
	if (ordering) {
		const dir = ordering.startsWith('-') ? 'desc' : 'asc';
		const field = dir === 'desc' ? ordering.slice(1) : ordering;
		if (field !== sortField || dir !== sortDir) {
			sortField = field;
			sortDir = dir;
		}
	} else if (tabState.sortField) {
		sortField = '';
		sortDir = 'asc';
	}

	const nextPage = page && page > 1 ? page : 1;
	const nextPageSize = pageSize || tabState.pageSize;
	const viewChanged = view !== current.viewMode && isViewValidForTab(view, targetTab);

	if (
		targetTab === current.activeTab &&
		!filtersChanged &&
		!queryChanged &&
		nextPage === tabState.currentPage &&
		nextPageSize === tabState.pageSize &&
		sortField === tabState.sortField &&
		sortDir === tabState.sortDir &&
		!viewChanged
	) {
		return false;
	}

	unifiedStore.update((s) => ({
		...s,
		activeTab: targetTab,
		viewMode: viewChanged ? view : s.viewMode,
		query: q || '',
		exactSearch,
		tabs: {
			...s.tabs,
			[targetTab]: {
				...s.tabs[targetTab],
				filters: nextFilters,
				currentPage: nextPage,
				pageSize: nextPageSize,
				sortField,
				sortDir
			}
		}
	}));

	const state = get(unifiedStore);
	if (state.viewMode === 'network' && isPeopleType(targetTab)) {
		fetchSearchNetwork(targetTab);
	}
	fetchResults(targetTab);
	return true;
}

// ── Per-tab state factory ────────────────────────────────────────────
function createTabState(entityType) {
	const defaultCT = DEFAULT_CROSSTAB_CONFIG[entityType];
	return {
		results: [],
		totalResults: 0,
		currentPage: 1,
		totalPages: 0,
		pageSize: 30,
		sortField: '',
		sortDir: 'asc',
		filters: {}, // form-based: { search: '', sexo: 'v', … }
		visibleColumns: defaultVisibleColumns[entityType] || [],
		isLoading: false,
		error: null,
		// Crosstab / pivot view state (only meaningful for PE and PNE)
		crosstabConfig: defaultCT
			? { ...defaultCT, result: null, isLoading: false, error: null }
			: null,
		network: {
			graphData: null,
			isLoading: false,
			error: null,
			scopeMode: 'strict'
		}
	};
}

// ── Main store ───────────────────────────────────────────────────────
const initialState = {
	activeTab: 'personaesclavizada',
	viewMode: 'table',
	query: '',
	exactSearch: false,
	counts: {}, // total DB counts per entity type
	typeCounts: {}, // counts from the current query/filter context
	facets: {},
	tabs: Object.fromEntries(ENTITY_TYPES.map((t) => [t, createTabState(t)]))
};

export const unifiedStore = writable({ ...initialState });

// ── Core fetch ───────────────────────────────────────────────────────

export async function fetchResults(entityType) {
	const state = get(unifiedStore);
	const tab = state.tabs[entityType];
	if (!tab) return;

	// Abort any in-flight fetch for this entity type
	const signal = abortPrevious(`fetch:${entityType}`);

	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: { ...s.tabs[entityType], isLoading: true, error: null }
		}
	}));

	try {
		const params = {
			type: entityType,
			page: tab.currentPage,
			page_size: tab.pageSize
		};

		// Search query (FTS mode)
		if (state.query) {
			const q = state.exactSearch
				? `"${state.query.replace(/^"|"$/g, '')}"`
				: state.query.replace(/^"|"$/g, '');
			params.q = q;
		}

		// Ordering
		if (tab.sortField) {
			params.ordering = tab.sortDir === 'desc' ? `-${tab.sortField}` : tab.sortField;
		}

		// Form-based filters (including 'search' for simple text filter)
		for (const [key, value] of Object.entries(tab.filters)) {
			if (!value) continue;
			params[key] = value;
		}

		const filteredParams = {};
		for (const key in params) {
			if (params[key] !== null && params[key] !== '' && params[key] !== undefined) {
				filteredParams[key] = params[key];
			}
		}
		const qs = queryString.stringify(filteredParams);
		const data = await fetchWithBaseUrl(`search/?${qs}`, { signal });

		unifiedStore.update((s) => ({
			...s,
			typeCounts: data.typeCounts || s.typeCounts,
			facets: data.facets || s.facets,
			tabs: {
				...s.tabs,
				[entityType]: {
					...s.tabs[entityType],
					results: (data.results || []).map((r) => r.source || r),
					totalResults: data.count,
					totalPages: data.total_pages || Math.ceil(data.count / tab.pageSize),
					isLoading: false,
					error: null
				}
			}
		}));

		const refreshed = get(unifiedStore);
		if (
			refreshed.viewMode === 'network' &&
			refreshed.activeTab === entityType &&
			isPeopleType(entityType)
		) {
			fetchSearchNetwork(entityType);
		}
	} catch (err) {
		// Silently ignore aborted requests
		if (err.name === 'AbortError') return;

		log.error(`Error fetching ${entityType}: ${err.message}`);
		unifiedStore.update((s) => ({
			...s,
			tabs: {
				...s.tabs,
				[entityType]: {
					...s.tabs[entityType],
					isLoading: false,
					error: err.message
				}
			}
		}));
	}
}

export async function fetchSearchNetwork(entityType) {
	if (!isPeopleType(entityType)) return;

	const state = get(unifiedStore);
	const tab = state.tabs[entityType];
	if (!tab) return;

	const signal = abortPrevious(`network:${entityType}`);

	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: {
				...s.tabs[entityType],
				network: {
					...s.tabs[entityType].network,
					isLoading: true,
					error: null
				}
			}
		}
	}));

	try {
		const params = {
			type: entityType,
			scope_mode: tab.network.scopeMode || 'strict'
		};

		if (state.query) {
			const q = state.exactSearch
				? `"${state.query.replace(/^"|"$/g, '')}"`
				: state.query.replace(/^"|"$/g, '');
			params.q = q;
		}

		for (const [key, value] of Object.entries(tab.filters)) {
			if (!value) continue;
			params[key] = value;
		}

		const data = await searchNetwork(params, { signal });

		unifiedStore.update((s) => ({
			...s,
			tabs: {
				...s.tabs,
				[entityType]: {
					...s.tabs[entityType],
					network: {
						...s.tabs[entityType].network,
						graphData: data,
						isLoading: false,
						error: null
					}
				}
			}
		}));
	} catch (err) {
		if (err.name === 'AbortError') return;

		log.error(`Error fetching network for ${entityType}: ${err.message}`);
		unifiedStore.update((s) => ({
			...s,
			tabs: {
				...s.tabs,
				[entityType]: {
					...s.tabs[entityType],
					network: {
						...s.tabs[entityType].network,
						isLoading: false,
						error: err.message
					}
				}
			}
		}));
	}
}

// ── Actions ──────────────────────────────────────────────────────────

export async function loadCounts() {
	const signal = abortPrevious('counts');
	try {
		const counts = await fetchWithBaseUrl('counts/', { signal });
		unifiedStore.update((s) => ({ ...s, counts }));
	} catch (err) {
		if (err.name === 'AbortError') return;
		log.error(`Error loading counts: ${err.message}`);
	}
}

export function setActiveTab(entityType, { push = true } = {}) {
	unifiedStore.update((s) => ({ ...s, activeTab: entityType }));
	updateUrl({ push });
	const state = get(unifiedStore);
	// Auto-fetch if tab has no results yet
	if (state.tabs[entityType].results.length === 0 && !state.tabs[entityType].isLoading) {
		fetchResults(entityType);
	}
	if (state.viewMode === 'network' && isPeopleType(entityType)) {
		fetchSearchNetwork(entityType);
	}
}

export function setViewMode(mode) {
	unifiedStore.update((s) => ({ ...s, viewMode: mode }));
	updateUrl({ push: false });
	const state = get(unifiedStore);
	if (mode === 'network' && isPeopleType(state.activeTab)) {
		fetchSearchNetwork(state.activeTab);
	}
}

export function setQuery(query, exactSearch = false) {
	unifiedStore.update((s) => ({ ...s, query, exactSearch }));
}

export function setPageSize(entityType, size) {
	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: { ...s.tabs[entityType], pageSize: size, currentPage: 1 }
		}
	}));
	updateUrl({ push: false });
	fetchResults(entityType);
}

export function setPage(entityType, page) {
	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: { ...s.tabs[entityType], currentPage: page }
		}
	}));
	updateUrl({ push: true });
	fetchResults(entityType);
}

export function toggleSort(entityType, field) {
	const state = get(unifiedStore);
	const tab = state.tabs[entityType];
	let newDir = 'asc';
	if (tab.sortField === field && tab.sortDir === 'asc') {
		newDir = 'desc';
	}
	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: { ...s.tabs[entityType], sortField: field, sortDir: newDir, currentPage: 1 }
		}
	}));
	updateUrl({ push: false });
	fetchResults(entityType);
}

export function setFilter(entityType, key, value) {
	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: {
				...s.tabs[entityType],
				filters: { ...s.tabs[entityType].filters, [key]: value },
				currentPage: 1
			}
		}
	}));
	updateUrl({ push: false });
	fetchResults(entityType);
}

export function setFilters(entityType, entries) {
	unifiedStore.update((s) => {
		const merged = { ...s.tabs[entityType].filters };
		for (const [key, value] of Object.entries(entries)) {
			merged[key] = value;
		}
		return {
			...s,
			tabs: {
				...s.tabs,
				[entityType]: { ...s.tabs[entityType], filters: merged, currentPage: 1 }
			}
		};
	});
	updateUrl({ push: false });
	fetchResults(entityType);
}

export function clearFilters(entityType) {
	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: { ...s.tabs[entityType], filters: {}, currentPage: 1 }
		}
	}));
	updateUrl({ push: false });
	fetchResults(entityType);
}

export function setNetworkScope(entityType, scopeMode) {
	if (!isPeopleType(entityType)) return;
	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: {
				...s.tabs[entityType],
				network: {
					...s.tabs[entityType].network,
					scopeMode
				}
			}
		}
	}));
	fetchSearchNetwork(entityType);
}

export function toggleColumn(entityType, columnKey) {
	unifiedStore.update((s) => {
		const cols = s.tabs[entityType].visibleColumns;
		const newCols = cols.includes(columnKey)
			? cols.filter((c) => c !== columnKey)
			: [...cols, columnKey];
		return {
			...s,
			tabs: {
				...s.tabs,
				[entityType]: { ...s.tabs[entityType], visibleColumns: newCols }
			}
		};
	});
}

/**
 * Perform a search: set query, reset all tabs to page 1, and fetch the active tab.
 */
export function performSearch(query, exactSearch = false) {
	unifiedStore.update((s) => {
		const tabs = { ...s.tabs };
		for (const et of ENTITY_TYPES) {
			tabs[et] = { ...tabs[et], currentPage: 1, results: [], totalResults: 0, totalPages: 0 };
		}
		return { ...s, query, exactSearch, tabs };
	});

	updateUrl({ push: true });

	const state = get(unifiedStore);
	fetchResults(state.activeTab);
}

/**
 * Clear search and switch to browse mode.
 */
export function clearSearch() {
	unifiedStore.update((s) => {
		const tabs = { ...s.tabs };
		for (const et of ENTITY_TYPES) {
			tabs[et] = { ...tabs[et], currentPage: 1, results: [], totalResults: 0, totalPages: 0 };
		}
		return { ...s, query: '', exactSearch: false, tabs };
	});

	updateUrl({ push: true });

	const state = get(unifiedStore);
	fetchResults(state.activeTab);
}

export function resetStore() {
	// Cancel all in-flight requests before resetting
	for (const key of Object.keys(abortControllers)) {
		abortControllers[key].abort();
		delete abortControllers[key];
	}
	unifiedStore.set({
		...initialState,
		tabs: Object.fromEntries(ENTITY_TYPES.map((t) => [t, createTabState(t)]))
	});
}

export function abortAll() {
	for (const key of Object.keys(abortControllers)) {
		abortControllers[key].abort();
		delete abortControllers[key];
	}
}

// ── Crosstab / pivot-table actions ───────────────────────────────────────────

/**
 * Update one or more fields of the crosstabConfig for an entity tab.
 * Does NOT trigger a fetch — call fetchCrosstab() separately.
 */
export function setCrosstabConfig(entityType, patch) {
	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: {
				...s.tabs[entityType],
				crosstabConfig: {
					...s.tabs[entityType].crosstabConfig,
					...patch
				}
			}
		}
	}));
}

/**
 * Fetch the pivot-table data for the given entity type.
 * Uses crosstabConfig settings + current tab filters + global search query.
 */
export async function fetchCrosstab(entityType) {
	const state = get(unifiedStore);
	const tab = state.tabs[entityType];
	if (!tab?.crosstabConfig) return;

	const cfg = tab.crosstabConfig;
	const signal = abortPrevious(`crosstab:${entityType}`);

	unifiedStore.update((s) => ({
		...s,
		tabs: {
			...s.tabs,
			[entityType]: {
				...s.tabs[entityType],
				crosstabConfig: {
					...s.tabs[entityType].crosstabConfig,
					isLoading: true,
					error: null
				}
			}
		}
	}));

	try {
		const params = {
			type: entityType,
			row_dim: cfg.rowDim,
			col_dim: cfg.colDim,
			cell_op: cfg.cellOp,
			period_size: cfg.periodSize
		};

		// Pass through the active search query
		if (state.query) {
			params.q = state.exactSearch
				? `"${state.query.replace(/^"|"$/g, '')}"`
				: state.query.replace(/^"|"$/g, '');
		}

		// Pass through all active form filters
		for (const [key, value] of Object.entries(tab.filters)) {
			if (value !== null && value !== '' && value !== undefined) {
				params[key] = value;
			}
		}

		const qs = queryString.stringify(params);
		const data = await fetchWithBaseUrl(`crosstab/?${qs}`, { signal });

		unifiedStore.update((s) => ({
			...s,
			tabs: {
				...s.tabs,
				[entityType]: {
					...s.tabs[entityType],
					crosstabConfig: {
						...s.tabs[entityType].crosstabConfig,
						result: data,
						isLoading: false,
						error: null
					}
				}
			}
		}));
	} catch (err) {
		if (err.name === 'AbortError') return;
		log.error(`Error fetching crosstab for ${entityType}: ${err.message}`);
		unifiedStore.update((s) => ({
			...s,
			tabs: {
				...s.tabs,
				[entityType]: {
					...s.tabs[entityType],
					crosstabConfig: {
						...s.tabs[entityType].crosstabConfig,
						isLoading: false,
						error: err.message
					}
				}
			}
		}));
	}
}
