<script>
	import { onMount } from 'svelte';
	import { placeDetail } from '$lib/api';
	import { m } from '$lib/paraglide/messages.js';

	export let place;
	export let filters = {};
	export let onViewInSearch = () => {};

	let direction = 'all';
	let personas = [];
	let incoming = 0;
	let outgoing = 0;
	let totalCount = 0;
	let currentPage = 1;
	let totalPages = 1;
	let loading = true;
	let error = null;

	$: (direction, place, loadPage(1));

	onMount(() => {
		loadPage(1);
	});

	async function loadPage(page) {
		if (!place) return;
		loading = true;
		error = null;
		try {
			const params = { direction };
			if (filters.fecha_inicial__gte) params.fecha_inicial__gte = filters.fecha_inicial__gte;
			if (filters.fecha_inicial__lte) params.fecha_inicial__lte = filters.fecha_inicial__lte;

			const data = await placeDetail(place.lugar_id, page, params);
			personas = data.results || [];
			totalCount = data.count || 0;
			incoming = data.incoming ?? 0;
			outgoing = data.outgoing ?? 0;
			currentPage = page;
			totalPages = Math.max(1, Math.ceil(totalCount / 20));
		} catch (e) {
			console.error('Place detail error:', e);
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mb-3 d-flex flex-wrap align-items-center gap-2">
	<p class="text-muted mb-0">{place.nombre}</p>
	<span class="badge bg-primary fs-6"
		>{m.arcs_map_place_movements({ count: incoming + outgoing })}</span
	>
	<span class="small text-muted">{m.arcs_map_place_in_out({ incoming, outgoing })}</span>
	<button type="button" class="btn btn-sm btn-outline-primary ms-auto" on:click={onViewInSearch}>
		<i class="bi bi-search me-1" aria-hidden="true"></i>{m.arcs_map_view_in_search()}
	</button>
</div>

<div class="btn-group btn-group-sm mb-3" role="group" aria-label={m.arcs_map_place_tabs()}>
	<button
		type="button"
		class="btn"
		class:btn-primary={direction === 'all'}
		class:btn-outline-secondary={direction !== 'all'}
		on:click={() => (direction = 'all')}
		aria-pressed={direction === 'all'}
	>
		{m.arcs_map_place_all()}
	</button>
	<button
		type="button"
		class="btn"
		class:btn-primary={direction === 'in'}
		class:btn-outline-secondary={direction !== 'in'}
		on:click={() => (direction = 'in')}
		aria-pressed={direction === 'in'}
	>
		{m.arcs_map_place_incoming()}
	</button>
	<button
		type="button"
		class="btn"
		class:btn-primary={direction === 'out'}
		class:btn-outline-secondary={direction !== 'out'}
		on:click={() => (direction = 'out')}
		aria-pressed={direction === 'out'}
	>
		{m.arcs_map_place_outgoing()}
	</button>
</div>

{#if loading}
	<div class="text-center py-3">
		<div class="spinner-border spinner-border-sm text-primary" role="status">
			<span class="visually-hidden">{m.loading()}</span>
		</div>
	</div>
{:else if error}
	<div class="alert alert-danger">{error}</div>
{:else if personas.length === 0}
	<div class="alert alert-info mb-0">{m.arcs_map_place_empty()}</div>
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
		<nav
			class="d-flex justify-content-center align-items-center gap-2 mt-2"
			aria-label={m.pagination()}
		>
			<button
				class="btn btn-sm btn-outline-secondary"
				disabled={currentPage <= 1}
				on:click={() => loadPage(currentPage - 1)}
				aria-label={m.previously()}
			>
				<i class="bi bi-chevron-left" aria-hidden="true"></i>
			</button>
			<span class="small text-muted"
				>{m.from_to({ currentPage })} {m.total_pages({ totalPages })}</span
			>
			<button
				class="btn btn-sm btn-outline-secondary"
				disabled={currentPage >= totalPages}
				on:click={() => loadPage(currentPage + 1)}
				aria-label={m.next_page()}
			>
				<i class="bi bi-chevron-right" aria-hidden="true"></i>
			</button>
		</nav>
	{/if}
{/if}
