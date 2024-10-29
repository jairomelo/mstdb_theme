
export const filtersConfig = [
	{ value: 'all', name: 'Todo', icon: 'bi-grid-3x3-gap', active: true },
	{ value: 'documento', name: 'Documentos', icon: 'bi-file-text', active: true },
	{ value: 'personaesclavizada', name: 'Personas Esclavizadas', icon: 'bi-person-lock', active: true },
	{ value: 'personanoesclavizada', name: 'Personas No Esclavizadas', icon: 'bi-person', active: true },
	{ value: 'corporacion', name: 'Corporaciones', icon: 'bi-building', active: true },
	{ value: 'lugar', name: 'Lugares', icon: 'bi-geo-alt', active: true },
  ];

export function getFilterConfigByValue(value) {
		return filtersConfig.find(filter => filter.value === value);
	}