<script>
	import { onMount } from 'svelte';
	import { tooltip } from '$lib/bootstrap-actions.js';
	import { lugares, lugarPersonasRelacionadas } from '$lib/api';


	export let data;
	let lugar = null;
	let error = null;
	let personasRelacionadas = [];
	let currentPage = 1;
    let totalPages = 1;
    let loading = false;

	onMount(async () => {
		try {
			lugar = await lugares(data.id);
            await loadPersonas(1);
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch lugar:', e);
		}
	});

	async function loadPersonas(page) {
        if (loading) return;
        loading = true;
        try {
            const response = await lugarPersonasRelacionadas(data.id, page);
            personasRelacionadas = response.results;
            currentPage = page;
            totalPages = Math.ceil(response.count / 10); 
        } catch (e) {
            console.error('Failed to fetch personas:', e);
        } finally {
            loading = false;
        }
    }

    function nextPage() {
        if (currentPage < totalPages) {
            loadPersonas(currentPage + 1);
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            loadPersonas(currentPage - 1);
        }
    }
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

		{#if personasRelacionadas.length > 0}
            <div class="card mb-4">
                <div class="card-header bg-secondary text-white">
                    <h2 class="card-title h5 mb-0">
                        <i class="bi bi-people me-2"></i>Personas relacionadas con este lugar
                    </h2>
                </div>
                <ul class="list-group list-group-flush">
                    {#each personasRelacionadas as per}
                        <li class="list-group-item">
                            <div class="row">
                                <div class="col-md-6">
                                    {#each per.personas as persona}
                                        <a class="{persona.polymorphic_ctype?.includes('persona esclavizada') ? 'text-primary' : 'text-secondary'}" 
                                           href="/Detail/{persona.polymorphic_ctype?.includes('persona esclavizada') ? 'personaesclavizada' : 'personanoesclavizada'}/{persona.persona_id}">
                                            <h3 class="h6 mb-2">{persona.nombre_normalizado}</h3>
                                        </a>
                                    {/each}
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
                                                <a href="/Detail/documento/{per.documento.documento_id}">
                                                    {per.documento.titulo?.length > 50 
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
                </ul>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-primary" on:click={prevPage} disabled={currentPage === 1}>
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button class="btn btn-primary" on:click={nextPage} disabled={currentPage === totalPages}>
                            Next <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        {/if}

		{#if loading}
            <div class="text-center my-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        {/if}

		{#if lugar.personas_esclavizadas_procedencia && lugar.personas_esclavizadas_procedencia.length > 0}
		<div class="card mb-4">
			<div class="card-header bg-success text-white">
				<h2 class="card-title h5 mb-0"><i class="bi bi-geo-alt me-2"></i>{lugar.personas_esclavizadas_procedencia.length} Personas provenientes de este lugar:</h2>
			</div>
			<ul class="list-group list-group-flush">
				{#each lugar.personas_esclavizadas_procedencia as proc}
					<li class="list-group-item">
						<a class="{proc.polymorphic_ctype == 29 ? 'text-primary' : 'text-secondary'}" 
                                           href="/Detail/{proc.polymorphic_ctype == 29 ? 'personaesclavizada' : 'personanoesclavizada'}/{proc.persona_id}">
                                            <h3 class="h6 mb-2">{proc.nombre_normalizado}</h3>
                                        </a>
										{#if proc.documentos}
                                        <p class="mb-1">
                                            <small>Registro: 
												{#each proc.documentos as docu }
                                                <a href="/Detail/documento/{docu.documento_id}">
                                                    {docu.titulo?.length > 50 
                                                        ? docu.titulo.substring(0, 50) + '...'
                                                        : docu.titulo}
                                                </a>
												{/each}
                                            </small>
                                        </p>
                                    {/if}
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
