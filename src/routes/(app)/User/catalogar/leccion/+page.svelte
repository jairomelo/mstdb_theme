<script>
	import { createLeccion, updateLeccion, uploadLeccionImagen } from '$lib/api.js';
	import FormField from '$lib/components/forms/FormField.svelte';
	import MultiSelect from '$lib/components/forms/MultiSelect.svelte';
	import RichTextEditor from '$lib/components/forms/RichTextEditor.svelte';

	let title = '';
	let body = '';
	let levels = [];
	let keywords = [];
	let personasEsclavizadas = [];
	let personasNoEsclavizadas = [];
	let documentos = [];
	let corporaciones = [];

	let leccionId = null;
	let submitting = false;
	let created = null;
	let errors = {};
	let editorRef;

	function fieldError(field) {
		const e = errors[field];
		return Array.isArray(e) ? e.join(' ') : (e ?? null);
	}

	async function handleImageUpload(file) {
		const imagen = await uploadLeccionImagen(leccionId, file);
		return imagen.imagen;
	}

	async function handleSubmit() {
		submitting = true;
		errors = {};
		try {
			const payload = {
				title,
				body,
				levels: levels.map((l) => l.value),
				keywords: keywords.map((k) => k.value),
				personas: [...personasEsclavizadas, ...personasNoEsclavizadas].map((p) => p.value),
				documentos: documentos.map((d) => d.value),
				corporaciones: corporaciones.map((c) => c.value),
			};
			created = leccionId ? await updateLeccion(leccionId, payload) : await createLeccion(payload);
			leccionId = created.leccion_id;
		} catch (e) {
			errors = e.data ?? { __all__: [e.message] };
		} finally {
			submitting = false;
		}
	}

	function reset() {
		title = '';
		body = '';
		levels = [];
		keywords = [];
		personasEsclavizadas = [];
		personasNoEsclavizadas = [];
		documentos = [];
		corporaciones = [];
		leccionId = null;
		created = null;
		errors = {};
		editorRef?.setContent('');
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

	{#if created}
		<div class="alert alert-success" role="alert">
			<div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
				<span
					>Lección guardada: <strong>{created.title}</strong></span
				>
				<div class="d-flex gap-2 flex-wrap">
					<a href="/lessons/{created.leccion_id}" class="btn btn-sm btn-outline-success">
						<i class="bi bi-eye me-1"></i>Ver lección
					</a>
					<button type="button" class="btn btn-sm btn-outline-success" on:click={reset}>Crear otra</button>
				</div>
			</div>
		</div>
	{/if}

	{#if errors.__all__}
		<div class="alert alert-danger" role="alert">{errors.__all__.join(' ')}</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} novalidate>
		<section class="card mb-4">
			<div class="card-header fw-semibold">Contenido</div>
			<div class="card-body row g-3">
				<div class="col-12">
					<FormField label="Título" id="title" required error={fieldError('title')}>
						<input
							id="title"
							class="form-control"
							class:is-invalid={fieldError('title')}
							bind:value={title}
							required
						/>
					</FormField>
				</div>
				<div class="col-12">
					<FormField label="Contenido" id="body" error={fieldError('body')}>
						<RichTextEditor
							bind:this={editorRef}
							id="body"
							bind:content={body}
							placeholder="Escriba el contenido de la lección…"
							onUploadImage={leccionId ? handleImageUpload : null}
							disabledHint="Guarde la lección primero para poder subir imágenes."
						/>
					</FormField>
				</div>
			</div>
		</section>

		<section class="card mb-4">
			<div class="card-header fw-semibold">Clasificación</div>
			<div class="card-body row g-3">
				<div class="col-md-6">
					<FormField label="Niveles" id="levels" error={fieldError('levels')}>
						<MultiSelect
							id="levels"
							bind:values={levels}
							endpoint="vocabularios/niveles-leccion/"
							placeholder="Buscar nivel…"
						/>
					</FormField>
				</div>
				<div class="col-md-6">
					<FormField label="Palabras clave" id="keywords" error={fieldError('keywords')}>
						<MultiSelect
							id="keywords"
							bind:values={keywords}
							endpoint="vocabularios/palabras-clave-leccion/"
							placeholder="Buscar palabra clave…"
						/>
					</FormField>
				</div>
			</div>
		</section>

		<section class="card mb-4">
			<div class="card-header fw-semibold">Entidades relacionadas</div>
			<div class="card-body row g-3">
				<div class="col-md-6">
					<FormField label="Personas esclavizadas" id="personas-esc" error={fieldError('personas')}>
						<MultiSelect
							id="personas-esc"
							bind:values={personasEsclavizadas}
							endpoint="personas-esclavizadas/"
							placeholder="Buscar persona esclavizada…"
						/>
					</FormField>
				</div>
				<div class="col-md-6">
					<FormField label="Personas no esclavizadas" id="personas-no-esc" error={fieldError('personas')}>
						<MultiSelect
							id="personas-no-esc"
							bind:values={personasNoEsclavizadas}
							endpoint="personas-no-esclavizadas/"
							placeholder="Buscar persona no esclavizada…"
						/>
					</FormField>
				</div>
				<div class="col-md-6">
					<FormField label="Documentos" id="documentos" error={fieldError('documentos')}>
						<MultiSelect id="documentos" bind:values={documentos} endpoint="documentos/" placeholder="Buscar documento…" />
					</FormField>
				</div>
				<div class="col-md-6">
					<FormField label="Corporaciones" id="corporaciones" error={fieldError('corporaciones')}>
						<MultiSelect
							id="corporaciones"
							bind:values={corporaciones}
							endpoint="corporaciones/"
							placeholder="Buscar corporación…"
						/>
					</FormField>
				</div>
			</div>
		</section>

		<div class="d-flex gap-2">
			<button type="submit" class="btn btn-primary" disabled={submitting}>
				{#if submitting}<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>{/if}
				{leccionId ? 'Actualizar lección' : 'Guardar lección'}
			</button>
			<button type="button" class="btn btn-outline-secondary" on:click={reset}>Limpiar</button>
		</div>
	</form>
</div>
