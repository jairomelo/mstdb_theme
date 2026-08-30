<script>
	import { onMount } from 'svelte';
	import { fetchLeccion, updateLeccion, uploadLeccionImagen } from '$lib/api.js';
	import { user } from '$lib/stores/user';
	import LeccionForm from '$lib/components/forms/LeccionForm.svelte';
	import LeccionColaboradores from '$lib/components/leccion/LeccionColaboradores.svelte';

	export let data;
	const leccionId = data.id;

	let leccion = null;
	let loading = true;
	let loadError = null;
	let permissionDenied = false;
	let submitting = false;
	let saved = false;
	let errors = {};
	let flash = null;
	let formRef;

	$: canPublish = leccion?.is_owner || $user?.is_staff;

	onMount(async () => {
		flash = sessionStorage.getItem('ta_flash');
		if (flash) sessionStorage.removeItem('ta_flash');
		try {
			leccion = await fetchLeccion(leccionId);
		} catch (e) {
			if (/40[34]/.test(e.message)) {
				permissionDenied = true;
			} else {
				loadError = e.message;
			}
			console.error('Failed to fetch leccion:', e);
		} finally {
			loading = false;
		}
	});

	async function handleImageUpload(file) {
		const imagen = await uploadLeccionImagen(leccionId, file);
		return imagen.imagen;
	}

	async function handleSave(event) {
		submitting = true;
		errors = {};
		saved = false;
		try {
			const updated = await updateLeccion(leccionId, event.detail);
			leccion = {
				...leccion,
				is_published: updated?.is_published ?? leccion.is_published,
				title: updated?.title ?? leccion.title
			};
			saved = true;
		} catch (e) {
			errors = e.data ?? { __all__: [e.message] };
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>Editar Lección Educativa</title></svelte:head>

<div class="container mt-4">
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
			<li class="breadcrumb-item"><a href="/User/catalogar/leccion/{leccionId}">Lección</a></li>
			<li class="breadcrumb-item active" aria-current="page">Editar</li>
		</ol>
	</nav>

	<h1 class="h3 mb-4">Editar Lección Educativa</h1>

	{#if permissionDenied}
		<div class="alert alert-warning" role="alert">
			<i class="bi bi-lock me-2" aria-hidden="true"></i>No tienes permiso para ver o editar esta
			lección. Si crees que deberías tener acceso, pide a una persona propietaria que te añada.
		</div>
		<a href="/lessons" class="btn btn-outline-secondary">Volver a lecciones</a>
	{:else if loadError}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {loadError}
		</div>
	{:else if loading}
		<div class="text-center py-5">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Cargando lección…</span>
			</div>
		</div>
	{:else if leccion}
		{#if flash}
			<div class="alert alert-success alert-dismissible fade show" role="status" aria-live="polite">
				<i class="bi bi-check-circle me-2" aria-hidden="true"></i>{flash}
				<button
					type="button"
					class="btn-close"
					aria-label="Cerrar aviso"
					on:click={() => (flash = null)}
				></button>
			</div>
		{/if}

		{#if saved}
			<div class="alert alert-success py-2" role="status">Cambios guardados.</div>
		{/if}

		{#if errors.__all__}
			<div class="alert alert-danger" role="alert">{errors.__all__.join(' ')}</div>
		{/if}

		<LeccionForm
			bind:this={formRef}
			{leccion}
			{leccionId}
			{canPublish}
			submitLabel="Guardar cambios"
			{submitting}
			{errors}
			onUploadImage={handleImageUpload}
			on:save={handleSave}
		>
			<svelte:fragment slot="actions">
				<a
					href="/User/catalogar/leccion/{leccionId}"
					target="_blank"
					rel="noopener"
					class="btn btn-outline-secondary"
				>
					<i class="bi bi-eye me-1" aria-hidden="true"></i>Vista previa
				</a>
				<a href="/User/catalogar/leccion/{leccionId}" class="btn btn-outline-secondary">Cancelar</a>
			</svelte:fragment>
		</LeccionForm>

		{#if !canPublish}
			<p class="form-text mt-3">
				<i class="bi bi-info-circle me-1" aria-hidden="true"></i>Solo las personas propietarias o el
				staff pueden publicar la lección; tu rol permite editar el contenido.
			</p>
		{/if}

		{#if canPublish}
			<div class="mt-4">
				<LeccionColaboradores {leccionId} accesos={leccion.accesos ?? []} />
			</div>
		{/if}
	{/if}
</div>
