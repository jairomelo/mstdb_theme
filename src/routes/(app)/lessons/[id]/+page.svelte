<script>
	import { onMount } from 'svelte';
	import { fetchLeccion, whoami } from '$lib/api.js';

	export let data;

	let leccion = null;
	let error = null;
	let loading = true;
	let canEdit = false;

	onMount(async () => {
		whoami().then((u) => { canEdit = u?.is_staff || u?.groups?.includes('colectores'); }).catch(() => {});
		try {
			leccion = await fetchLeccion(data.id);
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch leccion:', e);
		} finally {
			loading = false;
		}
	});

	function personaDetailPath(persona) {
		const ct = persona.polymorphic_ctype;
		const isEsclavizada = ct === 25 || (typeof ct === 'string' && ct.includes('esclavizada'));
		return isEsclavizada ? 'personaesclavizada' : 'personanoesclavizada';
	}

	function formatDate(iso) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>{leccion ? `${leccion.title} — Lecciones Educativas — Trayectorias Afro` : 'Lecciones Educativas — Trayectorias Afro'}</title>
</svelte:head>

<div class="container mt-4">
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="/lessons">Lecciones Educativas</a></li>
			<li class="breadcrumb-item active" aria-current="page">{leccion?.title ?? 'Lección'}</li>
		</ol>
	</nav>

	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if loading}
		<div class="text-center py-5">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Cargando lección…</span>
			</div>
		</div>
	{:else if leccion}
		<article class="lesson-detail">
			<div class="d-flex align-items-start justify-content-between gap-2 mb-3">
				<h1 class="mb-0">{leccion.title}</h1>
				{#if canEdit}
					<a href="/User/catalogar/leccion/{data.id}/edit" class="btn btn-sm btn-outline-primary flex-shrink-0">
						<i class="bi bi-pencil-square me-1" aria-hidden="true"></i>Editar
					</a>
				{/if}
			</div>

			<p class="lesson-detail-date text-muted">
				<i class="bi bi-calendar3 me-1" aria-hidden="true"></i>Publicada el {formatDate(leccion.created_at)}
			</p>

			{#if leccion.levels?.length || leccion.keywords?.length}
				<div class="lesson-detail-badges mb-4">
					{#each leccion.levels as nivel}
						<span class="badge bg-primary me-1">{nivel.nivel}</span>
					{/each}
					{#each leccion.keywords as palabra}
						<span class="badge bg-secondary me-1">{palabra.palabra_clave}</span>
					{/each}
				</div>
			{/if}

			<div class="lesson-detail-body">
				{@html leccion.body}
			</div>

			{#if leccion.imagenes?.length}
				<section class="lesson-detail-gallery mt-4" aria-label="Galería de imágenes de la lección">
					<h2 class="h5">Imágenes</h2>
					<div class="row g-3">
						{#each leccion.imagenes as imagen}
							<div class="col-sm-4">
								<img src={imagen.imagen} alt="Imagen de la lección {leccion.title}" class="img-fluid rounded" />
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if leccion.personas?.length || leccion.documentos?.length || leccion.corporaciones?.length}
				<section class="lesson-detail-related mt-4">
					<h2 class="h5">Entidades relacionadas</h2>
					{#if leccion.personas?.length}
						<h3 class="h6">Personas</h3>
						<ul>
							{#each leccion.personas as persona}
								<li>
									<a href="/Detail/{personaDetailPath(persona)}/{persona.persona_id}">
										{persona.nombre_normalizado ?? persona.persona_idno}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
					{#if leccion.documentos?.length}
						<h3 class="h6">Documentos</h3>
						<ul>
							{#each leccion.documentos as documento}
								<li>
									<a href="/Detail/documento/{documento.documento_id}">
										{documento.titulo ?? documento.documento_idno}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
					{#if leccion.corporaciones?.length}
						<h3 class="h6">Corporaciones</h3>
						<ul>
							{#each leccion.corporaciones as corporacion}
								<li>
									<a href="/Detail/corporacion/{corporacion.corporacion_id}">
										{corporacion.nombre_institucion}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/if}
		</article>
	{/if}
</div>
