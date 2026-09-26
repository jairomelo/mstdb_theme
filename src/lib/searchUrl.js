/**
 * Central builder for /Search/ URLs, shared by the unified store and
 * drill-down navigations (Dashboard viz, Archivos) so every entry point
 * produces the same URL shape. `archivoId` is emitted as `archivo_id`,
 * which Search/+page.js maps onto the real `archivo` form filter.
 * Exact search is encoded with quoted `q` (the pre-existing convention).
 */
export const DEFAULT_PAGE_SIZE = 30;

export function buildSearchUrl({
	q,
	exactSearch,
	tab,
	view,
	page,
	pageSize,
	ordering,
	filters = {},
	archivoId
} = {}) {
	const params = new URLSearchParams();
	if (tab) params.set('tab', tab);
	if (view && view !== 'table') params.set('view', view);
	if (q) params.set('q', exactSearch ? `"${q}"` : q);
	if (archivoId !== undefined && archivoId !== null && archivoId !== '') {
		params.set('archivo_id', archivoId);
	}
	for (const [key, value] of Object.entries(filters)) {
		if (value !== null && value !== undefined && value !== '') {
			params.set(key, value);
		}
	}
	if (page && page > 1) params.set('page', String(page));
	if (pageSize && pageSize !== DEFAULT_PAGE_SIZE) params.set('page_size', String(pageSize));
	if (ordering) params.set('ordering', ordering);
	const qs = params.toString();
	return `/Search/${qs ? `?${qs}` : ''}`;
}
