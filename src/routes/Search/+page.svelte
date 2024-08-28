<script>
    import { onMount } from 'svelte';
    import { searchResultsStore, initializeSearch, fetchResults } from '../fullsearch-store';
    import { get } from 'svelte/store';

    export let data;
    let { searchQuery } = data;
    let query = searchQuery;
    let desiredPage = '';
    let currentFilter = 'all';

    onMount(() => {
        if (query) {
            initializeSearch(query, currentFilter);
        }
    });

    function handleSearch() {
        fetchResults(null, query, currentFilter);
    }

    function setFilter(filter) {
        currentFilter = filter;
        fetchResults(null, query, currentFilter);
    }

    function loadNextPage() {
        const store = get(searchResultsStore);
        if (store.nextPage) {
            fetchResults(store.nextPage);
        }
    }

    function loadPreviousPage() {
        const store = get(searchResultsStore);
        if (store.previousPage) {
            fetchResults(store.previousPage);
        }
    }

    function goToPage() {
        const store = get(searchResultsStore);
        if (desiredPage && !isNaN(desiredPage) && desiredPage >= 1 && desiredPage <= store.totalPages) {
            fetchResults(`?page=${desiredPage}`);
        } else {
            alert(`Please enter a valid page number between 1 and ${store.totalPages}`);
        }
    }

</script>




<div class="container mt-4">
    <div class="row mb-3">
        <div class="col">
            <input bind:value={query} class="form-control" placeholder="Search..." />
        </div>
        <div class="col-auto">
            <button on:click={handleSearch} class="btn btn-primary">Search</button>
        </div>
    </div>

    <div class="row mb-3">
        <div class="col">
            <button class="btn btn-outline-secondary" class:active={currentFilter === 'all'} on:click={() => setFilter('all')}>All</button>
            <button class="btn btn-outline-secondary" class:active={currentFilter === 'documentos'} on:click={() => setFilter('documentos')}>Documentos</button>
            <button class="btn btn-outline-secondary" class:active={currentFilter === 'personas_esclavizadas'} on:click={() => setFilter('personas_esclavizadas')}>Personas Esclavizadas</button>
            <button class="btn btn-outline-secondary" class:active={currentFilter === 'personas_no_esclavizadas'} on:click={() => setFilter('personas_no_esclavizadas')}>Personas No Esclavizadas</button>
            <button class="btn btn-outline-secondary" class:active={currentFilter === 'corporaciones'} on:click={() => setFilter('corporaciones')}>Corporaciones</button>
        </div>
    </div>

    {#if $searchResultsStore.isLoading}
        <div class="alert alert-info">Loading...</div>
    {:else if $searchResultsStore.error}
        <div class="alert alert-danger">{ $searchResultsStore.error }</div>
    {/if}

    {#if $searchResultsStore.totalResults > 0}
        <p>Total results found: { $searchResultsStore.totalResults }</p>

        <!-- Pagination Controls -->
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                {#if $searchResultsStore.previousPage}
                    <li class="page-item">
                        <button class="page-link" on:click={loadPreviousPage}>Previous</button>
                    </li>
                {/if}
                <li class="page-item disabled">
                    <span class="page-link">Page { $searchResultsStore.currentPage } of { $searchResultsStore.totalPages }</span>
                </li>
                {#if $searchResultsStore.nextPage}
                    <li class="page-item">
                        <button class="page-link" on:click={loadNextPage}>Next</button>
                    </li>
                {/if}
            </ul>
        </nav>

        <div class="row justify-content-center mb-3">
            <div class="col-auto">
                <input type="number" bind:value={desiredPage} min="1" max={$searchResultsStore.totalPages} class="form-control" placeholder="Go to page" />
            </div>
            <div class="col-auto">
                <button on:click={goToPage} class="btn btn-secondary">Go</button>
            </div>
        </div>

        <!-- Display Grouped Results -->
        <div class="results-section">
            {#if $searchResultsStore.groupedResults.Documentos.length > 0}
                <h3>Documentos</h3>
                <ul class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.Documentos as doc}
                        <li class="list-group-item">{doc.titulo}</li>
                    {/each}
                </ul>
            {/if}

            {#if $searchResultsStore.groupedResults.PersonasEsclavizadas.length > 0}
                <h3>Personas Esclavizadas</h3>
                <ul class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.PersonasEsclavizadas as peresc}
                        <li class="list-group-item">{peresc.nombre_normalizado}</li>
                    {/each}
                </ul>
            {/if}

            {#if $searchResultsStore.groupedResults.PersonasNoEsclavizadas.length > 0}
                <h3>Personas No Esclavizadas</h3>
                <ul class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.PersonasNoEsclavizadas as pernoesc}
                        <li class="list-group-item">{pernoesc.nombre_normalizado}</li>
                    {/each}
                </ul>
            {/if}

            {#if $searchResultsStore.groupedResults.Corporaciones.length > 0}
                <h3>Corporaciones</h3>
                <ul class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.Corporaciones as corp}
                        <li class="list-group-item">{corp.nombre_institucion}</li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</div>