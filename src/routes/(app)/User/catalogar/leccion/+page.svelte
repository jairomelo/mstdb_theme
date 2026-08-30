<script>
	import { goto } from '$app/navigation';
	import { createLeccion, updateLeccion, uploadLeccionImagen } from '$lib/api.js';
	import LeccionForm from '$lib/components/forms/LeccionForm.svelte';

	let submitting = false;
	let errors = {};
	let formRef;
	// Set the moment an image upload silently creates the draft, so later
	// saves update it instead of creating a duplicate lesson.
	let leccionId = null;

	// Lets users add images before the explicit "save" click: the first
	// upload silently creates the draft lesson so it has an id to attach to.
	async function handleImageUpload(file) {
		if (!leccionId) {
			const payload = formRef.buildPayload();
			if (!payload.title?.trim()) {
				throw new Error('Escribe un título antes de subir imágenes.');
			}
			const created = await createLeccion({ ...payload, is_published: false });
			leccionId = created.leccion_id;
		}
		const imagen = await uploadLeccionImagen(leccionId, file);
		return imagen.imagen;
	}

	async function handleSave(event) {
		submitting = true;
		errors = {};
		try {
			const payload = { ...event.detail, is_published: false };
			const result = leccionId
				? await updateLeccion(leccionId, payload)
				: await createLeccion(payload);
			const id = leccionId ?? result.leccion_id;
			sessionStorage.setItem(
				'ta_flash',
				'Borrador guardado. Continúa editando y publica cuando esté lista.'
			);
			goto(`/User/catalogar/leccion/${id}/edit`);
		} catch (e) {
			errors = e.data ?? { __all__: [e.message] };
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>Nueva Lección Educativa</title></svelte:head>

<div class="container mt-4">
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
			<li class="breadcrumb-item active" aria-current="page">Nueva Lección Educativa</li>
		</ol>
	</nav>

	<h1 class="h3 mb-4">Nueva Lección Educativa</h1>

	{#if errors.__all__}
		<div class="alert alert-danger" role="alert">{errors.__all__.join(' ')}</div>
	{/if}

	<LeccionForm
		bind:this={formRef}
		submitLabel="Guardar borrador"
		{submitting}
		{errors}
		{leccionId}
		onUploadImage={handleImageUpload}
		on:save={handleSave}
	/>
</div>
