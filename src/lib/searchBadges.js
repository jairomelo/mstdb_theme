/**
 * Badge value for one entity tab. Returns the filter-aware count when the
 * server has reported it, otherwise '' so the UI can decide to show a
 * loading state. Zero is a valid count and must be preserved.
 */
export function tabBadge(typeCounts, entityType) {
	const c = typeCounts?.[entityType];
	return typeof c === 'number' ? c : '';
}
