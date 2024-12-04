<script>
    import Card from './Card.svelte';
    import { getFilterConfigByValue } from '$conf/filters.js';
    import { tooltip } from '$lib/bootstrap-actions.js';

	export let item;

	// Get the icon class for this type
	const iconClass = getFilterConfigByValue(item.type)?.icon || 'bi-building';

	function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}
</script>

<Card {item}>
	<!-- Icon Slot -->
	<span slot="icon">
		<i class="bi {iconClass} fs-1 text-primary"></i>
	</span>

	<!-- Custom Title -->
	<span slot="title">
		{item.source.nombre_institucion}
	</span>

	<!-- Custom Header Info -->
	<span slot="header-info">
		{item.source.tipo_institucion.tipo || 'Tipo Desconocido'}
	</span>

	<!-- Custom Content -->
	<div class="corporation-info mt-2">
		<!-- Identifier -->
		<p class="mb-1">
			<small class="text-muted">ID: {item.source.corporacion_id || 'N/A'}</small>
		</p>

		<!-- Location -->
		{#if item.source.ubicacion}
			<p class="mb-1">
				<i class="bi bi-geo-alt me-1"></i>
				Ubicación: {item.source.ubicacion}
			</p>
		{/if}

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
	</div>
</Card>
