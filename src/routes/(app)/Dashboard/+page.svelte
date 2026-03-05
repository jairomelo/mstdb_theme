<script>
  const visualizations = [
    {
      slug: 'mapa-trayectorias',
      title: 'Mapa de trayectorias',
      description: 'Visualización geográfica de las rutas y desplazamientos forzados de personas esclavizadas, con arcos individuales y flujos agregados sobre un mapa histórico.',
      icon: 'bi-map',
      color: '#004080'
    },
    {
      slug: 'personas-por-lugar',
      title: 'Personas por lugar',
      description: 'Distribución de personas esclavizadas por ubicación geográfica, con vistas estática y dinámica para explorar patrones espaciales.',
      icon: 'bi-geo-alt',
      color: '#2d6a4f'
    },
    {
      slug: 'red-de-personas',
      title: 'Red de personas relacionadas',
      description: 'Grafo interactivo de relaciones entre personas esclavizadas y no esclavizadas, con filtros por tipo de relación, centralidad y tipo de persona.',
      icon: 'bi-diagram-3',
      color: '#6a040f'
    }
  ];
</script>

<div class="container-fluid py-4">
  <div class="row mb-4">
    <div class="col">
      <h1 class="display-5 mb-0">Visualizaciones</h1>
      <p class="text-muted mt-2">Exploraciones visuales de los datos de la base de datos de trayectorias.</p>
    </div>
  </div>

  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {#each visualizations as viz}
      <div class="col">
        <a href="/Dashboard/{viz.slug}" class="text-decoration-none">
          <div class="card h-100 viz-card">
            <div class="viz-card-thumbnail d-flex align-items-center justify-content-center" style="background-color: {viz.color}10; border-bottom: 2px solid {viz.color}30;">
              <i class="bi {viz.icon}" style="font-size: 3.5rem; color: {viz.color};"></i>
            </div>
            <div class="card-body">
              <h5 class="card-title">{viz.title}</h5>
              <p class="card-text text-muted">{viz.description}</p>
            </div>
            <div class="card-footer bg-transparent border-0 text-end">
              <span class="btn btn-sm btn-outline-primary">
                Ver visualización <i class="bi bi-arrow-right ms-1"></i>
              </span>
            </div>
          </div>
        </a>
      </div>
    {/each}
  </div>
</div>
  