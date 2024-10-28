import { writable } from 'svelte/store';
import { searchAll } from '$lib/api';
import log from '$lib/logger';

const initialState = {
    results: [],
    totalResults: 0,
    currentPage: 1,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
    isLoading: false,
    error: null,
    currentSort: ''
};

export const searchResultsStore = writable(initialState);

export async function initializeSearch(query, type, sort = '') {
    await fetchResults(null, query, type, sort);
}

export async function fetchResults(page = null, searchQuery, type = '', sort = '') {
    log.info(`Fetching results: query=${searchQuery}, type=${type}, sort=${sort}, page=${page}`);
    searchResultsStore.update(store => ({ ...store, isLoading: true, error: null }));
    try {
        const params = {
            q: searchQuery,
            page: page || '1'
        };

        if (type && type !== '' && type !== 'all') {
            params.type = type;
        }

        if (sort && sort !== '') {
            params.sort = sort;
        }

        console.log('fetchResults params:', params);

        const data = await searchAll(params);

        const results = data.results;

        const currentPage = parseInt(params.page);

        log.debug(`Fetched ${data.results.length} results`);

        searchResultsStore.set({
            results,
            totalResults: data.count,
            currentPage,
            totalPages: Math.ceil(data.count / 20),
            nextPage: data.next,
            previousPage: data.previous,
            isLoading: false,
            error: null,
            currentSort: sort
        });

        log.info(`Search completed: ${data.count} total results`);
    } catch (err) {
        log.error(`Error fetching results: ${err.message}`);
        console.error('Fetch error:', err);
        searchResultsStore.update(store => ({ ...store, error: err.message, isLoading: false }));
    }
}
