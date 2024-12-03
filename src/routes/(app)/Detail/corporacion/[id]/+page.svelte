<script>
	import { onMount } from 'svelte';
	import { tooltip } from '$lib/bootstrap-actions.js';
	import { corporaciones } from '$lib/api';
	import { formatDate } from '$lib/utils';

	export let data;
	let corp = null;
	let error = null;

	onMount(async () => {
		try {
			corp = await corporaciones(data.id);
			console.log(corp);
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch corporacion:', e);
		}
	});
</script>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if corp}

	<div class="entity-banner">
		<h1 class="text-primary"><img src="/icons/i_institucion.webp" alt="Persona Esclavizada"> Corporación</h1>
	</div>
		<div class="card mb-4">
			<div class="card-header bg-primary text-white">
				<h1 class="card-title mb-0">{corp.nombre_institucion}</h1>
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
							<a href="/Detail/{persona.polymorphic_ctype == 29 ? 'personaesclavizada' : 'personanoesclavizada'}/{persona.persona_id}" 
							   class="{persona.polymorphic_ctype == 29 ? 'text-primary' : 'text-secondary'}">
								<h3 class="h6 mb-2">{persona.nombre_normalizado}</h3>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="mt-3 text-muted">
			<small data-bs-toggle="tooltip" data-bs-placement="top" title="Fecha de creación">
				<i class="bi bi-clock-history me-1"></i>Creado: {new Date(corp.created_at).toLocaleString()}
			</small>
			<small class="ms-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Última actualización">
				<i class="bi bi-clock me-1"></i>Actualizado: {new Date(corp.updated_at).toLocaleString()}
			</small>
		</div>
	{:else}
		<div class="d-flex justify-content-center">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
		</div>
	{/if}
</div>

