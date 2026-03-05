<script>
  import PlacePeople from '../viz/PlacePeople.svelte';
</script>

<div class="container-fluid py-4">
  <div class="row mb-3">
    <div class="col">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/Dashboard">Visualizaciones</a></li>
          <li class="breadcrumb-item active" aria-current="page">Personas por lugar</li>
        </ol>
      </nav>
    </div>
  </div>

  <div class="row mb-4">
    <div class="col-lg-8">
      <h1 class="display-5">Personas por lugar</h1>
      <p class="lead text-muted">
        Distribución geográfica de personas esclavizadas por ubicación, con vistas 
        estática y dinámica para explorar patrones espaciales a lo largo del tiempo.
      </p>
      <dl class="row small text-muted mb-0">
        <dt class="col-sm-2">Fuente</dt>
        <dd class="col-sm-10">Base de datos MSTDB — Trayectorias Afro</dd>
        <dt class="col-sm-2">Datos</dt>
        <dd class="col-sm-10">Conteo de personas asociadas a cada lugar registrado</dd>
      </dl>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <PlacePeople />
    </div>
  </div>
</div>
