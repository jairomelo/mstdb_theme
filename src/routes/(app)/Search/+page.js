export const prerender = false;

export function load({ url }) {
    const searchQuery = url.searchParams.get('q') || '';
    const archivoId = url.searchParams.get('archivo_id') || '';
    return {
        searchQuery,
        archivoId,
    };
}