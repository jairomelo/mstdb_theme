<script>
  import { onMount } from 'svelte';
  import { archivos as archivosData, estados, elaboracion } from '$conf/archivos';
  import { archivos as fetchArchivos } from '$lib/api';
  import { goto } from '$app/navigation';

  /** Map archivo_id → live documento_count from the API */
  let counts = {};
  let countsLoaded = false;

  onMount(async () => {
    try {
      const resp = await fetchArchivos();
      const list = resp.results || resp;
      for (const a of list) {
        counts[a.archivo_id] = a.documento_count ?? 0;
      }
      countsLoaded = true;
    } catch (e) {
      console.warn('Could not fetch live archive counts:', e);
    }
  });

  /** Toggle state for collapsible sections per archive index */
  let expanded = {};
  function toggle(idx) {
    expanded[idx] = !expanded[idx];
  }

  /** Group archives by estado, preserving document order */
  $: grouped = estados.map(estado => ({
    estado,
    items: archivosData
      .map((a, i) => ({ ...a, _idx: i }))
      .filter(a => a.estado === estado),
  }));

  function explorar(archivoId) {
    goto(`/Search/?archivo_id=${archivoId}`);
  }
</script>

<svelte:head>
  <title>Archivos — Trayectorias Afro</title>
</svelte:head>

