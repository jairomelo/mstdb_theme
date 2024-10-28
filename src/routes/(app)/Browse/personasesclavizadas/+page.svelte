<script>
    import { PerEscStore } from '$lib/browse-store';
    import { onMount } from 'svelte';

    let searchQuery = ''; 
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;
    let nextPageUrl = null;
    let previousPageUrl = null;
    let desiredPage = ''; // Variable for user input page number

    async function fetchData(pageUrl, search = '') {
        isLoading = true;
        let endpoint = pageUrl;
        
        if (search) {
            const searchParam = `&search=${encodeURIComponent(search)}`;
            endpoint = pageUrl.includes('?') ? endpoint + searchParam : endpoint + `?search=${search}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        nextPageUrl = data.next;
        previousPageUrl = data.previous;
        totalPages = Math.ceil(data.count / 20); 
        PerEscStore.set(data.results);

        const urlParams = new URLSearchParams(pageUrl.split('?')[1]);
        currentPage = parseInt(urlParams.get('page') || 1);

        isLoading = false;
    }

    function handleSearch() {
        fetchData('http://localhost:81/mdb/api/peresclavizadas/?page=1', searchQuery);
    }

    function loadNextPage() {
        if (nextPageUrl) {
            fetchData(nextPageUrl, searchQuery);
        }
    }

    function loadPreviousPage() {
        if (previousPageUrl) {
            fetchData(previousPageUrl, searchQuery);
        }
    }

    function goToPage() {
        if (desiredPage && !isNaN(desiredPage) && desiredPage >= 1 && desiredPage <= totalPages) {
            fetchData(`http://localhost:81/mdb/api/peresclavizadas/?page=${desiredPage}`, searchQuery);
        } else {
            alert(`Please enter a valid page number between 1 and ${totalPages}`);
        }
    }

    onMount(() => {
        fetchData('http://localhost:81/mdb/api/peresclavizadas/?page=1'); 
    });
</script>

<div>
    <!-- Search Box -->
    <input type="text" bind:value={searchQuery} placeholder="Search...">
    <button on:click={handleSearch}>Search</button>

    <!-- Results -->
    <ul>
        {#each $PerEscStore as peresc}
            <li>{peresc.nombre_normalizado}</li>
        {/each}
    </ul>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
        <button on:click={loadPreviousPage} disabled={!previousPageUrl}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>

        <!-- Input Box to Jump to a Specific Page -->
        <input type="number" bind:value={desiredPage} min="1" max={totalPages} placeholder="Go to page">
        <button on:click={goToPage}>Go</button>

        <button on:click={loadNextPage} disabled={!nextPageUrl}>Next</button>
    </div>

    {#if isLoading}
        <p>Loading...</p>
    {/if}
</div>
