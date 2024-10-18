<script>
	export let doc;
</script>

<div class="list-group-item list-group-item-action">
	<div class="d-flex w-100 justify-content-between">
		<a href="/Detail/documentos/{doc.documento_id}">
			<h5 class="mb-1">{doc.titulo}</h5>
		</a>
		<small>{doc.fecha_inicial_raw || 'N/A'}{doc.fecha_final_raw && doc.fecha_final_raw !== doc.fecha_inicial_raw ? ` - ${doc.fecha_final_raw}` : ''}</small>
	</div>
	<p class="mb-1">
		{doc.archivo.nombre_abreviado || 'No archivo'}
		{#if doc.fondo}{doc.fondo},{/if}
		{#if doc.subfondo}{doc.subfondo},{/if}
		{#if doc.serie}{doc.serie},{/if}
		{#if doc.subserie}{doc.subserie},{/if}
		{#if doc.tipo_udc}{doc.tipo_udc}.{/if}
		{#if doc.unidad_documental_compuesta}{doc.unidad_documental_compuesta}.{/if}
		{#if doc.folio_final}ff. {doc.folio_inicial}-{doc.folio_final}{:else if doc.folio_inicial}f. {doc.folio_inicial}{/if}
	</p>
	<small>Identificador: {doc.documento_idno || 'N/A'}</small>
</div>