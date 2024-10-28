<script>
	import { onMount } from 'svelte';
	import { searchResultsStore, initializeSearch, fetchResults } from '../../fullsearch-store';
	import { get } from 'svelte/store';
  
	// import config files
	import { filtersConfig, getFilterConfigByValue } from '$conf/filters.js';
  
	// import components
	import DocumentCard from './cards/DocumentCard.svelte';
	import PersonasEsclavizadas from './cards/PersonasEsclavizadasCard.svelte';
	import PersonasNoEsclavizadas from './cards/PersonasNoEsclavizadasCard.svelte';
	import CorporacionesCard from './cards/CorporacionesCard.svelte';
	import LugaresCard from './cards/LugaresCard.svelte';
	import Pagination from '../Components/Pagination.svelte';
  
	// define variables
	export let data;
	let { searchQuery, filter } = data;
	let query = searchQuery;
	let desiredPage = '';
	let currentFilter = filter || 'all';
	let currentSort = '';
	let preSelectedFilter = 'all';
	let searchPerformed = false;
  
	$: previousPage = $searchResultsStore.previousPage;
	$: nextPage = $searchResultsStore.nextPage;
	$: currentPage = $searchResultsStore.currentPage;
	$: totalPages = $searchResultsStore.totalPages;
  
	onMount(() => {
	  if (query) {
		initializeSearch(query, currentFilter, currentSort);
		searchPerformed = true;
	  }
	});
  
	function handleSearch() {
	  searchPerformed = true;
	  currentFilter = preSelectedFilter;
	  fetchResults(null, query, currentFilter, currentSort);
	}
  
	function setFilter(filter) {
	  if (searchPerformed) {
		currentFilter = filter;
		fetchResults(null, query, currentFilter, currentSort);
	  } else {
		preSelectedFilter = filter;
	  }
	}
  
	function setSort(sort) {
	  currentSort = sort;
	  fetchResults(null, query, currentFilter, currentSort);
	}
  
	function loadNextPage() {
	  const store = get(searchResultsStore);
	  if (store.nextPage) {
		const nextPageParams = new URLSearchParams(store.nextPage.split('?')[1]);
		const nextPage = nextPageParams.get('page');
		fetchResults(nextPage, query, currentFilter, currentSort);
	  }
	}
  
	function loadPreviousPage() {
	  const store = get(searchResultsStore);
	  if (store.previousPage) {
		const previousPageParams = new URLSearchParams(store.previousPage.split('?')[1]);
		const previousPage = previousPageParams.get('page');
		fetchResults(previousPage, query, currentFilter, currentSort);
	  }
	}
  
	function goToPage() {
	  const store = get(searchResultsStore);
	  if (desiredPage && !isNaN(desiredPage) && desiredPage >= 1 && desiredPage <= store.totalPages) {
		fetchResults(desiredPage.toString(), query, currentFilter, currentSort);
	  } else {
		alert(`Por favor, ingrese un número de página válido entre 1 y ${store.totalPages}`);
	  }
	}
  
	const componentMap = {
	  'documento': DocumentCard,
	  'personaesclavizada': PersonasEsclavizadas,
	  'personanoesclavizada': PersonasNoEsclavizadas,
	  'corporacion': CorporacionesCard,
	  'lugar': LugaresCard
	};
  </script>

<div class="container mt-4">
	<div class="row mb-3">
		<div class="col">
			<form on:submit|preventDefault={handleSearch} class="input-group">
				<input
					bind:value={query}
					class="form-control"
					placeholder="Buscar..."
					aria-label="Buscar"
				/>
				<button type="submit" class="btn btn-primary">
					<i class="bi bi-search me-1"></i> Buscar
				</button>
			</form>
		</div>
	</div>

	<div class="row mb-3">
		<div class="col">
			{#each filtersConfig as filter}
				{#if filter.active}
					<button
						class="btn btn-outline-primary"
						class:active={searchPerformed ? currentFilter === filter.value : preSelectedFilter === filter.value}
						on:click={() => setFilter(filter.value)}
					>
						<i class="bi {filter.icon} me-1"></i> {filter.name}
					</button>
				{/if}
			{/each}
		</div>
	</div>

	<!-- <div class="row mb-3">
		<div class="col">
			<div class="btn-group" role="group" aria-label="Opciones de ordenamiento">
				<button
					class="btn btn-outline-secondary"
					class:active={currentSort === 'fecha_inicial'}
					on:click={() => setSort('fecha_inicial')}
				>
					<i class="bi bi-sort-numeric-down me-1"></i> Fecha Inicial (Asc)
				</button>
				<button
					class="btn btn-outline-secondary"
					class:active={currentSort === '-fecha_inicial'}
					on:click={() => setSort('-fecha_inicial')}
				>
					<i class="bi bi-sort-numeric-up me-1"></i> Fecha Inicial (Desc)
				</button>
				<button
					class="btn btn-outline-secondary"
					class:active={currentSort === 'fecha_final'}
					on:click={() => setSort('fecha_final')}
				>
					<i class="bi bi-sort-numeric-down me-1"></i> Fecha Final (Asc)
				</button>
				<button
					class="btn btn-outline-secondary"
					class:active={currentSort === '-fecha_final'}
					on:click={() => setSort('-fecha_final')}
				>
					<i class="bi bi-sort-numeric-up me-1"></i> Fecha Final (Desc)
				</button>
			</div>
		</div>
	</div> -->

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
		<p class="text-muted">
			<i class="bi bi-info-circle me-2"></i> Número de resultados: {$searchResultsStore.totalResults}
		</p>

		<!-- Controles de Paginación -->
		<Pagination 
			currentPage={currentPage}
			totalPages={totalPages}
			loadNextPage={loadNextPage}
			loadPreviousPage={loadPreviousPage}
			previousPage={previousPage}
			nextPage={nextPage}
		/>

		<div class="row justify-content-center mb-3">
			<div class="col-auto">
				<div class="input-group">
					<input
						type="number"
						bind:value={desiredPage}
						min="1"
						max={$searchResultsStore.totalPages}
						class="form-control"
						placeholder="Ir a página"
						aria-label="Ir a página"
					/>
					<button on:click={goToPage} class="btn btn-secondary">
						<i class="bi bi-arrow-right-circle me-1"></i> Ir
					</button>
				</div>
			</div>
		</div>

		<!-- Display Results in a Single List -->
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
			<i class="bi bi-info-circle me-2"></i> No se encontraron resultados para <em>{query}</em> en {currentFilter}.
			Por favor, intente con otros términos o filtros.
		</div>
	{/if}
</div>
