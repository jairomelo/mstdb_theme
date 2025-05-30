<script>
	import { onMount } from 'svelte';
	import { tooltip } from '$lib/bootstrap-actions.js';
	import { peresclavizadas } from '$lib/api';

	export let data;
	let peresc = null;
	let error = null;

	onMount(async () => {
		try {
			peresc = await peresclavizadas(data.id);
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
	{:else if peresc}

	<div class="entity-banner">
		<h1 class="text-primary"><img src="/icons/i_peresc.webp" alt="Persona Esclavizada"> Persona Esclavizada</h1>
	</div>

		<div class="card mb-4">
			<div class="card-header bg-primary text-white">
				<h1 class="card-title mb-0">{peresc.nombre_normalizado || 'Persona Esclavizada'}</h1>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<p><strong><i class="bi bi-fingerprint me-2"></i>ID:</strong> {peresc.persona_idno}</p>
						<p>
							<strong><i class="bi bi-person me-2"></i>Nombres:</strong>
							{peresc.nombres || 'No disponible'}
						</p>
						<p>
							<strong><i class="bi bi-person-badge me-2"></i>Apellidos:</strong>
							{peresc.apellidos || 'No disponible'}
						</p>
						<p>{#if peresc.sexo}
							<strong><i class="bi bi-gender-ambiguous me-2"></i>Sexo:</strong>
								{peresc.sexo || 'No disponible'}
							{/if}
						</p>
						<p>{#if peresc.edad}
							<strong><i class="bi bi-calendar-event me-2"></i>Edad:</strong>
								{peresc.edad}
								{peresc.unidad_temporal_edad || 'años'}
							{/if}
						</p>
					</div>
					<div class="col-md-6">
						<p>{#if peresc.etnonimos}
							<strong><i class="bi bi-globe me-2"></i>Etnónimos:</strong>
								{peresc.etnonimos.join(', ') || 'No disponible'}
							{/if}
						</p>
						<p>{#if peresc.hispanizacion}
							<strong><i class="bi bi-translate me-2"></i>Agencia / Adaptación:</strong>
								{peresc.hispanizacion || 'No disponible'}
							{/if}

						</p>
						<p>{#if peresc.marcas_corporales}
							<strong><i class="bi bi-body-text me-2"></i>Marcas corporales:</strong>
								{peresc.marcas_corporales || 'No disponible'}
							{/if}
						</p>
						<p>{#if peresc.salud}
							<strong><i class="bi bi-heart-pulse me-2"></i>Salud:</strong>
								{peresc.salud || 'No disponible'}
							{/if}
						</p>
						<p>{#if peresc.conducta}
							<strong><i class="bi bi-person-lines-fill me-2"></i>Conducta:</strong>
								{peresc.conducta || 'No disponible'}
							{/if}
						</p>
					</div>
				</div>
			</div>
		</div>

		{#if peresc.documentos && peresc.documentos.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-secondary text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-file-earmark-text me-2"></i>Documentos relacionados
					</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each peresc.documentos as doc}
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

		{#if peresc.relaciones && peresc.relaciones.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-info text-white">
					<h2 class="card-title h5 mb-0"><i class="bi bi-people me-2"></i>Relaciones</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each peresc.relaciones as relacion}
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

		{#if peresc.lugares && peresc.lugares.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-success text-white">
					<h2 class="card-title h5 mb-0"><i class="bi bi-geo-alt me-2"></i>Lugares relacionados</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each peresc.lugares as lugar}
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
					peresc.created_at
				).toLocaleString()}
			</small>
			<small
				class="ms-3"
				data-bs-toggle="tooltip"
				data-bs-placement="top"
				title="Última actualización"
			>
				<i class="bi bi-clock me-1"></i>Actualizado: {new Date(peresc.updated_at).toLocaleString()}
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
