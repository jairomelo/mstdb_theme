<script>
  import NetworkGraph from '../viz/NetworkGraph.svelte';
</script>

<svelte:head>
  <title>Red de Personas — Trayectorias Afro</title>
</svelte:head>

<div class="container-fluid py-4">
  <div class="row mb-3">
    <div class="col">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/Dashboard">Visualizaciones</a></li>
          <li class="breadcrumb-item active" aria-current="page">Red de personas</li>
        </ol>
      </nav>
    </div>
  </div>

  <div class="row mb-4">
    <div class="col-lg-8">
      <h1 class="display-5">Red de personas relacionadas</h1>
      <p class="lead text-muted">
        Grafo interactivo de relaciones entre personas esclavizadas y no esclavizadas, 
        con filtros por tipo de relación, centralidad y categoría de persona.
      </p>
      <dl class="row small text-muted mb-0">
        <dt class="col-sm-2">Fuente</dt>
        <dd class="col-sm-10">Base de datos MSTDB — Trayectorias Afro</dd>
        <dt class="col-sm-2">Datos</dt>
        <dd class="col-sm-10">Relaciones de asociación, familiares y temporales entre personas</dd>
      </dl>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <NetworkGraph />
    </div>
  </div>
</div>
