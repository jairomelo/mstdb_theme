<script>
	import { onMount } from 'svelte';
	import { fetchLeccion } from '$lib/api.js';

	export let data;

	let leccion = null;
	let error = null;
	let loading = true;

	let showAllPersonas = false;
	let showAllDocumentos = false;
	let showAllCorporaciones = false;

	const COLLAPSE_LIMIT = 10;

	onMount(async () => {
		try {
			leccion = await fetchLeccion(data.id);
		} catch (e) {
			error = /40[34]/.test(e.message)
				? 'Esta lección no está disponible. Puede ser un borrador sin acceso para tu cuenta.'
				: e.message;
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

	$: hasSidebar = leccion?.personas?.length || leccion?.documentos?.length || leccion?.corporaciones?.length;
	$: visiblePersonas = showAllPersonas ? leccion?.personas : leccion?.personas?.slice(0, COLLAPSE_LIMIT);
	$: visibleDocumentos = showAllDocumentos ? leccion?.documentos : leccion?.documentos?.slice(0, COLLAPSE_LIMIT);
	$: visibleCorporaciones = showAllCorporaciones ? leccion?.corporaciones : leccion?.corporaciones?.slice(0, COLLAPSE_LIMIT);
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
		<div class="row">
			<!-- Main content -->
			<div class={hasSidebar ? 'col-lg-8' : 'col-12'}>
				<article class="lesson-detail">
					<div class="d-flex align-items-start justify-content-between gap-2 mb-3">
						<h1 class="mb-0">{leccion.title}</h1>
						{#if leccion.can_edit}
							<div class="d-flex gap-2 flex-shrink-0">
								<a href="/User/catalogar/leccion/{data.id}" class="btn btn-sm btn-outline-secondary">
									<i class="bi bi-gear me-1" aria-hidden="true"></i>Administrar
								</a>
								<a href="/User/catalogar/leccion/{data.id}/edit" class="btn btn-sm btn-outline-primary">
									<i class="bi bi-pencil-square me-1" aria-hidden="true"></i>Editar
								</a>
							</div>
						{/if}
					</div>

					{#if !leccion.is_published}
						<div class="alert alert-warning py-2" role="status">
							<i class="bi bi-pencil me-1" aria-hidden="true"></i>Esta lección es un borrador:
							solo las personas con acceso pueden verla.
						</div>
					{/if}

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
				</article>
			</div>

			<!-- Right sidebar: related entities -->
			{#if hasSidebar}
				<aside class="col-lg-4">
					<div class="lesson-sidebar">
						{#if leccion.personas?.length}
							<div class="sidebar-section mb-4">
								<h6 class="sidebar-section-title">
									<i class="bi bi-people me-1" aria-hidden="true"></i>Personas
									<span class="sidebar-section-count sidebar-section-count--persona">{leccion.personas.length}</span>
								</h6>
								<div class="sidebar-chips">
									{#each visiblePersonas as persona}
										<a href="/Detail/{personaDetailPath(persona)}/{persona.persona_id}"
										   class="sidebar-chip sidebar-chip--persona"
										   title={persona.nombre_normalizado ?? persona.persona_idno}>
											{persona.nombre_normalizado ?? persona.persona_idno}
										</a>
									{/each}
								</div>
								{#if leccion.personas.length > COLLAPSE_LIMIT}
									<button class="btn btn-sm btn-link sidebar-toggle"
											on:click={() => showAllPersonas = !showAllPersonas}>
										{showAllPersonas ? 'Ver menos' : `Ver todos (${leccion.personas.length})`}
									</button>
								{/if}
							</div>
						{/if}

						{#if leccion.documentos?.length}
							<div class="sidebar-section mb-4">
								<h6 class="sidebar-section-title">
									<i class="bi bi-file-earmark-text me-1" aria-hidden="true"></i>Documentos
									<span class="sidebar-section-count sidebar-section-count--documento">{leccion.documentos.length}</span>
								</h6>
								<div class="sidebar-chips">
									{#each visibleDocumentos as documento}
										<a href="/Detail/documento/{documento.documento_id}"
										   class="sidebar-chip sidebar-chip--documento"
										   title={documento.titulo ?? documento.documento_idno}>
											{documento.titulo ?? documento.documento_idno}
										</a>
									{/each}
								</div>
								{#if leccion.documentos.length > COLLAPSE_LIMIT}
									<button class="btn btn-sm btn-link sidebar-toggle"
											on:click={() => showAllDocumentos = !showAllDocumentos}>
										{showAllDocumentos ? 'Ver menos' : `Ver todos (${leccion.documentos.length})`}
									</button>
								{/if}
							</div>
						{/if}

						{#if leccion.corporaciones?.length}
							<div class="sidebar-section mb-4">
								<h6 class="sidebar-section-title">
									<i class="bi bi-building me-1" aria-hidden="true"></i>Corporaciones
									<span class="sidebar-section-count sidebar-section-count--corporacion">{leccion.corporaciones.length}</span>
								</h6>
								<div class="sidebar-chips">
									{#each visibleCorporaciones as corporacion}
										<a href="/Detail/corporacion/{corporacion.corporacion_id}"
										   class="sidebar-chip sidebar-chip--corporacion"
										   title={corporacion.nombre_institucion}>
											{corporacion.nombre_institucion}
										</a>
									{/each}
								</div>
								{#if leccion.corporaciones.length > COLLAPSE_LIMIT}
									<button class="btn btn-sm btn-link sidebar-toggle"
											on:click={() => showAllCorporaciones = !showAllCorporaciones}>
										{showAllCorporaciones ? 'Ver menos' : `Ver todos (${leccion.corporaciones.length})`}
									</button>
								{/if}
							</div>
						{/if}
					</div>
				</aside>
			{/if}
		</div>
	{/if}
</div>
