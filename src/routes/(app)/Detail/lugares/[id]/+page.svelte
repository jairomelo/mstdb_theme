<script>
	import { onMount } from 'svelte';
	import { tooltip } from '$lib/tooltip.js';
	import { lugares } from '$lib/api';

	export let data;
	let lugar = null;
	let error = null;

	onMount(async () => {
		try {
			lugar = await lugares(data.id);
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch lugar:', e);
		}
	});

</script>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if lugar}
		<div class="card mb-4">
			<div class="card-header bg-primary text-white">
				<h1 class="card-title mb-0">{lugar.nombre_lugar} ({lugar.tipo})</h1>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<p>
							<strong><i class="bi bi-fingerprint me-2"></i>Otros nombres:</strong>
							{lugar.otros_nombres || 'ninguno'}
						</p>
					</div>
					<div class="col-md-6">
						<p>
							<strong><i class="bi bi-file-earmark-text me-2"></i>Localización (georreferenciacíón):</strong>
							{lugar.lat || 'latitud'},{lugar.lon || 'longitud'}
						</p>
					</div>
				</div>
			</div>
		</div>

		{#if lugar.personas_relacionadas && lugar.personas_relacionadas.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-secondary text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-people me-2"></i>Personas relacionadas
					</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each lugar.personas_relacionadas as per}
						{#each per.personas as persona}
							<li class="list-group-item">
								<div class="row">
									<div class="col-md-6">
										<a class="{persona.polymorphic_ctype?.includes('persona esclavizada') ? 'text-primary' : 'text-secondary'}" 
										   href="/Detail/{persona.polymorphic_ctype?.includes('persona esclavizada') ? 'personaEsclavizada' : 'personaNoEsclavizada'}/{persona.persona_id}">
											<h3 class="h6 mb-2">{persona.nombre_normalizado}</h3>
										</a>
										{#if per.fecha_inicial_lugar_raw || per.fecha_final_lugar_raw}
											<p class="mb-1"><small>Período: {per.fecha_inicial_lugar_raw} - {per.fecha_final_lugar_raw}</small></p>
										{/if}
										{#if per.situacion_lugar}
											<p class="mb-1"><small>Situación: {per.situacion_lugar}</small></p>
										{/if}
									</div>
									<div class="col-md-6">
										{#if per.documento}
											<p class="mb-1">
												<small>Registro: 
													<a href="/Detail/documentos/{per.documento.documento_id}">
														{per.documento.titulo.length > 50 
															? per.documento.titulo.substring(0, 50) + '...'
															: per.documento.titulo}
													</a>
												</small>
											</p>
										{/if}
									</div>
								</div>
							</li>
						{/each}
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
