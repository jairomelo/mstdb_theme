<script>
  import { onMount, tick } from 'svelte';
  import cytoscape from 'cytoscape';
  import { browser } from '$app/environment';

  let cy;
  let loading = true;
  let error = null;

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
      name: 'cose',
      animate: true
    }
  });
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
</style>

<div class="card">
  <div class="card-body">
    <h5 class="card-title">Red de personas relacionadas</h5>

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

