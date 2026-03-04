import { writable, get } from 'svelte/store';
import { fetchCounts, browseEntities } from '$lib/api';
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

const PAGE_SIZES = [30, 90, 150, 300];
export { PAGE_SIZES };

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
        filters: {},          // { search: '', sexo: 'v', ... }
        visibleColumns: defaultVisibleColumns[entityType] || [],
        isLoading: false,
        error: null,
    };
}

// ── Stores ───────────────────────────────────────────────────────────
const initialBrowseState = {
    activeTab: 'personaesclavizada',
    viewMode: 'table',       // 'table' | 'card'
    counts: {},
    countsLoading: false,
    tabs: Object.fromEntries(ENTITY_TYPES.map(t => [t, createTabState(t)])),
};

export const browseStore = writable({ ...initialBrowseState });

// ── Actions ──────────────────────────────────────────────────────────

export async function loadCounts() {
    browseStore.update(s => ({ ...s, countsLoading: true }));
    try {
        const counts = await fetchCounts();
        browseStore.update(s => ({ ...s, counts, countsLoading: false }));
    } catch (err) {
        log.error(`Error loading counts: ${err.message}`);
        browseStore.update(s => ({ ...s, countsLoading: false }));
    }
}

export async function fetchBrowseResults(entityType) {
    const state = get(browseStore);
    const tab = state.tabs[entityType];
    if (!tab) return;

    browseStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], isLoading: true, error: null },
        },
    }));

    try {
        const params = {
            page: tab.currentPage,
            page_size: tab.pageSize,
        };

        // Ordering
        if (tab.sortField) {
            params.ordering = tab.sortDir === 'desc' ? `-${tab.sortField}` : tab.sortField;
        }

        // Text search filter (DRF SearchFilter uses `search` param)
        if (tab.filters.search) {
            params.search = tab.filters.search;
        }

        // All other filters → pass as query params
        for (const [key, value] of Object.entries(tab.filters)) {
            if (key === 'search' || !value) continue;
            params[key] = value;
        }

        const data = await browseEntities(entityType, params);

        browseStore.update(s => ({
            ...s,
            tabs: {
                ...s.tabs,
                [entityType]: {
                    ...s.tabs[entityType],
                    results: data.results,
                    totalResults: data.count,
                    totalPages: Math.ceil(data.count / tab.pageSize),
                    isLoading: false,
                    error: null,
                },
            },
        }));
    } catch (err) {
        log.error(`Error browsing ${entityType}: ${err.message}`);
        browseStore.update(s => ({
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

export function setActiveTab(entityType) {
    browseStore.update(s => ({ ...s, activeTab: entityType }));
    const state = get(browseStore);
    // Auto-fetch if tab has no results yet
    if (state.tabs[entityType].results.length === 0 && !state.tabs[entityType].isLoading) {
        fetchBrowseResults(entityType);
    }
}

export function setViewMode(mode) {
    browseStore.update(s => ({ ...s, viewMode: mode }));
}

export function setPageSize(entityType, size) {
    browseStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], pageSize: size, currentPage: 1 },
        },
    }));
    fetchBrowseResults(entityType);
}

export function setPage(entityType, page) {
    browseStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], currentPage: page },
        },
    }));
    fetchBrowseResults(entityType);
}

export function toggleSort(entityType, field) {
    const state = get(browseStore);
    const tab = state.tabs[entityType];
    let newDir = 'asc';
    if (tab.sortField === field && tab.sortDir === 'asc') {
        newDir = 'desc';
    }
    browseStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], sortField: field, sortDir: newDir, currentPage: 1 },
        },
    }));
    fetchBrowseResults(entityType);
}

export function setFilter(entityType, key, value) {
    browseStore.update(s => ({
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
    fetchBrowseResults(entityType);
}

export function clearFilters(entityType) {
    browseStore.update(s => ({
        ...s,
        tabs: {
            ...s.tabs,
            [entityType]: { ...s.tabs[entityType], filters: {}, currentPage: 1 },
        },
    }));
    fetchBrowseResults(entityType);
}

export function toggleColumn(entityType, columnKey) {
    browseStore.update(s => {
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

export function resetBrowse() {
    browseStore.set({
        ...initialBrowseState,
        tabs: Object.fromEntries(ENTITY_TYPES.map(t => [t, createTabState(t)])),
    });
}

// ── Legacy exports (used by Browse/documentos and Browse/personasesclavizadas) ──
import { writable as _w } from 'svelte/store';
export const DocumentStore = _w([]);
export const PerEscStore = _w([]);
