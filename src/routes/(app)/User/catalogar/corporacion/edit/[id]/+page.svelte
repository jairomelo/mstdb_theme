<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { corporaciones, updateCorporacion, whoami } from '$lib/api';
	import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';
	import MultiSelect from '$lib/components/forms/MultiSelect.svelte';
	import FormField from '$lib/components/forms/FormField.svelte';
	import { loginUrl } from '$lib/auth';

	export let data;

	let me = null;
	let corp = null;
	let loadError = null;

	let nombre_institucion = '';
	let tipo_institucion = null; // { value: id, label: string }
	let nombres_alternativos = '';
	let lugar_corporacion = null; // { value: id, label: string }
	let documentos = []; // [{ value, label }]
	let personas_asociadas = []; // [{ value, label }]
	let notas = '';

	let saving = false;
	let saveError = null;
	let saveSuccess = false;
	let formErrors = {};

	onMount(async () => {
		if (!browser) return;
		try {
			me = await whoami();
			const allowed = me?.is_staff || me?.groups?.includes('colectores');
			if (!allowed) {
				goto(loginUrl());
				return;
			}
		} catch {
			goto(loginUrl());
			return;
		}
		try {
			corp = await corporaciones(data.id);
			populateForm();
		} catch (e) {
			loadError = e.message ?? 'No se pudo cargar la corporación.';
		}
	});

	function populateForm() {
		nombre_institucion = corp.nombre_institucion ?? '';
		nombres_alternativos = corp.nombres_alternativos ?? '';
		notas = corp.notas ?? '';
		tipo_institucion =
			corp.tipo_institucion_id != null
				? { value: corp.tipo_institucion_id, label: corp.tipo_institucion_nombre ?? '' }
				: null;
		lugar_corporacion =
			corp.lugar_corporacion != null
				? { value: corp.lugar_corporacion.lugar_id, label: corp.lugar_corporacion.nombre_lugar }
				: null;
		documentos = (corp.documentos ?? []).map((d) => ({
			value: d.documento_id,
			label: [d.documento_idno, d.titulo].filter(Boolean).join(' — ')
		}));
		personas_asociadas = (corp.personas_asociadas ?? []).map((p) => ({
			value: p.persona_id,
			label: p.nombre_normalizado ?? `P${p.persona_id}`
		}));
	}

	async function handleSave() {
		formErrors = {};
		saveError = null;
		saveSuccess = false;
		saving = true;
		try {
			const payload = {
				nombre_institucion,
				tipo_institucion: tipo_institucion?.value ?? null,
				nombres_alternativos: nombres_alternativos || null,
				lugar_corporacion: lugar_corporacion?.value ?? null,
				documentos: documentos.map((d) => d.value),
				personas_asociadas: personas_asociadas.map((p) => p.value),
				notas: notas || null
			};
			await updateCorporacion(data.id, payload);
			corp = await corporaciones(data.id);
			populateForm();
			saveSuccess = true;
		} catch (e) {
			if (e.data) {
				formErrors = e.data;
				saveError = 'Corrige los errores del formulario.';
			} else {
				saveError = 'Error al guardar los cambios.';
			}
		} finally {
			saving = false;
		}
	}

	function fieldError(field) {
		const e = formErrors[field];
		return Array.isArray(e) ? e.join(' ') : (e ?? null);
	}
</script>

<svelte:head>
	<title
		>{corp ? `Editar — ${corp.nombre_institucion}` : 'Editar corporación'} — Trayectorias Afro</title
	>
</svelte:head>

