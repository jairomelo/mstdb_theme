<script>

    import { tooltip } from '$lib/tooltip.js';

	export let corp;

	function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}
	
</script>

<div class="list-group-item list-group-item-action">
    <div class="d-flex w-100 justify-content-between">
        <a href="/Detail/corporaciones/{corp.source.corporacion_id}"> <!-- TODO: Corporación detail view -->
        <h5 class="mb-1">{corp.source.nombre_institucion}</h5>
		</a>
	</div>
	<p class="mb-1">Tipo: {corp.source.tipo_institucion.tipo || 'Desconocido'}</p> <!-- TODO: Detail view of tipo institución-->
	<small>Ubicación: {corp.source.ubicacion || 'N/A'}</small>

	<div class="matches">
		{#each getHighlights(corp.highlight) as highlightText}
			<small>{@html highlightText}</small>
		{/each}
	</div>
</div>
