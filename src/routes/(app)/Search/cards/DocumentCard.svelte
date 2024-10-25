<script>
	export let item;

	function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}
	
</script>

<div class="list-group-item list-group-item-action">
	<div class="d-flex w-100 justify-content-between">
		<a href="/Detail/documentos/{item.id}">
			<h5 class="mb-1">{item.source.titulo || 'N/A'}</h5>
		</a>
		<small>{item.source.fecha_inicial || 'N/A'}{item.source.fecha_final && item.source.fecha_final !== item.source.fecha_inicial ? ` - ${item.source.fecha_final}` : ''}</small>
	</div>
	<p class="mb-1">
		{item.source.archivo.nombre_abreviado || 'No archivo'}
		{#if item.source.fondo}{item.source.fondo},{/if}
		{#if item.source.subfondo}{item.source.subfondo},{/if}
		{#if item.source.serie}{item.source.serie},{/if}
		{#if item.source.subserie}{item.source.subserie},{/if}
		{#if item.source.tipo_udc}{item.source.tipo_udc}.{/if}
		{#if item.source.unidad_documental_compuesta}{item.source.unidad_documental_compuesta}.{/if}
		{#if item.source.folio_final}ff. {item.source.folio_inicial}-{item.source.folio_final}{:else if item.source.folio_inicial}f. {item.source.folio_inicial}{/if}
	</p>
	<small>Identificador: {item.source.documento_idno || 'N/A'}</small>

	<div class="matches">
		{#each getHighlights(item.highlight) as highlightText}
			<small>{@html highlightText}</small>
		{/each}
	</div>
</div>