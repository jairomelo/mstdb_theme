export const prerender = false;

// URL params that carry search state, not form filters
const STATE_PARAMS = ['q', 'archivo_id', 'tab', 'view'];

export function load({ url }) {
	const searchQuery = url.searchParams.get('q') || '';
	const tab = url.searchParams.get('tab') || '';
	const view = url.searchParams.get('view') || '';

	// Extract all remaining parameters as filters (procedencia, fecha_documento__gte, etc.)
	// `archivo_id` (drill-down from Archivos) maps to the real `archivo` filter param.
	const filters = {};
	for (const [key, value] of url.searchParams.entries()) {
		if (STATE_PARAMS.includes(key)) continue;
		filters[key === 'archivo_id' ? 'archivo' : key] = value;
	}

	return {
		searchQuery,
		tab,
		view,
		filters
	};
}
