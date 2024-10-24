// filters.js

/**
 * This file defines the configuration for filters used in the application.
 */

export const filtersConfig = [
	{ value: 'all', name: 'Todo', icon: 'bi-grid-3x3-gap', active: true },
	{ value: 'documentos', name: 'Documentos', icon: 'bi-file-text', active: true },
	{ value: 'personas_esclavizadas', name: 'Personas Esclavizadas', icon: 'bi-person', active: true },
	{ value: 'personas_no_esclavizadas', name: 'Personas No Esclavizadas', icon: 'bi-person-check', active: true },
	{ value: 'corporaciones', name: 'Corporaciones', icon: 'bi-building', active: false },
	{ value: 'lugares', name: 'Lugares', icon: 'bi-geo-alt', active: true },
];
