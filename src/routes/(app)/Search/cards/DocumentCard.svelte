<script>
	export let doc;

	function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}
	
</script>

<div class="list-group-item list-group-item-action">
	<div class="d-flex w-100 justify-content-between">
		<a href="/Detail/documentos/{doc.id}">
			<h5 class="mb-1">{doc.source.titulo || 'N/A'}</h5>
		</a>
		<small>{doc.source.fecha_inicial || 'N/A'}{doc.source.fecha_final && doc.source.fecha_final !== doc.source.fecha_inicial ? ` - ${doc.source.fecha_final}` : ''}</small>
	</div>
	<p class="mb-1">
		{doc.source.archivo.nombre_abreviado || 'No archivo'}
		{#if doc.source.fondo}{doc.source.fondo},{/if}
		{#if doc.source.subfondo}{doc.source.subfondo},{/if}
		{#if doc.source.serie}{doc.source.serie},{/if}
		{#if doc.source.subserie}{doc.source.subserie},{/if}
		{#if doc.source.tipo_udc}{doc.source.tipo_udc}.{/if}
		{#if doc.source.unidad_documental_compuesta}{doc.source.unidad_documental_compuesta}.{/if}
		{#if doc.source.folio_final}ff. {doc.source.folio_inicial}-{doc.source.folio_final}{:else if doc.source.folio_inicial}f. {doc.source.folio_inicial}{/if}
	</p>
	<small>Identificador: {doc.source.documento_idno || 'N/A'}</small>

	<div class="matches">
		{#each getHighlights(doc.highlight) as highlightText}
			<small>{@html highlightText}</small>
		{/each}
	</div>
</div>