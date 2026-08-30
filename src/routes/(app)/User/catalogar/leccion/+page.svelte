<script>
	import { goto } from '$app/navigation';
	import { createLeccion, uploadLeccionImagen } from '$lib/api.js';
	import LeccionForm from '$lib/components/forms/LeccionForm.svelte';

	let submitting = false;
	let errors = {};
	let formRef;

	async function handleSave(event) {
		submitting = true;
		errors = {};
		try {
			const created = await createLeccion({ ...event.detail, is_published: false });
			sessionStorage.setItem(
				'ta_flash',
				'Borrador guardado. Continúa editando y publica cuando esté lista.'
			);
			goto(`/User/catalogar/leccion/${created.leccion_id}/edit`);
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
		on:save={handleSave}
	/>
</div>
