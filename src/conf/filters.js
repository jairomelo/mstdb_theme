// UI labels are stored as Paraglide message keys (nameKey) and resolved at
// render time so the active locale is always honored (never call m.*() here).
export const filtersConfig = [
	{ value: 'all', nameKey: 'conf_filters_all', icon: 'bi-grid-3x3-gap', active: true },
	{ value: 'documento', nameKey: 'conf_filters_documento', icon: 'bi-file-text', active: true },
	{
		value: 'personaesclavizada',
		nameKey: 'conf_filters_personaesclavizada',
		icon: 'bi-person-lock',
		active: true
	},
	{
		value: 'personanoesclavizada',
		nameKey: 'conf_filters_personanoesclavizada',
		icon: 'bi-person',
		active: true
	},
	{ value: 'corporacion', nameKey: 'conf_filters_corporacion', icon: 'bi-building', active: true },
	{ value: 'lugar', nameKey: 'conf_filters_lugar', icon: 'bi-geo-alt', active: true }
];

export function getFilterConfigByValue(value) {
	return filtersConfig.find((filter) => filter.value === value);
}