<div class="container mt-4">
  <!-- Hero -->
  <div class="archivos-hero mb-5 text-center">
    <h1 class="display-4 mb-3">Archivos</h1>
    <p class="lead hero-sub mb-0">
      Archivos con documentación incluida en la base de datos
    </p>
    <div class="divider mx-auto"></div>
  </div>

  <div class="row justify-content-center">
    <div class="col-lg-10">

      {#each grouped as group}
        <section class="estado-section mb-5">
          <h2 class="estado-title">
            <i class="bi bi-geo-alt-fill me-2"></i>{group.estado}
          </h2>

          {#each group.items as archivo}
            <div class="archivo-card mb-4">
              <div class="card-header-row">
                <div>
                  <h3 class="archivo-name">{archivo.nombre}</h3>
                  <span class="badge bg-muted">{archivo.nombre_abreviado}</span>
                </div>

                {#if archivo.archivo_id != null && countsLoaded}
                  <span class="doc-count" title="Documentos en la base de datos">
                    <i class="bi bi-file-earmark-text me-1"></i>
                    {counts[archivo.archivo_id] ?? '—'} documentos
                  </span>
                {/if}
              </div>

              <div class="archivo-meta">
                <p class="meta-line">
                  <i class="bi bi-pin-map me-1"></i>{archivo.direccion}
                </p>
                <p class="meta-line">
                  <i class="bi bi-person me-1"></i><strong>Participante:</strong> {archivo.participante}
                </p>
              </div>

              <!-- Description (always visible) -->
              <div class="archivo-desc">
                {#each archivo.descripcion.split('\n\n') as paragraph}
                  <p>{paragraph}</p>
                {/each}
              </div>

              <!-- Collapsible: catalogues, informes, links -->
              {#if archivo.catalogos.length || archivo.informes.length || archivo.enlaces.length}
                <button
                  class="btn btn-sm btn-toggle"
                  on:click={() => toggle(archivo._idx)}
                  aria-expanded={!!expanded[archivo._idx]}
                >
                  {expanded[archivo._idx] ? 'Ocultar' : 'Ver'} catálogos, índices y enlaces
                  <i class="bi" class:bi-chevron-up={expanded[archivo._idx]} class:bi-chevron-down={!expanded[archivo._idx]}></i>
                </button>

                {#if expanded[archivo._idx]}
                  <div class="collapsible-content mt-3">
                    {#if archivo.catalogos.length}
                      <h4 class="ref-heading">Catálogos e índices</h4>
                      <ul class="ref-list">
                        {#each archivo.catalogos as entry}
                          <li>{entry}</li>
                        {/each}
                      </ul>
                    {/if}

                    {#if archivo.informes.length}
                      <h4 class="ref-heading">Informes y publicaciones</h4>
                      <ul class="ref-list">
                        {#each archivo.informes as entry}
                          <li>{entry}</li>
                        {/each}
                      </ul>
                    {/if}

                    {#if archivo.enlaces.length}
                      <h4 class="ref-heading">Enlaces</h4>
                      <ul class="ref-list link-list">
                        {#each archivo.enlaces as link}
                          <li>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.label} <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                          </li>
                        {/each}
                      </ul>
                    {/if}
                  </div>
                {/if}
              {/if}

              <!-- Action button -->
              {#if archivo.archivo_id != null}
                <div class="mt-3">
                  <button
                    class="btn btn-explore"
                    on:click={() => explorar(archivo.archivo_id)}
                  >
                    <i class="bi bi-search me-1"></i>Explorar documentos
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </section>
      {/each}

      <!-- Attribution -->
      <div class="attribution text-center mt-5 mb-4">
        <p>
          <a href={elaboracion.url} target="_blank" rel="noopener noreferrer">
            {elaboracion.text}
          </a>
        </p>
      </div>

    </div>
  </div>
</div>

<style>
  /* Hero */
  .archivos-hero {
    padding: 4rem 0;
    background-image: url('/media/rutas_project2.webp');
    background-size: cover;
    background-position: center;
    color: white;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  }

  .archivos-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.55);
    border-radius: 8px;
  }

  .archivos-hero > * {
    position: relative;
    z-index: 1;
  }
  .hero-sub {
    color: rgba(255,255,255,0.85);
    font-size: 1.15rem;
  }
  .divider {
    width: 60px;
    height: 3px;
    background-color: white;
    margin: 1.5rem auto 0;
  }

  /* State group */
  .estado-title {
    color: var(--text-primary);
    font-family: 'eb-garamond', serif;
    font-size: 1.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--text-primary);
    margin-bottom: 1.5rem;
  }

  /* Archive card */
  .archivo-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: box-shadow 0.3s ease;
  }
  .archivo-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .archivo-name {
    color: var(--text-primary);
    font-family: 'eb-garamond', serif;
    font-size: 1.35rem;
    margin-bottom: 0.25rem;
  }

  .badge.bg-muted {
    background-color: #e2d5ce;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.8rem;
  }

  .doc-count {
    font-size: 0.9rem;
    color: #555;
    white-space: nowrap;
  }

  /* Meta */
  .archivo-meta {
    font-size: 0.92rem;
    color: #555;
    margin-bottom: 0.75rem;
  }
  .meta-line {
    margin-bottom: 0.25rem;
  }

  /* Description */
  .archivo-desc {
    font-size: 0.95rem;
    line-height: 1.65;
  }
  .archivo-desc p {
    margin-bottom: 0.75rem;
  }

  /* Toggle */
  .btn-toggle {
    border: 1px solid var(--text-primary);
    color: var(--text-primary);
    font-size: 0.85rem;
    transition: background-color 0.2s;
  }
  .btn-toggle:hover {
    background-color: var(--text-primary);
    color: white;
  }

  /* Collapsible refs */
  .ref-heading {
    color: var(--text-primary);
    font-family: 'eb-garamond', serif;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  .ref-list {
    padding-left: 1.25rem;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .ref-list li {
    margin-bottom: 0.4rem;
  }
  .link-list a {
    color: var(--text-primary);
    text-decoration: none;
  }
  .link-list a:hover {
    text-decoration: underline;
  }

  /* Explore button */
  .btn-explore {
    background-color: var(--text-primary);
    color: white;
    border: none;
    font-size: 0.9rem;
    padding: 0.4rem 1rem;
    border-radius: 4px;
    transition: opacity 0.2s;
  }
  .btn-explore:hover {
    opacity: 0.85;
    color: white;
  }

  /* Attribution */
  .attribution {
    font-size: 0.9rem;
    color: #666;
  }
  .attribution a {
    color: var(--text-primary);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .archivos-hero {
      padding: 2rem 0;
    }
    .estado-title {
      font-size: 1.5rem;
    }
    .card-header-row {
      flex-direction: column;
    }
  }
</style>