<div class="container-fluid mt-3">
	<nav aria-label="breadcrumb" class="mb-3">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
			<li class="breadcrumb-item">
				<a href="/Detail/corporacion/{data.id}">
					{corp?.nombre_institucion ?? `Corporación ${data.id}`}
				</a>
			</li>
			<li class="breadcrumb-item active" aria-current="page">Editar</li>
		</ol>
	</nav>

	{#if loadError}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>{loadError}
		</div>
	{:else if !corp}
		<div class="d-flex justify-content-center py-5">
			<span class="spinner-border text-danger" role="status">
				<span class="visually-hidden">Cargando…</span>
			</span>
		</div>
	{:else}
		<div class="d-flex align-items-center justify-content-between mb-3">
			<h1 class="h4 mb-0">
				<i class="bi bi-building me-2"></i>Editar corporación
				<span class="text-muted fw-normal">— {corp.nombre_institucion}</span>
			</h1>
			<a href="/Detail/corporacion/{data.id}" class="btn btn-sm btn-outline-secondary">
				<i class="bi bi-arrow-left me-1"></i>Ver detalle
			</a>
		</div>

		{#if saveSuccess}
			<div class="alert alert-success alert-dismissible py-2 mb-3" role="alert">
				<i class="bi bi-check-circle-fill me-2"></i>Cambios guardados correctamente.
				<button
					type="button"
					class="btn-close"
					aria-label="Cerrar"
					on:click={() => (saveSuccess = false)}
				></button>
			</div>
		{/if}
		{#if saveError}
			<div class="alert alert-danger alert-dismissible py-2 mb-3" role="alert">
				<i class="bi bi-exclamation-triangle-fill me-2"></i>{saveError}
				<button
					type="button"
					class="btn-close"
					aria-label="Cerrar"
					on:click={() => (saveError = null)}
				></button>
			</div>
		{/if}

		<div class="row g-3">
			<div class="col-lg-7">
				<div class="card">
					<div class="card-header fw-semibold">
						<i class="bi bi-pencil-square me-1"></i>Datos de la corporación
					</div>
					<div class="card-body">
						<form on:submit|preventDefault={handleSave} novalidate>
							<FormField
								label="Nombre de la institución"
								id="nombre_institucion"
								required
								error={fieldError('nombre_institucion')}
							>
								<input
									id="nombre_institucion"
									class="form-control"
									class:is-invalid={fieldError('nombre_institucion')}
									bind:value={nombre_institucion}
									required
									maxlength="100"
								/>
							</FormField>

							<FormField
								label="Tipo de institución"
								id="tipo_institucion"
								required
								error={fieldError('tipo_institucion')}
							>
								<SearchableSelect
									id="tipo_institucion"
									bind:value={tipo_institucion}
									endpoint="vocabularios/tipos-institucion/"
									placeholder="Buscar tipo…"
								/>
							</FormField>

							<FormField
								label="Nombres alternativos"
								id="nombres_alternativos"
								error={fieldError('nombres_alternativos')}
								hint="Variantes o nombres históricos de la institución"
							>
								<textarea
									id="nombres_alternativos"
									class="form-control"
									rows="2"
									bind:value={nombres_alternativos}
								></textarea>
							</FormField>

							<FormField
								label="Lugar"
								id="lugar_corporacion"
								error={fieldError('lugar_corporacion')}
							>
								<SearchableSelect
									id="lugar_corporacion"
									bind:value={lugar_corporacion}
									endpoint="lugares/"
									placeholder="Buscar lugar…"
								/>
							</FormField>

							<FormField label="Documentos" id="documentos" error={fieldError('documentos')}>
								<MultiSelect
									id="documentos"
									bind:values={documentos}
									endpoint="documentos/"
									placeholder="Buscar documento…"
								/>
							</FormField>

							<FormField
								label="Personas asociadas"
								id="personas_asociadas"
								error={fieldError('personas_asociadas')}
								hint="Vincula personas a la institución (p. ej. religiosos, propietarios)"
							>
								<MultiSelect
									id="personas_asociadas"
									bind:values={personas_asociadas}
									endpoint="personas-esclavizadas/"
									placeholder="Buscar persona…"
								/>
							</FormField>

							<FormField label="Notas" id="notas" error={fieldError('notas')}>
								<textarea id="notas" class="form-control" rows="3" bind:value={notas}></textarea>
							</FormField>

							{#if formErrors.__all__}
								<div class="alert alert-danger py-2 mb-3" role="alert">
									<small>{formErrors.__all__.join(' ')}</small>
								</div>
							{/if}

							<div class="d-flex gap-2 mt-3">
								<button type="submit" class="btn btn-primary" disabled={saving}>
									{#if saving}
										<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
									{/if}
									Guardar cambios
								</button>
								<a href="/Detail/corporacion/{data.id}" class="btn btn-outline-secondary">
									Cancelar
								</a>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
