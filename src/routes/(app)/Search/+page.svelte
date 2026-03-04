<script>
	import { onMount } from 'svelte';
	import { searchResultsStore, initializeSearch, fetchResults } from '$lib/searchFull-store';
	import { get } from 'svelte/store';
  
	// import config files
	import { getFilterConfigByValue } from '$conf/filters.js';
  
	// import components
	import DocumentCard from './cards/DocumentCard.svelte';
	import PersonasEsclavizadas from './cards/PersonasEsclavizadasCard.svelte';
	import PersonasNoEsclavizadas from './cards/PersonasNoEsclavizadasCard.svelte';
	import CorporacionesCard from './cards/CorporacionesCard.svelte';
	import LugaresCard from './cards/LugaresCard.svelte';
	import FacetSidebar from './FacetSidebar.svelte';
  
	// define variables
	export let data;
	let { searchQuery, archivoId } = data;
	let query = searchQuery;
	let exactSearch = searchQuery?.startsWith('"') && searchQuery?.endsWith('"');
	let desiredPage = '';
	let currentSort = '';
	let searchPerformed = false;
  
	$: previousPage = $searchResultsStore.previousPage;
	$: nextPage = $searchResultsStore.nextPage;
	$: currentPage = $searchResultsStore.currentPage;
	$: totalPages = $searchResultsStore.totalPages;
  
	onMount(() => {
	  const initialFilters = {};
	  if (archivoId) {
		initialFilters.archivo_id = archivoId.split(',').map(Number);
	  }
	  if (query || Object.keys(initialFilters).length > 0) {
		initializeSearch(query, currentSort, initialFilters);
		searchPerformed = true;
	  }
	});
  
	function handleSearch() {
		searchPerformed = true;
		const searchQuery = exactSearch ? `"${query.replace(/^"|"$/g, '')}"` : query.replace(/^"|"$/g, '');
		fetchResults(null, searchQuery, currentSort);
	}

	function onFilterChange() {
		if (searchPerformed && query) {
			const searchQuery = exactSearch ? `"${query.replace(/^"|"$/g, '')}"` : query.replace(/^"|"$/g, '');
			fetchResults(null, searchQuery, currentSort);
		}
	}
  
	function loadNextPage() {
	  const store = get(searchResultsStore);
	  if (store.nextPage) {
		const nextPageParams = new URLSearchParams(store.nextPage.split('?')[1]);
		const nextPage = nextPageParams.get('page');
		const searchQuery = exactSearch ? `"${query.replace(/^"|"$/g, '')}"` : query.replace(/^"|"$/g, '');
		fetchResults(nextPage, searchQuery, currentSort);
	  }
	}
  
	function loadPreviousPage() {
	  const store = get(searchResultsStore);
	  if (store.previousPage) {
		const previousPageParams = new URLSearchParams(store.previousPage.split('?')[1]);
		const previousPage = previousPageParams.get('page');
		const searchQuery = exactSearch ? `"${query.replace(/^"|"$/g, '')}"` : query.replace(/^"|"$/g, '');
		fetchResults(previousPage, searchQuery, currentSort);
	  }
	}
  
	function goToPage() {
	  const store = get(searchResultsStore);
	  if (desiredPage && !isNaN(desiredPage) && desiredPage >= 1 && desiredPage <= store.totalPages) {
		const searchQuery = exactSearch ? `"${query.replace(/^"|"$/g, '')}"` : query.replace(/^"|"$/g, '');
		fetchResults(desiredPage.toString(), searchQuery, currentSort);
	  } else {
		alert(`Por favor, ingrese un número de página válido entre 1 y ${store.totalPages}`);
	  }
	}
  
	const componentMap = {
	  'personaesclavizada': PersonasEsclavizadas,
	  'personanoesclavizada': PersonasNoEsclavizadas,
	  'corporacion': CorporacionesCard,
	  'lugar': LugaresCard,
	  'documento': DocumentCard
	};
</script>

