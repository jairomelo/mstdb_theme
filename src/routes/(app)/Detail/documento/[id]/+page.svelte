<script>
	import { onMount } from 'svelte';
	import { tooltip } from '$lib/bootstrap-actions.js';
	import { documentos, documentoPersonas } from '$lib/api';
	import { generateDocumentTree } from '$lib/documentTree.js';

	export let data;
	let documento = null;
	let error = null;
	let treeExpanded = false;
	let documentTree = [];

	let personas = [];
	let personaPage = 1;
	let personaTotalPages = 1;
	let personaLoading = false;

	onMount(async () => {
		try {
			documento = await documentos(data.id);
			documentTree = generateDocumentTree(documento);
			if (documento.persona_count > 0) {
				await loadPersonas(1);
			}
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch document:', e);
		}
	});

	async function loadPersonas(page) {
		if (personaLoading) return;
		personaLoading = true;
		try {
			const response = await documentoPersonas(data.id, page);
			personas = response.results;
			personaPage = page;
			personaTotalPages = Math.ceil(response.count / 20);
		} catch (e) {
			console.error('Failed to fetch personas:', e);
		} finally {
			personaLoading = false;
		}
	}

	function nextPage() {
		if (personaPage < personaTotalPages) loadPersonas(personaPage + 1);
	}
	function prevPage() {
		if (personaPage > 1) loadPersonas(personaPage - 1);
	}

	function personaDetailPath(persona) {
		const ct = persona.polymorphic_ctype;
		const isEsclavizada = ct === 25 || (typeof ct === 'string' && ct.includes('esclavizada'));
		return isEsclavizada ? 'personaesclavizada' : 'personanoesclavizada';
	}

	function toggleFullTree() {
		treeExpanded = !treeExpanded;
		const archiveTreeElement = document.querySelector('.archive-tree');
			if (archiveTreeElement) {
				archiveTreeElement.classList.toggle('expanded', treeExpanded);
			}
	}

	function renderTree(nodes) {
		return `
			<ul class="tree">
				${nodes.map(node => `
					<li>
						<span><i class="bi ${node.icon} me-2"></i>${node.name}</span>
						${node.children && node.children.length ? renderTree(node.children) : ''}
					</li>
				`).join('')}
			</ul>
		`;
	}
</script>

<div class="container mt-4">
	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
		</div>
	{:else if documento}
		<div class="card">
			<div class="card-header bg-primary text-white">
				<h1 class="card-title mb-0">{documento.titulo}</h1>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-md-6">
						<p>
							<strong><i class="bi bi-fingerprint me-2"></i>ID:</strong>
							{documento.documento_idno}
						</p>
						<p>
							<strong><i class="bi bi-file-earmark-text me-2"></i>Tipo de documento:</strong>
							{documento.tipo_documento}
						</p>
						<p>
							<strong><i class="bi bi-calendar-range me-2"></i>Fecha:</strong>
							{documento.fecha_inicial_raw || 'N/A'}{documento.fecha_final_raw &&
							documento.fecha_final_raw !== documento.fecha_inicial_raw
								? ` - ${documento.fecha_final_raw}`
								: ''}
						</p>

						<div class="archive-tree">
							<button type="button" class="btn btn-link p-0 text-start" on:click={toggleFullTree}>
								<h5>
									<i
										class="bi"
										class:bi-chevron-right={!treeExpanded}
										class:bi-chevron-down={treeExpanded}
									></i>
									Ubicación del documento:
								</h5>
							</button>
							{#if treeExpanded}
								{@html renderTree(documentTree)}
							{/if}
						</div>
					</div>
					<div class="col-md-6">
						<p>{#if documento.lugar_de_produccion}
							<strong><i class="bi bi-geo-alt me-2"></i>Lugar de producción:</strong>
								<a href="/Detail/lugar/{documento.lugar_de_produccion.lugar_id}">
									{documento.lugar_de_produccion.nombre_lugar}
								</a>
							{/if}
						</p>
						<p>
							<strong><i class="bi bi-exclamation-circle me-2"></i>Deteriorado:</strong>
							{documento.deteriorado ? 'Sí' : 'No'}
						</p>
					</div>
				</div>
				<div class="mt-3">
					{#if documento.descripcion}
						<h5><i class="bi bi-card-text me-2"></i>Descripción:</h5>
						<p>{documento.descripcion}</p>
					{/if}
				</div>
				<div class="mt-3">
					<h5><i class="bi bi-pencil-square me-2"></i>Notas:</h5>
					<p>{documento.notas || 'No disponible'}</p>
				</div>
				<div class="mt-3 text-muted">
					<small data-bs-toggle="tooltip" data-bs-placement="top" title="Fecha de creación">
						<i class="bi bi-clock-history me-1"></i>Creado: {new Date(
							documento.created_at
						).toLocaleString()}
					</small>
					<small
						class="ms-3"
						data-bs-toggle="tooltip"
						data-bs-placement="top"
						title="Última actualización"
					>
						<i class="bi bi-clock me-1"></i>Actualizado: {new Date(
							documento.updated_at
						).toLocaleString()}
					</small>
				</div>
			</div>
		</div>

		{#if personaLoading}
			<div class="text-center my-3">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Cargando...</span>
				</div>
			</div>
		{/if}

		{#if personas.length > 0}
			<div class="card mb-4">
				<div class="card-header bg-secondary text-white">
					<h2 class="card-title h5 mb-0">
						<i class="bi bi-people me-2"></i>Personas relacionadas con este documento
					</h2>
				</div>
				<ul class="list-group list-group-flush">
					{#each personas as persona}
						<li class="list-group-item">
							<a class="{personaDetailPath(persona) === 'personaesclavizada' ? 'text-primary' : 'text-secondary'}"
							   href="/Detail/{personaDetailPath(persona)}/{persona.persona_id}">
								<h3 class="h6 mb-0">{persona.nombre_normalizado}</h3>
							</a>
						</li>
					{/each}
				</ul>
				{#if personaTotalPages > 1}
					<div class="card-footer">
						<div class="d-flex justify-content-between align-items-center">
							<button class="btn btn-secondary btn-sm" on:click={prevPage} disabled={personaPage === 1}>
								<i class="bi bi-chevron-left"></i> Anterior
							</button>
							<span class="small text-muted">Página {personaPage} de {personaTotalPages}</span>
							<button class="btn btn-secondary btn-sm" on:click={nextPage} disabled={personaPage === personaTotalPages}>
								Siguiente <i class="bi bi-chevron-right"></i>
							</button>
						</div>
					</div>
				{/if}
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
