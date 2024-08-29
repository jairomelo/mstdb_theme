export function load({ url }) {
    const searchQuery = url.searchParams.get('q') || '';
    const filter = url.searchParams.get('filter') || 'all';
    return {
        searchQuery,
        filter
    };
}