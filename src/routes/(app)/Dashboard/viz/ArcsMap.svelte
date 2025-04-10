<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as d3 from 'd3';

  let L;
  let map;
  let loading = true;
  let error = null;
  let datasetType = 'arcs';
  let arcs = [];

  let svg, g;

  function getDataUrl() {
    return datasetType === 'arcs'
      ? '/temp/trayectorias_arcs.json'
      : '/temp/trayectorias_aggregated.json';
  }

  async function loadData() {
    try {
      loading = true;
      const url = getDataUrl();
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${datasetType} data`);
      arcs = await res.json();
      update();
      loading = false;
    } catch (e) {
      console.error(e);
      error = e.message;
      loading = false;
    }
  }

  onMount(async () => {
    if (!browser) return;

    try {
      const leaflet = await import('leaflet');
      L = leaflet.default;

      map = L.map('map').setView([17.5, -96], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      svg = d3.select(map.getPanes().overlayPane).append("svg");

      const defs = svg.append("defs");
      defs.append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .attr("fill", "#004080")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

      g = svg.append("g").attr("class", "leaflet-zoom-hide");

      await loadData();
      map.on("zoomend moveend", update);
    } catch (e) {
      console.error(e);
      error = e.message;
      loading = false;
    }
  });

  function projectPoint(lat, lon) {
    const point = map.latLngToLayerPoint([lat, lon]);
    return [point.x, point.y];
  }

  function update() {
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

    svg
      .attr("width", bottomRight.x - topLeft.x)
      .attr("height", bottomRight.y - topLeft.y)
      .style("left", `${topLeft.x}px`)
      .style("top", `${topLeft.y}px`);

    g.attr("transform", `translate(${-topLeft.x},${-topLeft.y})`);

    g.selectAll("path").remove();

    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", d => {
        const from = d.from;
        const to = d.to;
        const [x1, y1] = projectPoint(from.lat, from.lon);
        const [x2, y2] = projectPoint(to.lat, to.lon);
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.6;
        return `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`;
      })
      .attr("stroke", datasetType === 'aggregated' ? "#ff6600" : "#004080")
      .attr("stroke-width", datasetType === 'aggregated' ? d => 1 + Math.log(d.count) : 1)
      .attr("fill", "none")
      .attr("opacity", datasetType === 'aggregated' ? 0.6 : 0.4)
      .attr("marker-end", datasetType === 'arcs' ? "url(#arrowhead)" : null);
  }
</script>


<style>
  .map-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .form-select {
    max-width: 300px;
  }

  #map {
    width: 100%;
    height: 600px;
    border-radius: 0.5rem;
    border: 1px solid var(--bs-border-color);
  }

  :global(svg path) {
    transition: opacity 0.2s ease;
  }

  :global(svg path:hover) {
    opacity: 0.8 !important;
  }
</style>

{#if browser}
  <div class="map-container card">
    <div class="card-body">
      <div class="map-controls mb-3">
        <label class="form-label d-flex align-items-center">
          <span class="me-2">Grupo de datos:</span>
          <select 
            class="form-select" 
            bind:value={datasetType} 
            on:change={loadData}
          >
            <option value="arcs">Trayectorias individuales</option>
            <option value="aggregated">Flujos agregados</option>
          </select>
        </label>
      </div>
      <div id="map"></div>
      {#if loading}
        <div class="text-center mt-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted mt-2">Cargando trayectorias...</p>
        </div>
      {:else if error}
        <div class="alert alert-danger mt-3" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          Error cargando trayectorias: {error}
        </div>
      {/if}
    </div>
  </div>
{/if}
