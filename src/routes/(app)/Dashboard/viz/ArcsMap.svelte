<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as d3 from 'd3';

  let L;
  let map;
  let loading = true;
  let error = null;

  const arcsDataUrl = '/temp/trayectorias_arcs.json';
  
  onMount(async () => {
    if (!browser) return;

    try {
      const leaflet = await import('leaflet');
      L = leaflet.default;

      map = L.map('map').setView([17.5, -96], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const svg = d3.select(map.getPanes().overlayPane).append("svg");

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

      const g = svg.append("g").attr("class", "leaflet-zoom-hide");

      const res = await fetch(arcsDataUrl, { mode: 'cors' });
      if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
      const arcs = await res.json();

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
            const [x1, y1] = projectPoint(d.from.lat, d.from.lon);
            const [x2, y2] = projectPoint(d.to.lat, d.to.lon);
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dr = Math.sqrt(dx * dx + dy * dy) * 0.6;
            return `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`;
          })
          .attr("stroke", "#004080")
          .attr("stroke-width", 1)
          .attr("fill", "none")
          .attr("opacity", 0.5)
          .attr("marker-end", "url(#arrowhead)");
      }

      update();
      map.on("zoomend moveend", update);
      loading = false;
    } catch (e) {
      console.error(e);
      error = e.message;
      loading = false;
    }
  });
</script>

<style>
  #map {
    width: 100%;
    height: 600px;
    border-radius: 0.5rem;
  }
  .error {
    color: red;
    margin-top: 1rem;
  }
</style>

{#if browser}
  <div id="map"></div>
  {#if loading}
    <p>Loading trajectory arcs...</p>
  {:else if error}
    <p class="error">Error loading arcs: {error}</p>
  {/if}
{/if}
