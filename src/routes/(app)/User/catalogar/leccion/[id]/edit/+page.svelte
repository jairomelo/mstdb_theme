<script>
	import { onMount } from 'svelte';
	import { fetchLeccion, updateLeccion, uploadLeccionImagen } from '$lib/api.js';
	import FormField from '$lib/components/forms/FormField.svelte';
	import MultiSelect from '$lib/components/forms/MultiSelect.svelte';
	import RichTextEditor from '$lib/components/forms/RichTextEditor.svelte';

	export let data;
	const leccionId = data.id;

	let title = '';
	let body = '';
	let levels = [];
	let keywords = [];
	let personasEsclavizadas = [];
	let personasNoEsclavizadas = [];
	let documentos = [];
	let corporaciones = [];

	let loading = true;
	let loadError = null;
	let submitting = false;
	let saved = false;
	let errors = {};
	let editorRef;

	// Persona is polymorphic (PersonaEsclavizada/PersonaNoEsclavizada); ctype 25 is the esclavizada id in this DB.
	function isEsclavizada(persona) {
		const ct = persona.polymorphic_ctype;
		return ct === 25 || (typeof ct === 'string' && ct.includes('esclavizada'));
	}

	function fieldError(field) {
		const e = errors[field];
		return Array.isArray(e) ? e.join(' ') : (e ?? null);
	}

	onMount(async () => {
		try {
			const leccion = await fetchLeccion(leccionId);
			title = leccion.title;
			body = leccion.body ?? '';
			levels = (leccion.levels ?? []).map((l) => ({ value: l.nivel_id, label: l.nivel }));
			keywords = (leccion.keywords ?? []).map((k) => ({ value: k.palabra_clave_id, label: k.palabra_clave }));
			personasEsclavizadas = (leccion.personas ?? [])
				.filter(isEsclavizada)
				.map((p) => ({ value: p.persona_id, label: p.nombre_normalizado ?? p.persona_idno }));
			personasNoEsclavizadas = (leccion.personas ?? [])
				.filter((p) => !isEsclavizada(p))
				.map((p) => ({ value: p.persona_id, label: p.nombre_normalizado ?? p.persona_idno }));
			documentos = (leccion.documentos ?? []).map((d) => ({ value: d.documento_id, label: d.titulo ?? d.documento_idno }));
			corporaciones = (leccion.corporaciones ?? []).map((c) => ({ value: c.corporacion_id, label: c.nombre_institucion }));
		} catch (e) {
			loadError = e.message;
			console.error('Failed to fetch leccion:', e);
		} finally {
			loading = false;
		}
	});

	async function handleImageUpload(file) {
		const imagen = await uploadLeccionImagen(leccionId, file);
		return imagen.imagen;
	}

	async function handleSubmit() {
		submitting = true;
		errors = {};
		saved = false;
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
			await updateLeccion(leccionId, payload);
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

	{#if loadError}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {loadError}
		</div>
	{:else if loading}
		<div class="text-center py-5">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Cargando lección…</span>
			</div>
		</div>
	{:else}
		{#if saved}
			<div class="alert alert-success" role="alert">
				<div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
					<span>Cambios guardados.</span>
					<div class="d-flex gap-2 flex-wrap">
						<a href="/User/catalogar/leccion/{leccionId}" class="btn btn-sm btn-outline-success">
							<i class="bi bi-arrow-left me-1"></i>Volver al panel
						</a>
						<a href="/lessons/{leccionId}" class="btn btn-sm btn-outline-success">
							<i class="bi bi-eye me-1"></i>Ver lección
						</a>
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
								onUploadImage={handleImageUpload}
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
					Guardar cambios
				</button>
				<a href="/User/catalogar/leccion/{leccionId}" class="btn btn-outline-secondary">Cancelar</a>
			</div>
		</form>
	{/if}
</div>
