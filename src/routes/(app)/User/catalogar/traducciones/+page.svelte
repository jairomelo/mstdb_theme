<script>
	import { onMount } from 'svelte';
	import {
		workbenchTranslations,
		createWorkbenchTranslation,
		updateWorkbenchTranslation,
		publishWorkbenchTranslation,
		unpublishWorkbenchTranslation,
		missingWorkbenchTranslations,
		workbenchContentType
	} from '$lib/api.js';
	import { user } from '$lib/stores/user';
	import { whoami } from '$lib/api';

	const MODELS = [
		{ value: 'documento', label: 'Documentos', fields: ['titulo', 'descripcion', 'notas'] },
		{ value: 'lugar', label: 'Lugares', fields: ['nombre_lugar', 'otros_nombres'] },
		{
			value: 'personaesclavizada',
			label: 'Personas esclavizadas',
			fields: ['notas', 'marcas_corporales', 'conducta', 'salud']
		},
		{ value: 'personanoesclavizada', label: 'Personas no esclavizadas', fields: ['notas'] },
		{ value: 'corporacion', label: 'Corporaciones', fields: ['nombres_alternativos', 'notas'] },
		{ value: 'personalugarrel', label: 'Relaciones persona–lugar (notas)', fields: ['notas'] },
		{
			value: 'personarelaciones',
			label: 'Relaciones entre personas',
			fields: ['notas', 'descripcion_relacion']
		},
		{
			value: 'tipodocumental',
			label: 'Voc: tipos documentales',
			fields: ['tipo_documental', 'descripcion']
		},
		{
			value: 'situacionlugar',
			label: 'Voc: situaciones de lugar',
			fields: ['situacion', 'descripcion']
		},
		{ value: 'rolevento', label: 'Voc: roles de evento', fields: ['rol_evento', 'descripcion'] },
		{ value: 'tipolugar', label: 'Voc: tipos de lugar', fields: ['tipo_lugar', 'descripcion'] },
		{ value: 'calidades', label: 'Voc: calidades', fields: ['calidad', 'descripcion'] },
		{ value: 'actividades', label: 'Voc: actividades', fields: ['actividad', 'descripcion'] },
		{
			value: 'hispanizaciones',
			label: 'Voc: hispanizaciones',
			fields: ['hispanizacion', 'descripcion']
		},
		{ value: 'etonimos', label: 'Voc: etnónimos', fields: ['etonimo', 'descripcion'] },
		{
			value: 'conductaterm',
			label: 'Voc: términos de conducta',
			fields: ['canonico', 'descripcion']
		},
		{ value: 'estadocivil', label: 'Voc: estado civil', fields: ['estado_civil', 'descripcion'] },
		{ value: 'leccionnivel', label: 'Voc: niveles de lección', fields: ['nivel', 'descripcion'] },
		{
			value: 'leccionpalabraclave',
			label: 'Voc: palabras clave',
			fields: ['palabra_clave', 'descripcion']
		},
		{
			value: 'tiposinstitucion',
			label: 'Voc: tipos de institución',
			fields: ['tipo', 'descripcion']
		}
	];

	let tab = 'missing';
	let model = MODELS[0].value;
	let field = MODELS[0].fields[0];
	let rows = [];
	let missing = { missing_ids: [], count: 0 };
	let loading = false;
	let error = null;
	let notice = null;
	let denied = false;
	let editing = {};
	let saving = {};

	$: fields = (MODELS.find((entry) => entry.value === model) ?? MODELS[0]).fields;
	$: if (!fields.includes(field)) field = fields[0];

	onMount(async () => {
		try {
			const me = await whoami();
			user.set(me);
			if (!me?.is_staff) {
				denied = true;
				return;
			}
			await refresh();
		} catch {
			denied = true;
		}
	});

	async function refresh() {
		loading = true;
		error = null;
		notice = null;
		try {
			if (tab === 'missing') {
				missing = await missingWorkbenchTranslations({
					model,
					field_name: field,
					language_code: 'en'
				});
			} else {
				const params = { model, language_code: 'en', page_size: 50 };
				if (tab === 'drafts') params.status = 'draft';
				if (tab === 'published') params.status = 'published';
				const data = await workbenchTranslations(params);
				rows = data.results ?? data;
			}
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function startEdit(row) {
		editing[row.id] = row.value;
	}

	function cancelEdit(row) {
		delete editing[row.id];
		editing = { ...editing };
	}

	async function saveEdit(row) {
		saving[row.id] = true;
		try {
			const updated = await updateWorkbenchTranslation(row.id, { value: editing[row.id] });
			rows = rows.map((r) => (r.id === row.id ? updated : r));
			cancelEdit(row);
			notice = 'Borrador guardado.';
		} catch (e) {
			error = e.message;
		} finally {
			delete saving[row.id];
			saving = { ...saving };
		}
	}

	async function togglePublish(row) {
		saving[row.id] = true;
		try {
			const updated =
				row.status === 'published'
					? await unpublishWorkbenchTranslation(row.id)
					: await publishWorkbenchTranslation(row.id);
			rows = rows.map((r) => (r.id === row.id ? updated : r));
			notice = updated.status === 'published' ? 'Traducción publicada.' : 'Devuelta a borrador.';
		} catch (e) {
			error = e.message;
		} finally {
			delete saving[row.id];
			saving = { ...saving };
		}
	}

	async function createDraft(objectId, value) {
		if (!objectId || !value?.trim()) {
			error = 'Indica el ID del registro y el texto en inglés.';
			return;
		}
		loading = true;
		try {
			const { content_type } = await workbenchContentType(model);
			const created = await createWorkbenchTranslation({
				content_type,
				object_id: Number(objectId),
				field_name: field,
				language_code: 'en',
				value: value.trim()
			});
			notice = `Borrador creado (id ${created.id}).`;
			newObjectId = '';
			newValue = '';
			await refresh();
		} catch (e) {
			error = e.data?.field_name?.join(' ') ?? e.data?.detail ?? e.message;
		} finally {
			loading = false;
		}
	}

	let newObjectId = '';
	let newValue = '';
</script>

<svelte:head><title>Mesa de traducción (EN)</title></svelte:head>

<div class="container mt-4">
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
			<li class="breadcrumb-item active" aria-current="page">Traducciones</li>
		</ol>
	</nav>

	<h1 class="h3 mb-3">Mesa de traducción — inglés</h1>
	<p class="text-muted">
		El español es la fuente autoritativa; aquí se redactan y publican las versiones en inglés. Solo
		lo <strong>publicado</strong> aparece en el sitio público y la búsqueda.
	</p>

	{#if denied}
		<div class="alert alert-warning" role="alert">
			Solo el personal autorizado (staff) puede usar la mesa de traducción.
		</div>
	{:else}
		<div class="row g-3 mb-3">
			<div class="col-md-4">
				<label class="form-label" for="wb-model">Modelo</label>
				<select id="wb-model" class="form-select" bind:value={model} on:change={refresh}>
					{#each MODELS as entry}
						<option value={entry.value}>{entry.label}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-4">
				<label class="form-label" for="wb-field">Campo</label>
				<select id="wb-field" class="form-select" bind:value={field} on:change={refresh}>
					{#each fields as f}
						<option value={f}>{f}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-4">
				<span class="form-label" id="wb-tabs-label">Vista</span>
				<div class="btn-group w-100" role="group" aria-labelledby="wb-tabs-label">
					<button
						type="button"
						class="btn btn-outline-primary"
						class:active={tab === 'missing'}
						aria-pressed={tab === 'missing'}
						on:click={() => {
							tab = 'missing';
							refresh();
						}}>Faltantes</button
					>
					<button
						type="button"
						class="btn btn-outline-primary"
						class:active={tab === 'drafts'}
						aria-pressed={tab === 'drafts'}
						on:click={() => {
							tab = 'drafts';
							refresh();
						}}>Borradores</button
					>
					<button
						type="button"
						class="btn btn-outline-primary"
						class:active={tab === 'published'}
						aria-pressed={tab === 'published'}
						on:click={() => {
							tab = 'published';
							refresh();
						}}>Publicadas</button
					>
				</div>
			</div>
		</div>

		{#if error}
			<div class="alert alert-danger" role="alert">{error}</div>
		{/if}
		{#if notice}
			<div class="alert alert-success" role="status">{notice}</div>
		{/if}

		{#if loading}
			<div class="text-center py-4">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Cargando…</span>
				</div>
			</div>
		{:else if tab === 'missing'}
			<div class="card">
				<div class="card-body">
					<h2 class="h5">
						Faltan {missing.count} traducciones <span class="text-muted">({model} · {field})</span>
					</h2>
					{#if missing.count === 0}
						<p class="mb-0">Sin pendientes: todo tiene al menos un borrador o publicado.</p>
					{:else}
						<p class="text-muted">IDs de registro sin traducción al inglés (máx. 2000).</p>
						<p>{missing.missing_ids.slice(0, 100).join(', ')}{missing.count > 100 ? '…' : ''}</p>
						<div class="row g-2 align-items-end">
							<div class="col-md-3">
								<label class="form-label" for="wb-new-id">ID de registro</label>
								<input
									id="wb-new-id"
									class="form-control"
									type="number"
									min="1"
									bind:value={newObjectId}
								/>
							</div>
							<div class="col-md-7">
								<label class="form-label" for="wb-new-value">Texto en inglés</label>
								<textarea id="wb-new-value" class="form-control" rows="2" bind:value={newValue}
								></textarea>
							</div>
							<div class="col-md-2">
								<button
									type="button"
									class="btn btn-primary w-100"
									on:click={() => createDraft(newObjectId, newValue)}
								>
									Crear borrador
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="table-responsive">
				<table class="table table-striped align-middle">
					<thead>
						<tr>
							<th scope="col">Registro</th>
							<th scope="col">Texto (EN)</th>
							<th scope="col">Estado</th>
							<th scope="col"><span class="visually-hidden">Acciones</span></th>
						</tr>
					</thead>
					<tbody>
						{#each rows as row (row.id)}
							<tr>
								<td>#{row.object_id} · {row.field_name}</td>
								<td style="min-width: 16rem">
									{#if editing[row.id] !== undefined}
										<label class="visually-hidden" for="wb-edit-{row.id}"
											>Editar traducción {row.id}</label
										>
										<textarea
											id="wb-edit-{row.id}"
											class="form-control"
											rows="2"
											bind:value={editing[row.id]}
										></textarea>
									{:else}
										{row.value}
									{/if}
								</td>
								<td>
									<span
										class="badge"
										class:text-bg-warning={row.status === 'draft'}
										class:text-bg-success={row.status === 'published'}
									>
										{row.status === 'draft' ? 'Borrador' : 'Publicado'}
									</span>
								</td>
								<td class="text-nowrap">
									{#if editing[row.id] !== undefined}
										<button
											type="button"
											class="btn btn-sm btn-success me-1"
											disabled={!!saving[row.id]}
											on:click={() => saveEdit(row)}>Guardar</button
										>
										<button
											type="button"
											class="btn btn-sm btn-outline-secondary"
											on:click={() => cancelEdit(row)}>Cancelar</button
										>
									{:else}
										<button
											type="button"
											class="btn btn-sm btn-outline-primary me-1"
											on:click={() => startEdit(row)}>Editar</button
										>
										<button
											type="button"
											class="btn btn-sm btn-outline-success"
											disabled={!!saving[row.id]}
											on:click={() => togglePublish(row)}
										>
											{row.status === 'published' ? 'Despublicar' : 'Publicar'}
										</button>
									{/if}
								</td>
							</tr>
						{:else}
							<tr><td colspan="4" class="text-muted">Sin filas en esta vista.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
