export const prerender = false;

export function load({ url }) {
    const searchQuery = url.searchParams.get('q') || '';
    const archivoId = url.searchParams.get('archivo_id') || '';
    const tab = url.searchParams.get('tab') || '';
    const view = url.searchParams.get('view') || '';
    
    // Extract all remaining parameters as filters (procedencia, fecha_documento__gte, etc.)
    const filters = {};
    for (const [key, value] of url.searchParams.entries()) {
        if (!['q', 'archivo_id', 'tab', 'view'].includes(key)) {
            filters[key] = value;
        }
    }
    
    return {
        searchQuery,
        archivoId,
        tab,
        view,
        filters,
    };
}