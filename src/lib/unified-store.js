import { writable, get } from 'svelte/store';
import { searchAll, fetchCounts, exportCsv } from '$lib/api';
import { defaultVisibleColumns } from '$conf/columns';
import log from '$lib/logger';

// ── Entity type definitions ──────────────────────────────────────────
export const ENTITY_TYPES = [
    'personaesclavizada',
    'personanoesclavizada',
    'documento',
    'lugar',
    'corporacion',
];

export const PAGE_SIZES = [30, 90, 150, 300];

// ── Per-tab state factory ────────────────────────────────────────────
function createTabState(entityType) {
    return {
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 0,
        pageSize: 30,
        sortField: '',
        sortDir: 'asc',
        filters: {},          // form-based: { search: '', sexo: 'v', … }
        visibleColumns: defaultVisibleColumns[entityType] || [],
        isLoading: false,
        error: null,
    };
}

// ── Main store ───────────────────────────────────────────────────────
const initialState = {
    activeTab: 'personaesclavizada',
    viewMode: 'table',
    query: '',
    exactSearch: false,
    counts: {},              // total DB counts per entity type
    typeCounts: {},          // counts from the current query/filter context
    facets: {},
    tabs: Object.fromEntries(ENTITY_TYPES.map(t => [t, createTabState(t)])),
};

export const unifiedStore = writable({ ...initialState });

// ── Core fetch ───────────────────────────────────────────────────────

export async function fetchResults(entityType) {
    const state = get(unifiedStore);
    const tab = state.tabs[entityType];
    if (!tab) return;

    unifiedStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], isLoading: true, error: null },
        },
    }));

    try {
        const params = {
            type: entityType,
            page: tab.currentPage,
            page_size: tab.pageSize,
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
            params.ordering = tab.sortDir === 'desc'
                ? `-${tab.sortField}`
                : tab.sortField;
        }

        // Form-based filters (including 'search' for simple text filter)
        for (const [key, value] of Object.entries(tab.filters)) {
            if (!value) continue;
            params[key] = value;
        }

        const data = await searchAll(params);

        unifiedStore.update(s => ({
            ...s,
            typeCounts: data.typeCounts || s.typeCounts,
            facets: data.facets || s.facets,
            tabs: {
                ...s.tabs,
                [entityType]: {
                    ...s.tabs[entityType],
                    results: (data.results || []).map(r => r.source || r),
                    totalResults: data.count,
                    totalPages: data.total_pages || Math.ceil(data.count / tab.pageSize),
                    isLoading: false,
                    error: null,
                },
            },
        }));
    } catch (err) {
        log.error(`Error fetching ${entityType}: ${err.message}`);
        unifiedStore.update(s => ({
            ...s,
            tabs: {
                ...s.tabs,
                [entityType]: {
                    ...s.tabs[entityType],
                    isLoading: false,
                    error: err.message,
                },
            },
        }));
    }
}

// ── Actions ──────────────────────────────────────────────────────────

export async function loadCounts() {
    try {
        const counts = await fetchCounts();
        unifiedStore.update(s => ({ ...s, counts }));
    } catch (err) {
        log.error(`Error loading counts: ${err.message}`);
    }
}

export function setActiveTab(entityType) {
    unifiedStore.update(s => ({ ...s, activeTab: entityType }));
    const state = get(unifiedStore);
    // Auto-fetch if tab has no results yet
    if (state.tabs[entityType].results.length === 0 && !state.tabs[entityType].isLoading) {
        fetchResults(entityType);
    }
}

export function setViewMode(mode) {
    unifiedStore.update(s => ({ ...s, viewMode: mode }));
}

export function setQuery(query, exactSearch = false) {
    unifiedStore.update(s => ({ ...s, query, exactSearch }));
}

export function setPageSize(entityType, size) {
    unifiedStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], pageSize: size, currentPage: 1 },
        },
    }));
    fetchResults(entityType);
}

export function setPage(entityType, page) {
    unifiedStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], currentPage: page },
        },
    }));
    fetchResults(entityType);
}

export function toggleSort(entityType, field) {
    const state = get(unifiedStore);
    const tab = state.tabs[entityType];
    let newDir = 'asc';
    if (tab.sortField === field && tab.sortDir === 'asc') {
        newDir = 'desc';
    }
    unifiedStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], sortField: field, sortDir: newDir, currentPage: 1 },
        },
    }));
    fetchResults(entityType);
}

export function setFilter(entityType, key, value) {
    unifiedStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: {
                ...s.tabs[entityType],
                filters: { ...s.tabs[entityType].filters, [key]: value },
                currentPage: 1,
            },
        },
    }));
    fetchResults(entityType);
}

export function clearFilters(entityType) {
    unifiedStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], filters: {}, currentPage: 1 },
        },
    }));
    fetchResults(entityType);
}

export function toggleColumn(entityType, columnKey) {
    unifiedStore.update(s => {
        const cols = s.tabs[entityType].visibleColumns;
        const newCols = cols.includes(columnKey)
            ? cols.filter(c => c !== columnKey)
            : [...cols, columnKey];
        return {
            ...s,
            tabs: {
                ...s.tabs,
                [entityType]: { ...s.tabs[entityType], visibleColumns: newCols },
            },
        };
    });
}

/**
 * Perform a search: set query, reset all tabs to page 1, and fetch the active tab.
 */
export function performSearch(query, exactSearch = false) {
    unifiedStore.update(s => {
        const tabs = { ...s.tabs };
        for (const et of ENTITY_TYPES) {
            tabs[et] = { ...tabs[et], currentPage: 1, results: [], totalResults: 0, totalPages: 0 };
        }
        return { ...s, query, exactSearch, tabs };
    });
    const state = get(unifiedStore);
    fetchResults(state.activeTab);
}

/**
 * Clear search and switch to browse mode.
 */
export function clearSearch() {
    unifiedStore.update(s => {
        const tabs = { ...s.tabs };
        for (const et of ENTITY_TYPES) {
            tabs[et] = { ...tabs[et], currentPage: 1, results: [], totalResults: 0, totalPages: 0 };
        }
        return { ...s, query: '', exactSearch: false, tabs };
    });
    const state = get(unifiedStore);
    fetchResults(state.activeTab);
}

export function resetStore() {
    unifiedStore.set({
        ...initialState,
        tabs: Object.fromEntries(ENTITY_TYPES.map(t => [t, createTabState(t)])),
    });
}
