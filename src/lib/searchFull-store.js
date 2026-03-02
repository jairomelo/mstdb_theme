import { writable } from 'svelte/store';
import { searchAll } from '$lib/api';
import log from '$lib/logger';

// ── Active filter state ──────────────────────────────────────────────
const initialFilters = {
    types: [],          // e.g. ['personaesclavizada', 'personanoesclavizada']
    lugar_id: [],       // Lugar PKs
    archivo_id: [],     // Archivo PKs
    year: [],           // individual years
    etnonimo: [],
    calidad: [],
    hispanizacion: [],
    ocupacion: [],
};

export const activeFilters = writable({ ...initialFilters });

export function resetFilters() {
    activeFilters.set({ ...initialFilters });
}

// ── Results store ────────────────────────────────────────────────────
const initialState = {
    results: [],
    totalResults: 0,
    currentPage: 1,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
    isLoading: false,
    error: null,
    currentSort: '',
    availableTypes: new Set(),
    typesCounts: {},
    initialTypeCounts: {},
    facets: {
        lugares: [],
        archivos: [],
        fechas: {},
        etnonimos: [],
        calidades: [],
        hispanizaciones: [],
        ocupaciones: [],
    },
};

export const searchResultsStore = writable({ ...initialState });

// ── Public API ───────────────────────────────────────────────────────

export async function initializeSearch(query, sort = '') {
    resetFilters();
    await fetchResults(null, query, sort);
    searchResultsStore.update(store => ({
        ...store,
        initialTypeCounts: store.typesCounts,
    }));
}

export async function fetchResults(page = null, searchQuery, sort = '') {
    log.info(`Fetching results: query=${searchQuery}, sort=${sort}, page=${page}`);
    searchResultsStore.update(s => ({ ...s, isLoading: true, error: null }));

    try {
        // Build params from active filters
        let filters;
        activeFilters.subscribe(f => (filters = f))();

        const params = { q: searchQuery, page: page || '1' };

        // Type filter: if specific types selected, send them; otherwise omit (= all)
        if (filters.types.length > 0) {
            params.type = filters.types.join(',');
        }
        if (sort) params.sort = sort;

        // Sidebar filter params (comma-separated)
        for (const key of ['lugar_id', 'archivo_id', 'year', 'etnonimo', 'calidad', 'hispanizacion', 'ocupacion']) {
            if (filters[key].length > 0) {
                params[key] = filters[key].join(',');
            }
        }

        console.log('fetchResults params:', params);

        const data = await searchAll(params);
        const results = data.results;
        const currentPage = parseInt(params.page);

        log.debug(`Fetched ${results.length} results`);

        const availableTypes = new Set(Object.keys(data.typeCounts));

        searchResultsStore.update(store => ({
            results,
            totalResults: data.count,
            currentPage,
            totalPages: Math.ceil(data.count / 20),
            nextPage: data.next,
            previousPage: data.previous,
            isLoading: false,
            error: null,
            currentSort: sort,
            availableTypes,
            typesCounts: data.typeCounts,
            initialTypeCounts: store.initialTypeCounts || data.typeCounts,
            facets: data.facets || store.facets,
        }));

        log.info(`Search completed: ${data.count} total results`);
    } catch (err) {
        log.error(`Error fetching results: ${err.message}`);
        console.error('Fetch error:', err);
        searchResultsStore.update(s => ({ ...s, error: err.message, isLoading: false }));
    }
}
