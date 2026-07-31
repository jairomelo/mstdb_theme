<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fetchLeccion, deleteLeccion } from '$lib/api.js';
	import { hasPerm } from '$lib/stores/user';
	import ConfirmDelete from '$lib/components/hub/ConfirmDelete.svelte';

	export let data;
	const leccionId = data.id;

	let leccion = null;
	let error = null;
	let loading = true;

	let confirmOpen = false;
	let deleting = false;
	let deleteError = null;

	onMount(async () => {
		try {
			leccion = await fetchLeccion(leccionId);
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch leccion:', e);
		} finally {
			loading = false;
		}
	});

	// Persona is polymorphic (PersonaEsclavizada/PersonaNoEsclavizada); ctype 25 is the esclavizada id in this DB.
	function personaDetailPath(persona) {
		const ct = persona.polymorphic_ctype;
		const isEsclavizada = ct === 25 || (typeof ct === 'string' && ct.includes('esclavizada'));
		return isEsclavizada ? 'personaesclavizada' : 'personanoesclavizada';
	}

	function formatDate(iso) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	async function handleDelete() {
		deleting = true;
		deleteError = null;
		try {
			await deleteLeccion(leccionId);
			goto('/User/catalogar/leccion');
		} catch (e) {
			deleteError = e.message ?? 'No se pudo eliminar la lección.';
			deleting = false;
			confirmOpen = false;
		}
	}
</script>

<svelte:head>
	<title>{leccion ? `${leccion.title} — Panel — Trayectorias Afro` : 'Lección — Panel — Trayectorias Afro'}</title>
</svelte:head>

<div class="container mt-4">
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
			<li class="breadcrumb-item"><a href="/User/catalogar/leccion">Lecciones</a></li>
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
		{#if deleteError}
			<div class="alert alert-danger" role="alert">{deleteError}</div>
		{/if}

		<div class="card mb-4">
			<div class="card-header bg-primary text-white d-flex align-items-center justify-content-between flex-wrap gap-2">
				<h1 class="card-title mb-0 h4">{leccion.title}</h1>
				<div class="d-flex gap-2">
					<a href="/lessons/{leccionId}" class="btn btn-sm btn-outline-light">
						<i class="bi bi-eye me-1"></i>Ver página pública
					</a>
					{#if $hasPerm('dbgestor.change_leccion')}
						<a href="/User/catalogar/leccion/{leccionId}/edit" class="btn btn-sm btn-outline-light">
							<i class="bi bi-pencil-square me-1"></i>Editar
						</a>
					{/if}
					{#if $hasPerm('dbgestor.delete_leccion')}
						<button type="button" class="btn btn-sm btn-outline-danger" on:click={() => (confirmOpen = true)}>
							<i class="bi bi-trash me-1"></i>Eliminar
						</button>
					{/if}
				</div>
			</div>
			<div class="card-body">
				<p class="text-muted">
					<i class="bi bi-calendar3 me-1" aria-hidden="true"></i>Creada el {formatDate(leccion.created_at)}
					· Actualizada el {formatDate(leccion.updated_at)}
				</p>

				{#if leccion.levels?.length || leccion.keywords?.length}
					<div class="mb-3">
						{#each leccion.levels as nivel}<span class="badge bg-primary me-1">{nivel.nivel}</span>{/each}
						{#each leccion.keywords as palabra}<span class="badge bg-secondary me-1">{palabra.palabra_clave}</span>{/each}
					</div>
				{/if}

				<div class="lesson-detail-body">
					{@html leccion.body}
				</div>

				{#if leccion.imagenes?.length}
					<section class="mt-4" aria-label="Imágenes de la lección">
						<h2 class="h6">Imágenes ({leccion.imagenes.length})</h2>
						<div class="row g-3">
							{#each leccion.imagenes as imagen}
								<div class="col-sm-3">
									<img src={imagen.imagen} alt="Imagen de la lección {leccion.title}" class="img-fluid rounded" />
								</div>
							{/each}
						</div>
					</section>
				{/if}

				{#if leccion.personas?.length || leccion.documentos?.length || leccion.corporaciones?.length}
					<section class="mt-4">
						<h2 class="h6">Entidades relacionadas</h2>
						{#if leccion.personas?.length}
							<h3 class="h6 text-muted">Personas</h3>
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
							<h3 class="h6 text-muted">Documentos</h3>
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
							<h3 class="h6 text-muted">Corporaciones</h3>
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
			</div>
		</div>
	{/if}
</div>

<ConfirmDelete
	bind:open={confirmOpen}
	message={`¿Eliminar la lección "${leccion?.title}"? Esta acción no se puede deshacer.`}
	confirmLabel="Eliminar lección"
	loading={deleting}
	on:confirm={handleDelete}
	on:cancel={() => (confirmOpen = false)}
/>
