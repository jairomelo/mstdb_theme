<script>
	import { onMount } from 'svelte';
	import { tooltip } from '$lib/tooltip.js';
	import { pernoesclavizadas } from '$lib/api';

	export let data;
	let pernoesc = null;
	let error = null;

	onMount(async () => {
		try {
			pernoesc = await pernoesclavizadas(data.id);
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch persona esclavizada:', e);
		}
	});
</script>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if pernoesc}

	<div class="entity-banner">
		<h1><img src="/icons/i_peresc.png" alt="Persona Esclavizada"> Persona No Esclavizada</h1>
	</div>

		<div class="card mb-4">
			<div class="card-header bg-primary text-white">
				<h1 class="card-title mb-0">{pernoesc.nombre_normalizado || 'Persona Esclavizada'}</h1>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<p><strong><i class="bi bi-fingerprint me-2"></i>ID:</strong> {pernoesc.persona_idno}</p>
						<p>
							<strong><i class="bi bi-person me-2"></i>Nombres:</strong>
							{pernoesc.nombres || 'No disponible'}
						</p>
						<p>
							<strong><i class="bi bi-person-badge me-2"></i>Apellidos:</strong>
							{pernoesc.apellidos || 'No disponible'}
						</p>
						<p>
							<strong><i class="bi bi-gender-ambiguous me-2"></i>Sexo:</strong>
							{pernoesc.sexo || 'No disponible'}
						</p>
						<p>
							<strong><i class="bi bi-calendar-event me-2"></i>Edad:</strong>
							{pernoesc.edad}
							{pernoesc.unidad_temporal_edad || 'años'}
						</p>
					</div>
				</div>
			</div>
		</div>

		{#if pernoesc.documentos && pernoesc.documentos.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-secondary text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-file-earmark-text me-2"></i>Documentos relacionados
					</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each pernoesc.documentos as doc}
						<li class="list-group-item">
							<h3 class="h6">{doc.titulo}</h3>
							<p class="mb-1"><small>ID: {doc.documento_idno}</small></p>
							<p class="mb-1"><small>Archivo: {doc.archivo.nombre}</small></p>
							<p class="mb-1"><small>Fecha: {doc.fecha_inicial} - {doc.fecha_final}</small></p>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if pernoesc.relaciones && pernoesc.relaciones.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-info text-white">
					<h2 class="card-title h5 mb-0"><i class="bi bi-people me-2"></i>Relaciones</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each pernoesc.relaciones as relacion}
						<li class="list-group-item">
							<p class="mb-1"><strong>Naturaleza:</strong> {relacion.naturaleza_relacion}</p>
							<p class="mb-1"><strong>Descripción:</strong> {relacion.descripcion_relacion}</p>
							<p class="mb-1"><strong>Personas relacionadas:</strong></p>
							<ul>
								{#each relacion.personas as persona}
									<li>{persona.nombre_normalizado} (ID: {persona.persona_idno})</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if pernoesc.lugares && pernoesc.lugares.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-success text-white">
					<h2 class="card-title h5 mb-0"><i class="bi bi-geo-alt me-2"></i>Lugares relacionados</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each pernoesc.lugares as lugar}
						<li class="list-group-item">
							<p class="mb-1"><strong>Nombre:</strong> {lugar.lugar.nombre_lugar}</p>
							<p class="mb-1"><strong>Tipo:</strong> {lugar.lugar.tipo}</p>
							{#if lugar.situacion_lugar}<p class="mb-1">
									<strong>Situación:</strong>
									{lugar.situacion_lugar}
								</p>{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="mt-3 text-muted">
			<small data-bs-toggle="tooltip" data-bs-placement="top" title="Fecha de creación">
				<i class="bi bi-clock-history me-1"></i>Creado: {new Date(
					pernoesc.created_at
				).toLocaleString()}
			</small>
			<small
				class="ms-3"
				data-bs-toggle="tooltip"
				data-bs-placement="top"
				title="Última actualización"
			>
				<i class="bi bi-clock me-1"></i>Actualizado: {new Date(pernoesc.updated_at).toLocaleString()}
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