<div class="container-fluid mt-4 px-4">
	<!-- Search bar row (full width) -->
	<div class="row mb-3">
		<div class="col-lg-8 offset-lg-3">
			<form on:submit|preventDefault={handleSearch} class="search-form">
				<div class="input-group mb-2">
					<input
						bind:value={query}
						class="form-control"
						placeholder="Buscar..."
						aria-label="Buscar"
					/>
					<button type="submit" class="btn btn-primary">
						<i class="bi bi-search me-1"></i> Buscar
					</button>
				</div>
				<div class="d-flex justify-content-end">
					<div class="form-check">
						<input
							class="form-check-input"
							type="checkbox"
							bind:checked={exactSearch}
							id="exactSearchCheckResults"
						/>
						<label class="form-check-label" for="exactSearchCheckResults">
							Búsqueda exacta
							<i class="bi bi-info-circle ms-1" 
							   data-bs-toggle="tooltip" 
							   data-bs-placement="right" 
							   title="Busca la frase exacta (equivalente a usar comillas)"></i>
						</label>
					</div>
				</div>
			</form>
		</div>
	</div>

	<!-- Main content: sidebar + results -->
	<div class="row">
		<!-- Sidebar -->
		<div class="col-lg-3">
			{#if searchPerformed}
				<FacetSidebar on:change={onFilterChange} />
			{/if}
		</div>

		<!-- Results -->
		<div class="col-lg-9">
			{#if $searchResultsStore.isLoading}
				<div class="alert alert-info">
					<i class="bi bi-hourglass-split me-2"></i> Cargando...
				</div>
			{:else if $searchResultsStore.error}
				<div class="alert alert-danger">
					<i class="bi bi-exclamation-triangle me-2"></i>
					{$searchResultsStore.error}
				</div>
			{/if}

			{#if !query}
				<div class="alert alert-info mt-4">
					<i class="bi bi-search me-2"></i> Ingrese un término de búsqueda para comenzar la exploración.
					Puede buscar documentos, personas, corporaciones o lugares relacionados con la esclavitud en Nueva
					España.
				</div>
			{/if}

			{#if $searchResultsStore.totalResults > 0}
				<!-- Results summary -->
				<p class="text-muted mb-2">
					<small>{$searchResultsStore.totalResults} resultados encontrados</small>
				</p>

				<!-- Pagination controls -->
				<div class="pagination-controls">
					<div class="navigation-group">
						<button 
							class="nav-button" 
							disabled={!previousPage}
							on:click={loadPreviousPage}
						>
							<i class="bi bi-chevron-left"></i>
						</button>
				
						<div class="page-input-wrapper">
							<input
								type="number"
								bind:value={desiredPage}
								min="1"
								max={$searchResultsStore.totalPages}
								class="page-input"
								placeholder={currentPage.toString()}
								aria-label="Ir a página"
							/>
							<span class="page-total">de {totalPages}</span>
							<button on:click={goToPage} class="jump-button">
								<i class="bi bi-arrow-right"></i>
							</button>
						</div>
				
						<button 
							class="nav-button"
							disabled={!nextPage}
							on:click={loadNextPage}
						>
							<i class="bi bi-chevron-right"></i>
						</button>
					</div>
				</div>

				<!-- Result list -->
				<div class="list-group mb-4">
					{#each $searchResultsStore.results as item}
					  {#if componentMap[item.type]}
						<svelte:component
						  this={componentMap[item.type]}
						  {item}
						  iconClass={getFilterConfigByValue(item.type)?.icon}
						/>
					  {/if}
					{/each}
				</div>
			{:else if query && !$searchResultsStore.isLoading}
				<div class="alert alert-info mt-4">
					<i class="bi bi-info-circle me-2"></i> No se encontraron resultados para <em>{query}</em>.
					Intente con otros términos o ajuste los filtros.
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
  .search-form {
    position: relative;
  }
  
  .form-check {
    margin-left: 0.5rem;
  }
  
  .form-check-label {
    font-size: 0.9rem;
    color: #666;
    white-space: nowrap;
  }
</style>
