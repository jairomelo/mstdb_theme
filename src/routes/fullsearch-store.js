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

export async function fetchResults(page = null, searchQuery, filter = '', sort = '', type = '') {
    log.info(`Fetching results: query=${searchQuery}, filter=${filter}, sort=${sort}, page=${page}`);
    searchResultsStore.update(store => ({ ...store, isLoading: true, error: null }));
    try {
        const params = {
            q: searchQuery,
            page: page || '1'
        };

        if (type && type !== '') {
            params.type = type;
        }

        if (filter && filter !== '') {
            params.filter = filter;
        }

        // Include 'sort' only if it's not empty
        if (sort && sort !== '') {
            params.sort = sort;
        }

        const data = await searchAll(params);

        const groupedResults = {
            Documentos: [],
            PersonasEsclavizadas: [],
            PersonasNoEsclavizadas: [],
            Corporaciones: [],
            Lugares: [],
        };

        console.log(data);

        data.results.forEach(result => {
            if (result.type === 'documento') {
                groupedResults.Documentos.push(result);
            } else if (result.type === 'personas_esclavizadas') {
                groupedResults.PersonasEsclavizadas.push(result);
            } else if (result.type === 'personanoesclavizada') {
                groupedResults.PersonasNoEsclavizadas.push(result);
            } else if (result.type === 'corporacion') {
                groupedResults.Corporaciones.push(result);
            } else if (result.type === 'lugar') {
                groupedResults.Lugares.push(result);
            }
        });

        const currentPage = parseInt(params.page);

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