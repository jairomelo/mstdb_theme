<!-- src/routes/(app)/Search/cards/PersonasEsclavizadasCard.svelte -->

<script>
    import Card from './Card.svelte';
    import { getFilterConfigByValue } from '$conf/filters.js';
    import { personaLugarRel, personaPersonasRel } from '$lib/api';
    import { tooltip } from '$lib/tooltip.js';
  
    export let item;
  
    // Get the icon class for this type
    const iconClass = getFilterConfigByValue(item.type)?.icon || 'bi-person';
  
    // Asynchronous data fetching
    async function fetchPersonaLugarRels(relationIds) {
      return Promise.all(relationIds.map(id => personaLugarRel(id)));
    }
  
    async function fetchPersonaPersonasRels(relationIds) {
      return Promise.all(relationIds.map(id => personaPersonasRel(id)));
    }
  
    let personaLugarRelsPromise = fetchPersonaLugarRels(item.source.persona_lugar_rel || []);
    let personaPersonasRelsPromise = fetchPersonaPersonasRels(item.source.persona_x_persona_rel || []);
  </script>
  
  <Card {item}>
    <!-- Icon Slot -->
    <span slot="icon">
      <i class="bi {iconClass} fs-1 text-primary"></i>
    </span>
  
    <!-- Custom Title -->
    <span slot="title">
      {item.source.nombre_normalizado}
    </span>
  
    <!-- Custom Header Info -->
    <span slot="header-info">
      {#if item.source.fecha_nacimiento || item.source.fecha_defuncion}
        ({item.source.fecha_nacimiento || ''})
      {/if}
    </span>
  
    <!-- Custom Content -->
    <div class="person-info mt-2">
      <!-- Identifier -->
      <p class="mb-1">
        <small class="text-muted">ID: {item.source.persona_idno || 'N/A'}</small>
      </p>
  
      <!-- Gender and Age -->
      {#if item.source.sexo || item.source.edad}
        <p class="mb-1">
          {#if item.source.sexo}
            <i class="bi bi-gender-{item.source.sexo.toLowerCase()} me-1"></i>
            {item.source.sexo}
          {/if}
          {#if item.source.edad}
            <span class="ms-2">
              <i class="bi bi-calendar3 me-1"></i>
              {item.source.edad} años
            </span>
          {/if}
        </p>
      {/if}
  
      <!-- Origin -->
      {#if item.source.procedencia}
        <p class="mb-1">
          <i class="bi bi-geo-alt me-1"></i>
          Procedencia: {item.source.procedencia.nombre_lugar || 'Desconocida'}
        </p>
      {/if}
  
      <!-- Associated Documents -->
      {#if item.source.documentos && item.source.documentos.length > 0}
        <div class="associated-documents mt-2">
          <p class="mb-1 fw-bold">
            <i class="bi bi-file-earmark-text me-2"></i>Documentos Asociados:
          </p>
          <ul class="list-unstyled mb-0">
            {#each item.source.documentos.slice(0, 3) as doc}
              <li>
                <a
                  href="/Detail/documento/{doc.documentopk}"
                  class="text-decoration-none"
                  use:tooltip={{ title: doc.documento_idno, trigger: 'hover' }}
                >
                  {doc.titulo.length > 50 ? doc.titulo.substring(0, 50) + '...' : doc.titulo}
                  <i class="bi bi-box-arrow-up-right ms-1"></i>
                </a>
              </li>
            {/each}
            {#if item.source.documentos.length > 3}
              <li><small>y {item.source.documentos.length - 3} más...</small></li>
            {/if}
          </ul>
        </div>
      {:else}
        <p class="mb-1"><small>No hay documentos asociados a esta persona.</small></p>
      {/if}
  
      <!-- Asynchronous Data: Related Places -->
      {#if item.source.persona_lugar_rel && item.source.persona_lugar_rel.length > 0}
        <div class="related-places mt-3">
          <p class="mb-1 fw-bold">
            <i class="bi bi-geo-alt me-2"></i>Lugares Transitados:
          </p>
          {#await personaLugarRelsPromise}
            <p><small>Cargando lugares...</small></p>
          {:then lugaresInfo}
            <ul class="list-unstyled mb-0">
              {#each lugaresInfo.slice(0, 3) as lugarRel, index}
                <li>
                  <a
                    href="/Detail/lugar/{lugarRel.lugar.lugar_id}"
                    class="text-decoration-none"
                  >
                    {lugarRel.lugar.nombre_lugar} ({lugarRel.lugar.tipo})
                  </a>
                  <small class="text-muted"> [{lugarRel.documento.fecha_inicial_raw}]</small>
                </li>
              {/each}
              {#if lugaresInfo.length > 3}
                <li><small>y {lugaresInfo.length - 3} más...</small></li>
              {/if}
            </ul>
          {:catch error}
            <p><small>Error al cargar los lugares: {error.message}</small></p>
          {/await}
        </div>
      {/if}
  
      <!-- Asynchronous Data: Related Persons -->
      {#if item.source.persona_x_persona_rel && item.source.persona_x_persona_rel.length > 0}
        <div class="related-persons mt-3">
          <p class="mb-1 fw-bold">
            <i class="bi bi-people me-2"></i>Personas Relacionadas:
          </p>
          {#await personaPersonasRelsPromise}
            <p><small>Cargando relaciones...</small></p>
          {:then relacionesInfo}
            <ul class="list-unstyled mb-0">
              {#each relacionesInfo.slice(0, 3) as relacion}
                {#each relacion.personas as personas}
                  {#if personas.persona_idno != item.source.persona_idno}
                    <li>
                      <a
                        href="/Detail/{personas.polymorphic_ctype == 29 ? 'personaesclavizada' : 'personanoesclavizada'}/{personas.persona_id}"
                        class="text-decoration-none"
                      >
                        {personas.nombre_normalizado}
                      </a>
                      <span
                        class="text-muted"
                        use:tooltip={{ title: relacion.descripcion_relacion, trigger: 'hover' }}
                      >
                        <i class="bi bi-info-circle ms-1"></i>
                      </span>
                    </li>
                  {/if}
                {/each}
              {/each}
              {#if relacionesInfo.length > 3}
                <li><small>y {relacionesInfo.length - 3} más...</small></li>
              {/if}
            </ul>
          {:catch error}
            <p><small>Error al cargar las relaciones: {error.message}</small></p>
          {/await}
        </div>
      {/if}
    </div>
  </Card>
  