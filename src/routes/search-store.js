import { writable } from 'svelte/store';

export const searchResultsStore = writable({
    groupedResults: {
        Documentos: [],
        PersonasEsclavizadas: [],
        PersonasNoEsclavizadas: [],
        Corporaciones: []
    },
    totalResults: 0,
    currentPage: 1,
    totalPages: 1,
    nextPage: null,
    previousPage: null,
    isLoading: false,
    error: null
});
