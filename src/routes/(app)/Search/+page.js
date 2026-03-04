export const prerender = false;

export function load({ url }) {
    const searchQuery = url.searchParams.get('q') || '';
    const archivoId = url.searchParams.get('archivo_id') || '';
    const tab = url.searchParams.get('tab') || '';
    const view = url.searchParams.get('view') || '';
    return {
        searchQuery,
        archivoId,
        tab,
        view,
    };
}