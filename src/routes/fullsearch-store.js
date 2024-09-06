import { writable } from 'svelte/store';
import { searchAll } from '$lib/api';
import log from '$lib/logger';

const initialState = {
    groupedResults: {
        Documentos: [],
        PersonasEsclavizadas: [],
        PersonasNoEsclavizadas: [],
        Corporaciones: [],
        Lugares: [],
    },
    totalResults: 0,
    currentPage: 1,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
    isLoading: false,
    error: null,
    currentSort: '' // Add this line
};

export const searchResultsStore = writable(initialState);

export async function initializeSearch(query, filter, sort = '') {
    await fetchResults(null, query, filter, sort);
}

export async function fetchResults(page = null, searchQuery, filter = 'all', sort = '') {
    log.info(`Fetching results: query=${searchQuery}, filter=${filter}, sort=${sort}, page=${page}`);
    searchResultsStore.update(store => ({ ...store, isLoading: true, error: null }));
    try {
        const params = new URLSearchParams({
            q: searchQuery,
            filter,
            sort,
            page: page || '1'
        });

        const data = await searchAll(params.toString());

        const groupedResults = {
            Documentos: [],
            PersonasEsclavizadas: [],
            PersonasNoEsclavizadas: [],
            Corporaciones: [],
            Lugares: [],
        };

        data.results.forEach(result => {
            if (result.documento_id) {
                groupedResults.Documentos.push(result);
            } else if (result.persona_id && result.polymorphic_ctype === 29) {
                groupedResults.PersonasEsclavizadas.push(result);
            } else if (result.persona_id && result.polymorphic_ctype === 30) {
                groupedResults.PersonasNoEsclavizadas.push(result);
            } else if (result.corporacion_id) {
                groupedResults.Corporaciones.push(result);
            } else if (result.persona_x_lugares) {
                groupedResults.Lugares.push(result);
            }
        });

        const currentPage = parseInt(params.get('page'));

        log.debug(`Fetched ${data.results.length} results`);

        searchResultsStore.set({
            groupedResults,
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
        searchResultsStore.update(store => ({ ...store, error: err.message, isLoading: false }));
    }
}