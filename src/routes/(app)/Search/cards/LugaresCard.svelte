<script>
	import Card from './Card.svelte';
	import { getFilterConfigByValue } from '$conf/filters.js';
	import { tooltip } from '$lib/bootstrap-actions.js';

	export let item;

	// Get the icon class for this type
	const iconClass = getFilterConfigByValue(item.type)?.icon || 'bi-geo-alt';

	function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}

	// Related persons are inlined by the search API (no per-card XHR fan-out).
	$: preview = item.source.personas_preview || { total: 0, personas: [] };

	function personaModel(persona) {
		return persona.persona_model === 'personanoesclavizada'
			? 'personanoesclavizada'
			: 'personaesclavizada';
	}
</script>

<Card {item}>
	<!-- Icon Slot -->
	<span slot="icon">
		<i class="bi {iconClass} fs-1 text-primary"></i>
	</span>

	<!-- Custom Title -->
	<span slot="title">
		{item.source.nombre_lugar}
	</span>

	<!-- Custom Header Info -->
	<span slot="header-info">
		{#if item.source.tipo}({item.source.tipo}){/if}
	</span>

	<!-- Custom Content -->
	<div class="place-info mt-2">
		<!-- Identifier -->
		<p class="mb-1">
			<small class="text-muted">ID: {item.source.lugar_id || 'N/A'}</small>
		</p>

		<!-- Highlights -->
		{#if getHighlights(item.highlight).length > 0}
			<div class="highlights mt-2">
				<p class="mb-1 fw-bold">
					<i class="bi bi-search me-2"></i>Coincidencias:
				</p>
				<ul class="list-unstyled mb-0">
					{#each getHighlights(item.highlight).slice(0, 3) as highlightText}
						<li>
							<small>{@html highlightText}</small>
						</li>
					{/each}
					{#if getHighlights(item.highlight).length > 3}
						<li><small>y {getHighlights(item.highlight).length - 3} más...</small></li>
					{/if}
				</ul>
			</div>
		{/if}

		<!-- Related Persons -->
		{#if preview.total > 0}
			<div class="related-persons mt-3">
				<p class="mb-1 fw-bold">
					<i class="bi bi-people me-2"></i>Personas relacionadas ({preview.total}):
				</p>
				<ul class="list-unstyled mb-0">
					{#each preview.personas as persona}
						<li>
							<a
								href="/Detail/{personaModel(persona)}/{persona.persona_id}"
								class="text-decoration-none"
							>
								{persona.nombre_normalizado}
							</a>
						</li>
					{/each}
					{#if preview.total > preview.personas.length}
						<li>
							<a href="/Detail/lugar/{item.source.lugar_id}" class="text-decoration-none">
								<small>y {preview.total - preview.personas.length} más...</small>
							</a>
						</li>
					{/if}
				</ul>
			</div>
		{/if}
	</div>
</Card>
