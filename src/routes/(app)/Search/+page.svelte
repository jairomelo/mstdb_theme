<script>
	import { onMount } from 'svelte';
	import { searchResultsStore, initializeSearch, fetchResults } from '../../fullsearch-store';
	import { get } from 'svelte/store';
	import { derived } from 'svelte/store';

	import { tooltip } from '$lib/tooltip.js';

	export let data;
	let { searchQuery, filter } = data;
	let query = searchQuery;
	let desiredPage = '';
	let currentFilter = filter || 'all';
	let currentSort = '';
	let searchInProgress = false;
	let preSelectedFilter = 'all';
	let searchPerformed = false;

	$: searchActive = derived(
		searchResultsStore,
		($store) => $store.totalResults > 0 || $store.isLoading
	);

	onMount(() => {
		if (query) {
			initializeSearch(query, currentFilter, currentSort);
			searchPerformed = true;
		}
	});

	function initializeTooltips() {
		setTimeout(() => {
			const tooltipTriggerList = [].slice
				.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
				.filter((el) => el.getAttribute('title') || el.getAttribute('data-bs-title'));

			tooltipTriggerList.forEach((tooltipTriggerEl) => {
				tooltip(tooltipTriggerEl);
			});
		}, 0);
	}

	$: if ($searchResultsStore.totalResults > 0) {
		initializeTooltips();
	}

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
			<div class="btn-group" role="group" aria-label="Opciones de filtro">
				<button
					class="btn btn-outline-primary"
					class:active={searchPerformed ? currentFilter === 'all' : preSelectedFilter === 'all'}
					on:click={() => setFilter('all')}
				>
					<i class="bi bi-grid-3x3-gap me-1"></i> Todo
				</button>
				<button
					class="btn btn-outline-primary"
					class:active={searchPerformed
						? currentFilter === 'documentos'
						: preSelectedFilter === 'documentos'}
					on:click={() => setFilter('documentos')}
				>
					<i class="bi bi-file-text me-1"></i> Documentos
				</button>
				<button
					class="btn btn-outline-primary"
					class:active={searchPerformed
						? currentFilter === 'personas_esclavizadas'
						: preSelectedFilter === 'personas_esclavizadas'}
					on:click={() => setFilter('personas_esclavizadas')}
				>
					<i class="bi bi-person me-1"></i> Personas Esclavizadas
				</button>
				<button
					class="btn btn-outline-primary"
					class:active={searchPerformed
						? currentFilter === 'personas_no_esclavizadas'
						: preSelectedFilter === 'personas_no_esclavizadas'}
					on:click={() => setFilter('personas_no_esclavizadas')}
				>
					<i class="bi bi-person-check me-1"></i> Personas No Esclavizadas
				</button>
				<button
					class="btn btn-outline-primary"
					class:active={searchPerformed
						? currentFilter === 'corporaciones'
						: preSelectedFilter === 'corporaciones'}
					on:click={() => setFilter('corporaciones')}
				>
					<i class="bi bi-building me-1"></i> Corporaciones
				</button>
				<button
					class="btn btn-outline-primary"
					class:active={searchPerformed
						? currentFilter === 'personas_lugar_rel'
						: preSelectedFilter === 'personas_lugar_rel'}
					on:click={() => setFilter('personas_lugar_rel')}
				>
					<i class="bi bi-geo-alt me-1"></i> Lugares
				</button>
			</div>
		</div>
	</div>

	<div class="row mb-3">
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
	</div>

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
					<span class="page-link"
						>Página {$searchResultsStore.currentPage} de {$searchResultsStore.totalPages}</span
					>
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

		<!-- Mostrar Resultados Agrupados -->
		<div class="results-section">
			{#if $searchResultsStore.groupedResults.Documentos.length > 0}
				<h3 class="mt-4 mb-3"><i class="bi bi-file-text me-2"></i>Documentos</h3>
				<div class="list-group mb-4">
					{#each $searchResultsStore.groupedResults.Documentos as doc}
						<div class="list-group-item list-group-item-action">
							<div class="d-flex w-100 justify-content-between">
								<a href="/Detail/documentos/{doc.documento_id}">
								<h5 class="mb-1">{doc.titulo}</h5>
								</a>
								<small
									>{doc.fecha_inicial_raw || 'N/A'}{doc.fecha_final_raw &&
									doc.fecha_final_raw !== doc.fecha_inicial_raw
										? ` - ${doc.fecha_final_raw}`
										: ''}</small
								>
							</div>
							<p class="mb-1">
								{doc.archivo.nombre_abreviado || 'No archivo'},
								{#if doc.fondo}
									{doc.fondo || 'Sin fondo'},{/if}
								{#if doc.subfondo}
									{doc.subfondo},{/if}
								{#if doc.serie}
									{doc.serie},{/if}
								{#if doc.subserie}
									{doc.subserie},{/if}
								{#if doc.tipo_udc}
									{doc.tipo_udc}.{/if}
								{#if doc.unidad_documental_compuesta}
									{doc.unidad_documental_compuesta}.{/if}
								{#if doc.folio_final}
									ff. {doc.folio_inicial}-{doc.folio_final}
								{:else if doc.folio_inicial}
									f. {doc.folio_inicial}
								{/if}
							</p>
							<small>Identificador: {doc.documento_idno || 'N/A'}</small>
						</div>
					{/each}
				</div>
			{/if}

			{#if $searchResultsStore.groupedResults.PersonasEsclavizadas.length > 0}
				<h3 class="mt-4 mb-3"><i class="bi bi-person me-2"></i>Personas Esclavizadas</h3>
				<div class="list-group mb-4">
					{#each $searchResultsStore.groupedResults.PersonasEsclavizadas as peresc}
						<div class="list-group-item list-group-item-action">
							<div class="row">
								<div class="col-md-6">
									<a href="/Detail/personaEsclavizada/{peresc.persona_id}">
										<h5 class="mb-2">
											{peresc.nombre_normalizado}

											{#if peresc.fecha_nacimiento || peresc.fecha_defuncion}
												(<small>{peresc.fecha_nacimiento || ''}</small>)
											{/if}
										</h5>
									</a>
									<small class="identifier">{peresc.persona_idno || ''}</small>
									<p class="mb-1">Procedencia: {peresc.procedencia || 'Desconocida'}</p>
									{#if peresc.sexo || peresc.edad}
										<small
											>{#if peresc.sexo}Género: {peresc.sexo}
											{/if}{#if peresc.edad} | Edad: {peresc.edad}{/if}</small
										><br />
									{/if}
								</div>
								<div class="col-md-6">
									{#if peresc.documentos && peresc.documentos.length > 0}
										<p class="mb-1">
											<i class="bi bi-file-earmark-text me-2"></i>Documentos asociados:
										</p>
										<ul class="list-unstyled">
											{#each peresc.documentos.slice(0, 3) as doc}
												<li>
													<a
														href="/Detail/documentos/{doc.documento_id}"
														class="tooltip-url text-dark"
														data-bs-toggle="tooltip"
														data-bs-title={doc.notas || ''}
													>
														<small
															>{doc.titulo.length > 50
																? doc.titulo.substring(0, 50) + '...'
																: doc.titulo}</small
														>
													</a>
												</li>
											{/each}
											{#if peresc.documentos.length > 3}
												<li><small>y {peresc.documentos.length - 3} más...</small></li>
											{/if}
										</ul>
									{:else}
										<p><small>No hay documentos asociados a esta persona.</small></p>
									{/if}
								</div>
							</div>

							{#if peresc.lugares.length > 0}
								<div class="row mt-2">
									<div class="col-md-12">
										<p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Lugares transitados:</p>
										<ul class="list-inline">
											{#each peresc.lugares as lugar, index}
												<li class="list-inline-item">
													<small
														>{lugar.lugar.nombre_lugar} ({lugar.lugar.tipo}) [{lugar.documento
															.fecha_inicial}]</small
													>
													{#if index < peresc.lugares.length - 1}
															<li class="list-inline-item">|</li>
													{/if}
												</li>
											{/each}
										</ul>
									</div>
								</div>
							{/if}

							{#if peresc.relaciones.length > 0}
								<div class="row mt-2">
									<div class="col-md-12">
										<p class="mb-1"><i class="bi bi-people me-2"></i>Personas relacionadas:</p>
										<ul class="list-inline">
											{#each peresc.relaciones as relacion}
												{#each relacion.personas as personas}
													{#if personas.persona_idno != peresc.persona_idno}
														<li class="list-inline-item">
															{#if personas.polymorphic_ctype == 29}<a class="text-primary"
																	href="/Detail/personaEsclavizada/{personas.persona_id}"
																>
																	{personas.nombre_normalizado}
																</a>
															{:else}
																<a class="text-secondary" href="/Detail/personaNoEsclavizada/{personas.persona_id}">
																{personas.nombre_normalizado}
															</a>
															{/if}
															<span
																data-bs-toggle="tooltip"
																data-bs-title={relacion.descripcion_relacion || ''}
																><i class="bi bi-info-circle"></i></span
															>
														</li>
													{/if}
												{/each}
											{/each}
										</ul>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			{#if $searchResultsStore.groupedResults.PersonasNoEsclavizadas.length > 0}
				<h3 class="mt-4 mb-3"><i class="bi bi-person-check me-2"></i>Personas No Esclavizadas</h3>
				<div class="list-group mb-4">
					{#each $searchResultsStore.groupedResults.PersonasNoEsclavizadas as pernoesc}
						<div class="list-group-item list-group-item-action">
							<div class="row">
								<div class="col-md-6">
									<a href="/Detail/personaNoEsclavizada/{pernoesc.persona_id}">
										<h5 class="mb-2">
											{pernoesc.nombre_normalizado}
											{#if pernoesc.fecha_nacimiento || pernoesc.fecha_defuncion}
												(<small>{pernoesc.fecha_nacimiento || ''}</small>)
											{/if}
										</h5>
									</a>
									<small class="identifier">{pernoesc.persona_idno || ''}</small><br />
									{#if pernoesc.sexo || pernoesc.edad}
										<small>
											{#if pernoesc.sexo}Género: {pernoesc.sexo}{/if}
											{#if pernoesc.edad} | Edad: {pernoesc.edad}{/if}
										</small><br />
									{/if}
								</div>
								<div class="col-md-6">
									{#if pernoesc.documentos && pernoesc.documentos.length > 0}
										<p class="mb-1">
											<i class="bi bi-file-earmark-text me-2"></i>Documentos asociados:
										</p>
										<ul class="list-unstyled">
											{#each pernoesc.documentos.slice(0, 3) as doc}
												<li>
													<a
														href="/Detail/documentos/{doc.documento_id}"
														class="tooltip-url text-dark"
														data-bs-toggle="tooltip"
														data-bs-title={doc.notas || ''}
													>
														<small>
															{doc.titulo.length > 50
																? doc.titulo.substring(0, 50) + '...'
																: doc.titulo}
														</small>
													</a>
												</li>
											{/each}
											{#if pernoesc.documentos.length > 3}
												<li><small>y {pernoesc.documentos.length - 3} más...</small></li>
											{/if}
										</ul>
									{:else}
										<p><small>No hay documentos asociados a esta persona.</small></p>
									{/if}
								</div>
							</div>

							{#if pernoesc.lugares && pernoesc.lugares.length > 0}
								<div class="row mt-2">
									<div class="col-md-12">
										<p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Lugares relacionados:</p>
										<ul class="list-inline">
											{#each pernoesc.lugares as lugar, index}
												<li class="list-inline-item">
													<small>{lugar.lugar.nombre_lugar} ({lugar.lugar.tipo}) [{lugar.documento.fecha_inicial}]{#if lugar.situacion_lugar} - {lugar.situacion_lugar}{/if}</small>
												</li>
												{#if index < pernoesc.lugares.length - 1}
													<li class="list-inline-item">|</li>
												{/if}
											{/each}
										</ul>
									</div>
								</div>
							{/if}

							{#if pernoesc.relaciones && pernoesc.relaciones.length > 0}
								<div class="row mt-2">
									<div class="col-md-12">
										<p class="mb-1"><i class="bi bi-people me-2"></i>Personas relacionadas:</p>
										<ul class="list-inline">
											{#each pernoesc.relaciones as relacion}
												{#each relacion.personas as personas}
													{#if personas.persona_idno != pernoesc.persona_idno}
														<li class="list-inline-item">
															{#if personas.polymorphic_ctype == 29}
																<a class="text-primary" href="/Detail/personaEsclavizada/{personas.persona_id}">
																	{personas.nombre_normalizado}
																</a>
															{:else}
																<a class="text-secondary" href="/Detail/personaNoEsclavizada/{personas.persona_id}">
																	{personas.nombre_normalizado}
																</a>
															{/if}
															<span
																data-bs-toggle="tooltip"
																data-bs-title={relacion.descripcion_relacion || ''}
															><i class="bi bi-info-circle"></i></span>
														</li>
													{/if}
												{/each}
											{/each}
										</ul>
									</div>
								</div>
							{/if}
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
	{:else if query}
		<div class="alert alert-info mt-4">
			<i class="bi bi-info-circle me-2"></i> No se encontraron resultados para <em>{query}</em> en {currentFilter}.
			Por favor, intente con otros términos o filtros.
		</div>
	{/if}
</div>
