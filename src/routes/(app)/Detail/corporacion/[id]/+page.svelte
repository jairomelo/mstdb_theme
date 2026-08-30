<script>
	import { onMount } from 'svelte';
	import { tooltip } from '$lib/bootstrap-actions.js';
	import { corporaciones, whoami } from '$lib/api';
	import SuggestMerge from '$lib/components/hub/SuggestMerge.svelte';
	import { formatDate } from '$lib/utils';

	export let data;
	let corp = null;
	let error = null;
	let canEdit = false;

	onMount(async () => {
		whoami().then(u => { canEdit = u.is_staff || u.groups?.includes('colectores'); }).catch(() => {});
		try {
			corp = await corporaciones(data.id);
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch corporacion:', e);
		}
	});
</script>

<svelte:head>
	<title>{corp ? `${corp.nombre_institucion} — Corporación — Trayectorias Afro` : 'Corporación — Trayectorias Afro'}</title>
</svelte:head>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if corp}

	<div class="entity-banner">
		<h1 class="text-primary"><img src="/icons/i_institucion.webp" alt="Corporación"> Corporación</h1>
	</div>
		<div class="card mb-4">
			<div class="card-header bg-primary text-white d-flex align-items-center justify-content-between">
				<h1 class="card-title mb-0">{corp.nombre_institucion}</h1>
				<div class="d-flex gap-2 align-items-center">
					{#if canEdit}
						<a href="/User/catalogar/corporacion/edit/{data.id}" class="btn btn-sm btn-outline-light">
							<i class="bi bi-pencil-square me-1"></i>Editar
						</a>
					{/if}
					<SuggestMerge entity="cor" currentId={corp.corporacion_id} currentLabel={corp.nombre_institucion} />
				</div>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<p><strong><i class="bi bi-fingerprint me-2"></i>ID:</strong> {corp.corporacion_id}</p>
						{#if corp.notas}
							<p><strong><i class="bi bi-journal-text me-2"></i>Notas:</strong> {corp.notas}</p>
						{/if}
					</div>
					<div class="col-md-6">
						<p><strong><i class="bi bi-calendar-plus me-2"></i>Creado:</strong> {formatDate(corp.created_at)}</p>
						<p><strong><i class="bi bi-calendar-check me-2"></i>Actualizado:</strong> {formatDate(corp.updated_at)}</p>
					</div>
				</div>
			</div>
		</div>

		{#if corp.eventos && corp.eventos.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-success text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-calendar-event me-2"></i>Eventos y Documentos Relacionados
					</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each corp.eventos as evento}
						<li class="list-group-item">
							<p class="mb-1">
								<strong>{evento.documento.fecha_inicial_raw}:</strong> 
								{evento.rol_evento}. 
								<a href="/Detail/documento/{evento.documento.documento_id}">
									{evento.documento.titulo}
								</a>
							</p>
							<small class="text-muted">
								Archivo: {evento.documento.archivo.nombre} ({evento.documento.archivo.nombre_abreviado})
							</small>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if corp.personas_asociadas && corp.personas_asociadas.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-secondary text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-people me-2"></i>Personas Asociadas
					</h2>
				</div>
				<ul class="list-group list-group-flush">
				{#each corp.personas_asociadas as persona}
					<li class="list-group-item">
						<a href="/Detail/{persona.persona_type === 'esclavizada' ? 'personaesclavizada' : 'personanoesclavizada'}/{persona.persona_id}"
						   class="{persona.persona_type === 'esclavizada' ? 'text-primary' : 'text-secondary'}">
							<h3 class="h6 mb-2">{persona.nombre_normalizado}</h3>
						</a>
					</li>
				{/each}
				</ul>
			</div>
		{/if}

	{:else}
		<div class="d-flex justify-content-center">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
		</div>
	{/if}
</div>

