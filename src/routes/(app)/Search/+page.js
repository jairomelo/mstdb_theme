export const prerender = false;

export function load({ url }) {
    const searchQuery = url.searchParams.get('q') || '';
    return {
        searchQuery
    };
}