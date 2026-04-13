<script>
	import { onMount } from 'svelte';
	import { routeDetail } from '$lib/api';

	export let fromId;
	export let toId;
	export let fromNombre = '';
	export let toNombre = '';
	export let count = 0;
	export let filters = {};

	let personas = [];
	let totalCount = 0;
	let currentPage = 1;
	let totalPages = 1;
	let loading = true;
	let error = null;

	onMount(() => {
		loadPage(1);
	});

	async function loadPage(page) {
		loading = true;
		error = null;
		try {
			const params = {};
			if (filters.sexo) params.sexo = filters.sexo;
			if (filters.etnonimo) params.etnonimo = filters.etnonimo;
			if (filters.calidad) params.calidad = filters.calidad;
			if (filters.hispanizacion) params.hispanizacion = filters.hispanizacion;
			if (filters.edad__gte) params.edad__gte = filters.edad__gte;
			if (filters.edad__lte) params.edad__lte = filters.edad__lte;
			if (filters.fecha_inicial__gte) params.fecha_inicial__gte = filters.fecha_inicial__gte;
			if (filters.fecha_inicial__lte) params.fecha_inicial__lte = filters.fecha_inicial__lte;

			const data = await routeDetail(fromId, toId, page, params);
			personas = data.results || [];
			totalCount = data.count || 0;
			currentPage = page;
			totalPages = Math.ceil(totalCount / 20);
		} catch (e) {
			console.error('Route detail error:', e);
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mb-3">
	<p class="text-muted mb-1">{fromNombre} → {toNombre}</p>
	<span class="badge bg-primary fs-6">{count} persona(s)</span>
</div>

{#if loading}
	<div class="text-center py-3">
		<div class="spinner-border spinner-border-sm text-primary" role="status">
			<span class="visually-hidden">Cargando...</span>
		</div>
	</div>
{:else if error}
	<div class="alert alert-danger">{error}</div>
{:else}
	<div class="table-responsive">
		<table class="table table-sm table-hover">
			<thead>
				<tr>
					<th>Nombre</th>
					<th>Sexo</th>
					<th>Edad</th>
					<th>Etnónimos</th>
					<th>Calidades</th>
					<th>Hispanización</th>
				</tr>
			</thead>
			<tbody>
				{#each personas as p}
					<tr>
						<td>
							<a href="/Detail/personaesclavizada/{p.persona_id}">{p.nombre_normalizado}</a>
						</td>
						<td>{p.sexo || '—'}</td>
						<td>{p.edad ?? '—'}</td>
						<td>{p.etnonimos?.join(', ') || '—'}</td>
						<td>{p.calidades?.join(', ') || '—'}</td>
						<td>{p.hispanizacion?.join(', ') || '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if totalPages > 1}
		<nav class="d-flex justify-content-center align-items-center gap-2 mt-2">
			<button class="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} on:click={() => loadPage(currentPage - 1)}>
				<i class="bi bi-chevron-left"></i>
			</button>
			<span class="small text-muted">Página {currentPage} de {totalPages}</span>
			<button class="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} on:click={() => loadPage(currentPage + 1)}>
				<i class="bi bi-chevron-right"></i>
			</button>
		</nav>
	{/if}
{/if}
