<script>
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/forms/FormField.svelte';
	import MultiSelect from '$lib/components/forms/MultiSelect.svelte';
	import RichTextEditor from '$lib/components/forms/RichTextEditor.svelte';

	/** Existing lesson to hydrate the form with (null when creating). */
	export let leccion = null;
	/** Set once the lesson exists (needed for image uploads). */
	export let leccionId = null;
	/** Owner/staff only: shows the publish status control. */
	export let canPublish = false;
	export let errors = {};
	export let submitting = false;
	export let submitLabel = 'Guardar lección';
	/** async (file) => url; null disables image upload. */
	export let onUploadImage = null;
	/** async (file) => url; null disables PDF upload. */
	export let onUploadPdf = null;
	export let disabledHint = '';

	const dispatch = createEventDispatcher();

	let title = '';
	let body = '';
	let isPublished = false;
	let levels = [];
	let keywords = [];
	let personasEsclavizadas = [];
	let personasNoEsclavizadas = [];
	let documentos = [];
	let corporaciones = [];
	let editorRef;
	let hydrated = false;

	// Persona is polymorphic (PersonaEsclavizada/PersonaNoEsclavizada); ctype 25 is
	// the esclavizada id in this DB.
	function isEsclavizada(persona) {
		const ct = persona.polymorphic_ctype;
		return ct === 25 || (typeof ct === 'string' && ct.includes('esclavizada'));
	}

	function hydrate(src) {
		title = src.title ?? '';
		body = src.body ?? '';
		isPublished = !!src.is_published;
		levels = (src.levels ?? []).map((l) => ({ value: l.nivel_id, label: l.nivel }));
		keywords = (src.keywords ?? []).map((k) => ({
			value: k.palabra_clave_id,
			label: k.palabra_clave
		}));
		personasEsclavizadas = (src.personas ?? [])
			.filter(isEsclavizada)
			.map((p) => ({ value: p.persona_id, label: p.nombre_normalizado ?? p.persona_idno }));
		personasNoEsclavizadas = (src.personas ?? [])
			.filter((p) => !isEsclavizada(p))
			.map((p) => ({ value: p.persona_id, label: p.nombre_normalizado ?? p.persona_idno }));
		documentos = (src.documentos ?? []).map((d) => ({
			value: d.documento_id,
			label: d.titulo ?? d.documento_idno
		}));
		corporaciones = (src.corporaciones ?? []).map((c) => ({
			value: c.corporacion_id,
			label: c.nombre_institucion
		}));
	}

	$: if (leccion && !hydrated) {
		hydrate(leccion);
		hydrated = true;
	}

	function fieldError(field) {
		const e = errors[field];
		return Array.isArray(e) ? e.join(' ') : (e ?? null);
	}

	export function buildPayload() {
		const payload = {
			title,
			body,
			levels: levels.map((l) => l.value),
			keywords: keywords.map((k) => k.value),
			personas: [...personasEsclavizadas, ...personasNoEsclavizadas].map((p) => p.value),
			documentos: documentos.map((d) => d.value),
			corporaciones: corporaciones.map((c) => c.value)
		};
		if (leccionId && canPublish) payload.is_published = isPublished;
		return payload;
	}

	export function getEditor() {
		return editorRef;
	}

	function handleSubmit() {
		dispatch('save', buildPayload());
	}
</script>

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
						{onUploadImage}
						{onUploadPdf}
						{disabledHint}
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
				<FormField
					label="Personas no esclavizadas"
					id="personas-no-esc"
					error={fieldError('personas')}
				>
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
					<MultiSelect
						id="documentos"
						bind:values={documentos}
						endpoint="documentos/"
						placeholder="Buscar documento…"
					/>
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

	{#if leccionId && canPublish}
		<fieldset class="card mb-4">
			<div class="card-header fw-semibold">Estado de publicación</div>
			<div class="card-body">
				<legend class="visually-hidden">Estado de publicación</legend>
				<div class="form-check form-switch">
					<input
						id="is-published"
						class="form-check-input"
						type="checkbox"
						bind:checked={isPublished}
					/>
					<label class="form-check-label" for="is-published">
						{#if isPublished}Publicada (visible en el sitio público){:else}Borrador (visible solo
							para personas con acceso){/if}
					</label>
				</div>
				{#if fieldError('is_published')}
					<div class="invalid-feedback d-block">{fieldError('is_published')}</div>
				{/if}
			</div>
		</fieldset>
	{/if}

	<div class="d-flex gap-2 flex-wrap align-items-center">
		<button type="submit" class="btn btn-primary" disabled={submitting}>
			{#if submitting}<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"
				></span>{/if}
			{submitLabel}
		</button>
		<slot name="actions" />
	</div>
</form>
