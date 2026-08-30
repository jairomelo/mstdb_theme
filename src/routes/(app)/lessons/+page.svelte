<script>
	import { onMount } from 'svelte';
	import { fetchLecciones, leccionNiveles, leccionPalabrasClave } from '$lib/api.js';
	import { user } from '$lib/stores/user';

	$: canCreate = $user?.is_staff || $user?.groups?.includes('colectores');

	const PAGE_SIZE = 12;

	let lecciones = [];
	let count = 0;
	let page = 1;
	let loading = true;
	let error = null;

	let niveles = [];
	let palabrasClave = [];
	let selectedNivel = '';
	let selectedPalabraClave = '';
	let ordering = 'title';

	$: totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

	onMount(async () => {
		try {
			const [nivelesResp, palabrasResp] = await Promise.all([leccionNiveles(), leccionPalabrasClave()]);
			niveles = nivelesResp.results ?? nivelesResp;
			palabrasClave = palabrasResp.results ?? palabrasResp;
		} catch (e) {
			console.warn('Could not fetch lesson facets:', e);
		}
		await load(1);
	});

	async function load(targetPage) {
		loading = true;
		error = null;
		try {
			const data = await fetchLecciones({
				page: targetPage,
				page_size: PAGE_SIZE,
				ordering,
				levels: selectedNivel || undefined,
				keywords: selectedPalabraClave || undefined,
			});
			lecciones = data.results ?? data;
			count = data.count ?? lecciones.length;
			page = targetPage;
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch lecciones:', e);
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		load(1);
	}

	function formatDate(iso) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>Lecciones Educativas — Trayectorias Afro</title>
</svelte:head>

<div class="container mt-4">
	<div class="lessons-hero mb-5 text-center">
		<h1 class="display-5 mb-3">Lecciones Educativas</h1>
		<p class="lead hero-sub mb-0">
			Recursos educativos elaborados a partir de la investigación en Trayectorias Afro.
		</p>
	</div>

	{#if canCreate}
		<div class="d-flex justify-content-end mb-3">
			<a href="/User/catalogar/leccion" class="btn btn-primary">
				<i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Nueva lección
			</a>
		</div>
	{/if}

	<form class="row g-3 align-items-end mb-4 lessons-filters" on:submit|preventDefault={applyFilters}>
		<div class="col-sm-4">
			<label class="form-label" for="filter-nivel">Nivel</label>
			<select id="filter-nivel" class="form-select" bind:value={selectedNivel} on:change={applyFilters}>
				<option value="">Todos los niveles</option>
				{#each niveles as nivel}
					<option value={nivel.nivel_id}>{nivel.nivel}</option>
				{/each}
			</select>
		</div>
		<div class="col-sm-4">
			<label class="form-label" for="filter-palabra-clave">Palabra clave</label>
			<select id="filter-palabra-clave" class="form-select" bind:value={selectedPalabraClave} on:change={applyFilters}>
				<option value="">Todas las palabras clave</option>
				{#each palabrasClave as palabra}
					<option value={palabra.palabra_clave_id}>{palabra.palabra_clave}</option>
				{/each}
			</select>
		</div>
		<div class="col-sm-4">
			<label class="form-label" for="filter-ordering">Ordenar por</label>
			<select id="filter-ordering" class="form-select" bind:value={ordering} on:change={applyFilters}>
				<option value="title">Título (A–Z)</option>
				<option value="-title">Título (Z–A)</option>
				<option value="-created_at">Más recientes</option>
				<option value="created_at">Más antiguas</option>
			</select>
		</div>
	</form>

	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if loading}
		<div class="text-center py-5">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Cargando lecciones…</span>
			</div>
		</div>
	{:else if lecciones.length === 0}
		<p class="text-center py-5">No se encontraron lecciones con los filtros seleccionados.</p>
	{:else}
		<div class="row g-4">
			{#each lecciones as leccion}
				<div class="col-md-6 col-lg-4">
					<article class="lesson-card h-100">
						<a class="lesson-card-link" href="/lessons/{leccion.leccion_id}">
							<h2 class="lesson-card-title">{leccion.title}</h2>
						</a>
						{#if !leccion.is_published}
							<span class="badge lesson-draft-badge mb-2">Borrador</span>
						{/if}
						<p class="lesson-card-date">
							<i class="bi bi-calendar3 me-1" aria-hidden="true"></i>{formatDate(leccion.created_at)}
						</p>
						{#if leccion.levels?.length}
							<div class="lesson-card-badges mb-1">
								{#each leccion.levels as nivel}
									<span class="badge bg-primary me-1">{nivel.nivel}</span>
								{/each}
							</div>
						{/if}
						{#if leccion.keywords?.length}
							<div class="lesson-card-badges">
								{#each leccion.keywords as palabra}
									<span class="badge bg-secondary me-1">{palabra.palabra_clave}</span>
								{/each}
							</div>
						{/if}
						<a class="btn btn-outline-primary btn-sm mt-3" href="/lessons/{leccion.leccion_id}">
							Leer lección<span class="visually-hidden"> {leccion.title}</span>
						</a>
					</article>
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<nav class="d-flex justify-content-center align-items-center gap-3 mt-5" aria-label="Paginación de lecciones">
				<button class="btn btn-outline-secondary" disabled={page <= 1} on:click={() => load(page - 1)}>
					<i class="bi bi-chevron-left me-1" aria-hidden="true"></i>Anterior
				</button>
				<span>Página {page} de {totalPages}</span>
				<button class="btn btn-outline-secondary" disabled={page >= totalPages} on:click={() => load(page + 1)}>
					Siguiente<i class="bi bi-chevron-right ms-1" aria-hidden="true"></i>
				</button>
			</nav>
		{/if}
	{/if}
</div>
