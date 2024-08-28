export function load({ url }) {
    const searchQuery = url.searchParams.get('q') || '';
    // console.log("In load(): searchQuery =", searchQuery);
    return {
        searchQuery
    };
}