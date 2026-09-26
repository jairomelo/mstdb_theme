export const prerender = false;

// URL params that carry search state, not form filters
// (`archivo_id` is deliberately absent: it is remapped to the `archivo`
// filter below rather than skipped)
const STATE_PARAMS = ['q', 'tab', 'view', 'page', 'page_size', 'ordering'];

export function load({ url }) {
	const sp = url.searchParams;
	const searchQuery = sp.get('q') || '';
	const tab = sp.get('tab') || '';
	const view = sp.get('view') || '';
	const page = parseInt(sp.get('page'), 10) || undefined;
	const pageSize = parseInt(sp.get('page_size'), 10) || undefined;
	const ordering = sp.get('ordering') || '';

	// Extract all remaining parameters as filters (procedencia, fecha_documento__gte, etc.)
	// `archivo_id` (drill-down from Archivos) maps to the real `archivo` filter param.
	const filters = {};
	for (const [key, value] of sp.entries()) {
		if (STATE_PARAMS.includes(key)) continue;
		filters[key === 'archivo_id' ? 'archivo' : key] = value;
	}

	return {
		searchQuery,
		tab,
		view,
		page,
		pageSize,
		ordering,
		filters
	};
}
