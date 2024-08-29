import { writable } from 'svelte/store';

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
    error: null
};

export const searchResultsStore = writable(initialState);

const endpoint = 'http://localhost/mdb/api/search/';

export async function initializeSearch(query, filter) {
    await fetchResults(null, query, filter);
}

export async function fetchResults(pageUrl = null, searchQuery, filter = 'all') {
    searchResultsStore.update(store => ({ ...store, isLoading: true, error: null }));
    try {
        let url;
        if (pageUrl) {
            const urlObj = new URL(pageUrl, endpoint);
            urlObj.searchParams.set('q', searchQuery);
            urlObj.searchParams.set('filter', filter);
            url = urlObj.toString();
        } else {
            url = `${endpoint}?q=${encodeURIComponent(searchQuery)}&filter=${filter}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }
        const data = await response.json();

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

        const currentPage = parseInt(new URLSearchParams(pageUrl ? pageUrl.split('?')[1] : '').get('page') || 1);

        searchResultsStore.set({
            groupedResults,
            totalResults: data.count,
            currentPage,
            totalPages: Math.ceil(data.count / 20), 
            nextPage: data.next ? new URL(data.next, endpoint).pathname + new URL(data.next, endpoint).search : null,
            previousPage: data.previous ? new URL(data.previous, endpoint).pathname + new URL(data.previous, endpoint).search : null,
            isLoading: false,
            error: null
        });
    } catch (err) {
        searchResultsStore.update(store => ({ ...store, error: err.message, isLoading: false }));
    }
}