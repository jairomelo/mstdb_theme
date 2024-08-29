<script>
    import { onMount } from 'svelte';
    import { searchResultsStore, initializeSearch, fetchResults } from '../../fullsearch-store';
    import { get } from 'svelte/store';

    export let data;
    let { searchQuery, filter } = data;
    let query = searchQuery;
    let desiredPage = '';
    let currentFilter = filter || 'all';

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
            fetchResults(store.nextPage, query, currentFilter);
        }
    }

    function loadPreviousPage() {
        const store = get(searchResultsStore);
        if (store.previousPage) {
            fetchResults(store.previousPage, query, currentFilter);
        }
    }

    function goToPage() {
        const store = get(searchResultsStore);
        if (desiredPage && !isNaN(desiredPage) && desiredPage >= 1 && desiredPage <= store.totalPages) {
            fetchResults(`?page=${desiredPage}`, query, currentFilter);
        } else {
            alert(`Please enter a valid page number between 1 and ${store.totalPages}`);
        }
    }

</script>


<div class="container mt-4">
    <div class="row mb-3">
        <div class="col">
            <form on:submit|preventDefault={handleSearch} class="input-group">
                <input bind:value={query} class="form-control" placeholder="Buscar..." aria-label="Buscar" />
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-search me-1"></i> Buscar
                </button>
            </form>
        </div>
    </div>

    <div class="row mb-3">
        <div class="col">
            <div class="btn-group" role="group" aria-label="Opciones de filtro">
                <button class="btn btn-outline-primary" class:active={currentFilter === 'all'} on:click={() => setFilter('all')}>
                    <i class="bi bi-grid-3x3-gap me-1"></i> Todo
                </button>
                <button class="btn btn-outline-primary" class:active={currentFilter === 'documentos'} on:click={() => setFilter('documentos')}>
                    <i class="bi bi-file-text me-1"></i> Documentos
                </button>
                <button class="btn btn-outline-primary" class:active={currentFilter === 'personas_esclavizadas'} on:click={() => setFilter('personas_esclavizadas')}>
                    <i class="bi bi-person me-1"></i> Personas Esclavizadas
                </button>
                <button class="btn btn-outline-primary" class:active={currentFilter === 'personas_no_esclavizadas'} on:click={() => setFilter('personas_no_esclavizadas')}>
                    <i class="bi bi-person-check me-1"></i> Personas No Esclavizadas
                </button>
                <button class="btn btn-outline-primary" class:active={currentFilter === 'corporaciones'} on:click={() => setFilter('corporaciones')}>
                    <i class="bi bi-building me-1"></i> Corporaciones
                </button>
                <button class="btn btn-outline-primary" class:active={currentFilter === 'personas_lugar_rel'} on:click={() => setFilter('personas_lugar_rel')}>
                    <i class="bi bi-geo-alt me-1"></i> Lugares
                </button>
            </div>
        </div>
    </div>

    {#if $searchResultsStore.isLoading}
        <div class="alert alert-info">
            <i class="bi bi-hourglass-split me-2"></i> Cargando...
        </div>
    {:else if $searchResultsStore.error}
        <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i> { $searchResultsStore.error }
        </div>
    {/if}

    {#if $searchResultsStore.totalResults > 0}
        <p class="text-muted">
            <i class="bi bi-info-circle me-2"></i> Número de resultados: { $searchResultsStore.totalResults }
        </p>

        <!-- Controles de Paginación -->
        <nav aria-label="Navegación de página" class="my-4">
            <ul class="pagination justify-content-center">
                {#if $searchResultsStore.previousPage}
                    <li class="page-item">
                        <button class="page-link" on:click={loadPreviousPage}>
                            <i class="bi bi-chevron-left"></i> Anterior
                        </button>
                    </li>
                {/if}
                <li class="page-item disabled">
                    <span class="page-link">Página { $searchResultsStore.currentPage } de { $searchResultsStore.totalPages }</span>
                </li>
                {#if $searchResultsStore.nextPage}
                    <li class="page-item">
                        <button class="page-link" on:click={loadNextPage}>
                            Siguiente <i class="bi bi-chevron-right"></i>
                        </button>
                    </li>
                {/if}
            </ul>
        </nav>

        <div class="row justify-content-center mb-3">
            <div class="col-auto">
                <div class="input-group">
                    <input type="number" bind:value={desiredPage} min="1" max={$searchResultsStore.totalPages} class="form-control" placeholder="Ir a página" aria-label="Ir a página" />
                    <button on:click={goToPage} class="btn btn-secondary">
                        <i class="bi bi-arrow-right-circle me-1"></i> Ir
                    </button>
                </div>
            </div>
        </div>

        <!-- Mostrar Resultados Agrupados -->
        <div class="results-section">
            {#if $searchResultsStore.groupedResults.Documentos.length > 0}
                <h3 class="mt-4 mb-3"><i class="bi bi-file-text me-2"></i>Documentos</h3>
                <div class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.Documentos as doc}
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">{doc.titulo}</h5>
                                <small>{doc.fecha_documento || 'N/A'}</small>
                            </div>
                            <p class="mb-1">{doc.descripcion || 'Sin descripción disponible'}</p>
                            <small>Tipo: {doc.tipo_documento || 'N/A'}</small>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if $searchResultsStore.groupedResults.PersonasEsclavizadas.length > 0}
                <h3 class="mt-4 mb-3"><i class="bi bi-person me-2"></i>Personas Esclavizadas</h3>
                <div class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.PersonasEsclavizadas as peresc}
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">{peresc.nombre_normalizado}</h5>
                                <small>{peresc.fecha_nacimiento || 'N/A'}</small>
                            </div>
                            <p class="mb-1">Origen: {peresc.origen || 'Desconocido'}</p>
                            <small>Género: {peresc.genero || 'N/A'} | Edad: {peresc.edad || 'N/A'}</small>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if $searchResultsStore.groupedResults.PersonasNoEsclavizadas.length > 0}
                <h3 class="mt-4 mb-3"><i class="bi bi-person-check me-2"></i>Personas No Esclavizadas</h3>
                <div class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.PersonasNoEsclavizadas as pernoesc}
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">{pernoesc.nombre_normalizado}</h5>
                                <small>{pernoesc.fecha_nacimiento || 'N/A'}</small>
                            </div>
                            <p class="mb-1">Ocupación: {pernoesc.ocupacion || 'Desconocida'}</p>
                            <small>Género: {pernoesc.genero || 'N/A'} | Edad: {pernoesc.edad || 'N/A'}</small>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if $searchResultsStore.groupedResults.Corporaciones.length > 0}
                <h3 class="mt-4 mb-3"><i class="bi bi-building me-2"></i>Corporaciones</h3>
                <div class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.Corporaciones as corp}
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">{corp.nombre_institucion}</h5>
                                <small>{corp.fecha_fundacion || 'N/A'}</small>
                            </div>
                            <p class="mb-1">Tipo: {corp.tipo_institucion || 'Desconocido'}</p>
                            <small>Ubicación: {corp.ubicacion || 'N/A'}</small>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if $searchResultsStore.groupedResults.Lugares.length > 0}
                <h3 class="mt-4 mb-3"><i class="bi bi-geo-alt me-2"></i>Lugares</h3>
                <div class="list-group mb-4">
                    {#each $searchResultsStore.groupedResults.Lugares as lugar}
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">{lugar.lugar}</h5>
                                <small>{lugar.tipo_lugar || 'N/A'}</small>
                            </div>
                            <p class="mb-1">Región: {lugar.region || 'Desconocida'}</p>
                            <small>Coordenadas: {lugar.coordenadas || 'N/A'}</small>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>