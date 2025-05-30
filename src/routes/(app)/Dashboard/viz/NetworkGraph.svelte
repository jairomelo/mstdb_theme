<script>
  import { onMount, tick } from 'svelte';
  import cytoscape from 'cytoscape';
  import fcose from 'cytoscape-fcose';
    cytoscape.use(fcose);
  import { browser } from '$app/environment';

  let cy;
  let loading = true;
  let error = null;

  let layoutType = 'fcose';
  let personTypeFilter = 'all';

  let centralityThreshold = 0;
  let minCentrality = 0;
  let maxCentrality = 0;


    function applyLayout() {
    if (!cy) return;
    cy.layout({
        name: layoutType,
        animate: true,
        fit: true,
        padding: 30
    }).run();
    }

    function resetZoom() {
    if (cy) {
        cy.fit();
    }
    }

    function applyFilter() {
  if (!cy) return;

  cy.nodes().forEach(node => {
    const typeMatch = personTypeFilter === 'all' || node.data('type').toString() === personTypeFilter;
    const centralityMatch = node.data('centrality') >= centralityThreshold;
    const match = typeMatch && centralityMatch;
    node.style('display', match ? 'element' : 'none');
    });

  cy.edges().forEach(edge => {
    const source = cy.getElementById(edge.data('source'));
    const target = cy.getElementById(edge.data('target'));
    const visible = source.visible() && target.visible();
    edge.style('display', visible ? 'element' : 'none');
  });
}


  onMount(async () => {
    if (!browser) return;
    try {
      const res = await fetch('/temp/persona_network.json');
      if (!res.ok) throw new Error('Failed to load network data');
      const network = await res.json();

      await tick(); // Ensure DOM is ready before drawing
      drawNetwork(network);
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  function drawNetwork(data) {
  const container = document.getElementById('network');
  if (!container) {
    console.error('❌ #network container not found!');
    return;
  }

  console.log('✅ Drawing network in:', container);

  cy = cytoscape({
    container,
    elements: [...data.nodes, ...data.edges],
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'background-color': '#0074D9',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'width': 'mapData(centrality, 0, 0.1, 20, 60)',
          'height': 'mapData(centrality, 0, 0.1, 20, 60)',
          'font-size': '10px'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 1,
          'line-color': '#ccc',
          'curve-style': 'bezier',
          'target-arrow-shape': 'none',
          'label': 'data(relation)',
          'font-size': '8px',
          'color': '#666'
        }
      }
    ],
    layout: {
        name: layoutType,
        animate: true,
        randomize: true,
        fit: true,
        padding: 30,
        nodeSeparation: 100,
        nodeRepulsion: 4500,
        idealEdgeLength: 150,
        edgeElasticity: 0.1,
        gravity: 0.25,
        initialEnergyOnIncremental: 0.5
        }
  });

  const centralities = cy.nodes().map(n => n.data('centrality'));
  minCentrality = Math.min(...centralities);
  maxCentrality = Math.max(...centralities);
  centralityThreshold = minCentrality;
}

</script>

<style>
  #network {
    width: 100%;
    height: 600px;
    border-radius: 0.5rem;
    border: 1px solid var(--bs-border-color);
    background: white;
  }

  .hidden {
  display: none;
  }

  .form-select {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

    .btn-sm {
    font-size: 0.8rem;
    }
</style>

<div class="card">
  <div class="card-body">
    <h5 class="card-title">Red de personas relacionadas</h5>

    <div class="d-flex align-items-center mb-3 gap-3">

        <label class="form-label mb-0">Filtrar por tipo:</label>
  <select class="form-select w-auto" bind:value={personTypeFilter} on:change={applyFilter}>
    <option value="all">Todos</option>
    <option value="29">Esclavizada</option>
    <option value="30">No esclavizada</option>
  </select>

  <label class="form-label mb-0">Diseño:</label>
  <select class="form-select w-auto" bind:value={layoutType} on:change={applyLayout}>
    <option value="fcose">FCoSE</option>
    <option value="cose">CoSE</option>
    <option value="circle">Círculo</option>
    <option value="concentric">Concéntrico</option>
    <option value="grid">Cuadrícula</option>
  </select>

  <button class="btn btn-outline-primary btn-sm" on:click={resetZoom}>
    <i class="bi bi-arrows-fullscreen me-1"></i> Reenfocar
  </button>
</div>

    <div class="mb-3">
  <label class="form-label">Filtrar por centralidad:</label>
  <input type="range" min={minCentrality} max={maxCentrality} step="0.001" bind:value={centralityThreshold} on:input={applyFilter} class="form-range" />
  <small>Mostrando nodos con centralidad ≥ {centralityThreshold}</small>
</div>

    <!-- Always render the container -->
    <div id="network" class:hidden={loading || error}></div>

    {#if loading}
    <div class="text-center mt-3">
        <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted mt-2">Cargando red...</p>
    </div>
    {:else if error}
    <div class="alert alert-danger mt-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Error cargando red: {error}
    </div>
    {/if}


  </div>
</div>

