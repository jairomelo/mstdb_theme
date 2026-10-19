<script>
	import { onMount } from 'svelte';
	import {
		createWorkbenchTranslation,
		updateWorkbenchTranslation,
		publishWorkbenchTranslation,
		unpublishWorkbenchTranslation,
		workbenchQueue,
		bulkPublishWorkbenchTranslations,
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

	const VIEW_LABELS = {
		missing: 'Faltantes',
		drafts: 'Borradores',
		published: 'Publicadas',
		all: 'Todas'
	};
	const PAGE_SIZE = 25;

	let view = 'missing';
	let model = MODELS[0].value;
	let field = MODELS[0].fields[0];
	let items = [];
	let total = 0;
	let page = 1;
	let hasNext = false;
	let hasPrev = false;
	let loading = false;
	let error = null;
	let notice = null;
	let denied = false;
	let drafts = {};
	let saving = false;
	let bulkPublishing = false;
	let selected = new Set();

	$: fields = (MODELS.find((entry) => entry.value === model) ?? MODELS[0]).fields;
	$: if (!fields.includes(field)) field = fields[0];
	$: selectedCount = selected.size;
	$: dirtyCount = items.filter(
		(item) =>
			item.translation_id &&
			drafts[item.object_id] !== undefined &&
			drafts[item.object_id] !== item.value
	).length;

	function statusLabel(status) {
		if (status === 'published') return 'Publicado';
		if (status === 'draft') return 'Borrador';
		return 'Sin traducir';
	}

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

	let requestId = 0;

	function fieldsFor(modelValue) {
		return (MODELS.find((entry) => entry.value === modelValue) ?? MODELS[0]).fields;
	}

	async function refresh(nextPage = 1, keepNotice = null, scope = null) {
		const my = ++requestId;
		const activeModel = scope?.model ?? model;
		const activeField = scope?.field ?? field;
		const activeView = scope?.view ?? view;
		loading = true;
		error = null;
		notice = keepNotice;
		selected = new Set();
		drafts = {};
		try {
			const data = await workbenchQueue({
				model: activeModel,
				field_name: activeField,
				language_code: 'en',
				view: activeView,
				page: nextPage,
				page_size: PAGE_SIZE
			});
			if (my !== requestId) return;
			items = data.results ?? [];
			total = data.count ?? items.length;
			page = nextPage;
			hasNext = Boolean(data.next);
			hasPrev = Boolean(data.previous);
			error = null;
		} catch (e) {
			if (my !== requestId) return;
			error = e.data?.detail ?? e.message;
		} finally {
			if (my === requestId) loading = false;
		}
	}

	function switchView(next) {
		view = next;
		refresh(1, null, { model, field, view: next });
	}

	function changeScope() {
		const allowed = fieldsFor(model);
		if (!allowed.includes(field)) field = allowed[0];
		refresh(1, null, { model, field, view });
	}

	function currentText(item) {
		return drafts[item.object_id] !== undefined ? drafts[item.object_id] : item.value;
	}

	function toggleSelect(objectId, checked) {
		if (checked) selected.add(objectId);
		else selected.delete(objectId);
		selected = new Set(selected);
	}

	function toggleSelectAll(checked) {
		selected = checked ? new Set(items.map((item) => item.object_id)) : new Set();
	}

	async function saveRow(item) {
		const text = (drafts[item.object_id] ?? '').trim();
		if (!text) {
			error = `Escribe la traducción en inglés para el registro ${item.object_id}.`;
			return;
		}
		saving = true;
		error = null;
		try {
			if (item.translation_id) {
				await updateWorkbenchTranslation(item.translation_id, { value: text });
				item.value = text;
				item.status = 'draft';
			} else {
				const { content_type } = await workbenchContentType(model);
				const created = await createWorkbenchTranslation({
					content_type,
					object_id: item.object_id,
					field_name: field,
					language_code: 'en',
					value: text
				});
				item.translation_id = created.id;
				item.value = text;
				item.status = 'draft';
			}
			delete drafts[item.object_id];
			drafts = { ...drafts };
			items = [...items];
			notice = `Registro ${item.object_id} guardado como borrador.`;
		} catch (e) {
			error = e.data?.field_name?.join(' ') ?? e.data?.detail ?? e.message;
		} finally {
			saving = false;
		}
	}

	async function saveAllDrafts() {
		const dirty = items.filter(
			(item) =>
				drafts[item.object_id] !== undefined &&
				drafts[item.object_id].trim() &&
				drafts[item.object_id] !== item.value
		);
		if (dirty.length === 0) return;
		saving = true;
		error = null;
		try {
			const { content_type } = await workbenchContentType(model);
			let saved = 0;
			for (const item of dirty) {
				const text = drafts[item.object_id].trim();
				if (item.translation_id) {
					await updateWorkbenchTranslation(item.translation_id, { value: text });
				} else {
					const created = await createWorkbenchTranslation({
						content_type,
						object_id: item.object_id,
						field_name: field,
						language_code: 'en',
						value: text
					});
					item.translation_id = created.id;
				}
				item.value = text;
				if (item.status === 'none') item.status = 'draft';
				delete drafts[item.object_id];
				saved += 1;
			}
			drafts = { ...drafts };
			items = [...items];
			if (view === 'missing') await refresh(page, `${saved} borradores guardados.`);
			else notice = `${saved} borradores guardados.`;
		} catch (e) {
			error = e.data?.field_name?.join(' ') ?? e.data?.detail ?? e.message;
		} finally {
			saving = false;
		}
	}

	async function togglePublish(item) {
		saving = true;
		error = null;
		try {
			let message;
			if (item.status === 'published') {
				await unpublishWorkbenchTranslation(item.translation_id);
				item.status = 'draft';
				message = `Registro ${item.object_id} devuelto a borrador.`;
			} else {
				if (!item.translation_id) {
					await saveRow(item);
					if (!item.translation_id) return;
				}
				await publishWorkbenchTranslation(item.translation_id);
				item.status = 'published';
				message = `Registro ${item.object_id} publicado.`;
			}
			items = [...items];
			if (view !== 'all') await refresh(page, message);
			else notice = message;
		} catch (e) {
			error = e.message;
		} finally {
			saving = false;
		}
	}

	async function bulkPublish() {
		const ids = items
			.filter((item) => selected.has(item.object_id) && item.translation_id)
			.map((item) => item.translation_id);
		if (ids.length === 0) {
			error = 'Selecciona al menos una fila con borrador para publicar.';
			return;
		}
		bulkPublishing = true;
		error = null;
		try {
			const { published } = await bulkPublishWorkbenchTranslations(ids);
			await refresh(page, `${published} traducciones publicadas.`);
		} catch (e) {
			error = e.message;
		} finally {
			bulkPublishing = false;
		}
	}
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
			<div class="col-md-3">
				<label class="form-label" for="wb-model">Modelo</label>
				<select id="wb-model" class="form-select" bind:value={model} on:change={changeScope}>
					{#each MODELS as entry}
						<option value={entry.value}>{entry.label}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-3">
				<label class="form-label" for="wb-field">Campo</label>
				<select id="wb-field" class="form-select" bind:value={field} on:change={changeScope}>
					{#each fields as fname}
						<option value={fname}>{fname}</option>
					{/each}
				</select>
			</div>
			<div class="col-md-6">
				<span class="form-label" id="wb-view-label">Vista</span>
				<div class="btn-group w-100" role="group" aria-labelledby="wb-view-label">
					{#each Object.entries(VIEW_LABELS) as [key, label]}
						<button
							type="button"
							class="btn btn-outline-primary"
							class:active={view === key}
							aria-pressed={view === key}
							on:click={() => switchView(key)}>{label}</button
						>
					{/each}
				</div>
			</div>
		</div>

		{#if error}
			<div class="alert alert-danger alert-dismissible fade show" role="alert">
				{error}
				<button
					type="button"
					class="btn-close"
					aria-label="Cerrar error"
					on:click={() => (error = null)}
				></button>
			</div>
		{/if}
		{#if notice}
			<div class="alert alert-success alert-dismissible fade show" role="status">
				{notice}
				<button
					type="button"
					class="btn-close"
					aria-label="Cerrar aviso"
					on:click={() => (notice = null)}
				></button>
			</div>
		{/if}

		{#if loading}
			<div class="text-center py-4">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Cargando…</span>
				</div>
			</div>
		{:else}
			<div class="d-flex flex-wrap gap-2 align-items-center mb-2">
				<strong>{total} registros</strong>
				<span class="text-muted">({model} · {field} · {VIEW_LABELS[view].toLowerCase()})</span>
				<span class="ms-auto"></span>
				<button
					type="button"
					class="btn btn-sm btn-outline-success"
					disabled={dirtyCount === 0 || saving}
					on:click={saveAllDrafts}
				>
					Guardar {dirtyCount > 0 ? `${dirtyCount} ` : ''}borradores
				</button>
				<button
					type="button"
					class="btn btn-sm btn-success"
					disabled={selectedCount === 0 || bulkPublishing}
					on:click={bulkPublish}
				>
					Publicar selección ({selectedCount})
				</button>
			</div>

			<div class="table-responsive">
				<table class="table table-striped align-middle">
					<thead>
						<tr>
							<th scope="col">
								<label class="visually-hidden" for="wb-select-all">Seleccionar página</label>
								<input
									id="wb-select-all"
									type="checkbox"
									class="form-check-input"
									checked={items.length > 0 && selected.size === items.length}
									on:change={(e) => toggleSelectAll(e.currentTarget.checked)}
								/>
							</th>
							<th scope="col">ID registro</th>
							<th scope="col">Texto en español</th>
							<th scope="col">Texto en inglés</th>
							<th scope="col">Estado</th>
							<th scope="col"><span class="visually-hidden">Acciones</span></th>
						</tr>
					</thead>
					<tbody>
						{#each items as item (item.object_id)}
							<tr>
								<td>
									<label class="visually-hidden" for="wb-select-{item.object_id}">
										Seleccionar registro {item.object_id}
									</label>
									<input
										id="wb-select-{item.object_id}"
										type="checkbox"
										class="form-check-input"
										checked={selected.has(item.object_id)}
										on:change={(e) => toggleSelect(item.object_id, e.currentTarget.checked)}
									/>
								</td>
								<td>{item.object_id}</td>
								<td style="min-width: 18rem; max-width: 26rem">{item.source || '—'}</td>
								<td style="min-width: 18rem">
									<label class="visually-hidden" for="wb-text-{item.object_id}">
										Traducción en inglés del registro {item.object_id}
									</label>
									<textarea
										id="wb-text-{item.object_id}"
										class="form-control"
										rows="2"
										value={currentText(item)}
										on:input={(e) => {
											drafts[item.object_id] = e.currentTarget.value;
										}}
									></textarea>
								</td>
								<td>
									<span
										class="badge"
										class:text-bg-secondary={item.status === 'none'}
										class:text-bg-warning={item.status === 'draft'}
										class:text-bg-success={item.status === 'published'}
									>
										{statusLabel(item.status)}
									</span>
								</td>
								<td class="text-nowrap">
									<button
										type="button"
										class="btn btn-sm btn-outline-primary me-1"
										disabled={saving ||
											drafts[item.object_id] === undefined ||
											drafts[item.object_id] === item.value ||
											!drafts[item.object_id]?.trim()}
										on:click={() => saveRow(item)}>Guardar</button
									>
									<button
										type="button"
										class="btn btn-sm btn-outline-success"
										disabled={saving || !item.translation_id}
										on:click={() => togglePublish(item)}
									>
										{item.status === 'published' ? 'Despublicar' : 'Publicar'}
									</button>
								</td>
							</tr>
						{:else}
							<tr><td colspan="6" class="text-muted">Sin filas en esta vista.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="d-flex align-items-center gap-2 mt-2">
				<button
					type="button"
					class="btn btn-sm btn-outline-secondary"
					disabled={!hasPrev || loading}
					on:click={() => refresh(page - 1)}>← Anterior</button
				>
				<span class="text-muted" aria-live="polite">Página {page}</span>
				<button
					type="button"
					class="btn btn-sm btn-outline-secondary"
					disabled={!hasNext || loading}
					on:click={() => refresh(page + 1)}>Siguiente →</button
				>
			</div>
		{/if}
	{/if}
</div>
