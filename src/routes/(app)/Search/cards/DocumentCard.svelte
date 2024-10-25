<script>
	import Card from './Card.svelte';
	import { getFilterConfigByValue } from '$conf/filters.js';
	export let item;
  
	// Get the icon class for this type
	const iconClass = getFilterConfigByValue(item.type)?.icon || 'bi-file-text';
  </script>
  
  <Card {item}>
	<!-- Icon Slot -->
	<span slot="icon">
	  <i class="bi {iconClass} fs-1 text-primary"></i>
	</span>
  
	<!-- Custom Title -->
	<span slot="title">
	  {item.source.titulo || 'N/A'}
	</span>
  
	<!-- Custom Header Info (dates) -->
	<span slot="header-info">
	  {item.source.fecha_inicial || 'N/A'}
	  {#if item.source.fecha_final && item.source.fecha_final !== item.source.fecha_inicial}
		- {item.source.fecha_final}
	  {/if}
	</span>
  
	<!-- Custom Content -->
	<div class="document-info mt-2">
	  <p class="mb-1 text-muted">
		<i class="bi bi-archive me-1"></i>
		{item.source.archivo.nombre_abreviado || 'No archivo'}
	  </p>
	  {#if item.source.fondo || item.source.subfondo || item.source.serie || item.source.subserie}
		<p class="mb-1">
		  {item.source.fondo}
		  {#if item.source.subfondo} / {item.source.subfondo}{/if}
		  {#if item.source.serie} / {item.source.serie}{/if}
		  {#if item.source.subserie} / {item.source.subserie}{/if}
		</p>
	  {/if}
	  {#if item.source.tipo_udc || item.source.unidad_documental_compuesta}
		<p class="mb-1">
		  {item.source.tipo_udc}
		  {#if item.source.unidad_documental_compuesta} / {item.source.unidad_documental_compuesta}{/if}
		</p>
	  {/if}
	  {#if item.source.folio_inicial}
		<p class="mb-1">
		  Folios:
		  {#if item.source.folio_final}
			{item.source.folio_inicial} - {item.source.folio_final}
		  {:else}
			{item.source.folio_inicial}
		  {/if}
		</p>
	  {/if}
	  <p class="mb-1">
		<small class="text-muted">Identificador: {item.source.documento_idno || 'N/A'}</small>
	  </p>
	</div>
  </Card>
  