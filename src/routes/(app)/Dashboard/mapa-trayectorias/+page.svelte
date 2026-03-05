<script>
  import ArcsMap from '../viz/ArcsMap.svelte';
</script>

<div class="container-fluid py-4">
  <div class="row mb-3">
    <div class="col">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/Dashboard">Visualizaciones</a></li>
          <li class="breadcrumb-item active" aria-current="page">Mapa de trayectorias</li>
        </ol>
      </nav>
    </div>
  </div>

  <div class="row mb-4">
    <div class="col-lg-8">
      <h1 class="display-5">Mapa de trayectorias</h1>
      <p class="lead text-muted">
        Visualización geográfica de las trayectorias de las personas esclavizadas 
        en Nueva España.
      </p>
      <dl class="row small text-muted mb-0">
        <dt class="col-sm-2">Fuente</dt>
        <dd class="col-sm-10">Base de datos MSTDB — Trayectorias Afro</dd>
        <dt class="col-sm-2">Datos</dt>
        <dd class="col-sm-10">Trayectorias individuales y flujos agregados entre lugares</dd>
      </dl>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <ArcsMap />
    </div>
  </div>
</div>
