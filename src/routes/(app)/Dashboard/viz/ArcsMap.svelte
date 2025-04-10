<script>
    import { onMount } from 'svelte';
    import L from 'leaflet';
    import * as d3 from 'd3';
  
    let map;
  
    onMount(async () => {
      map = L.map('map').setView([17.5, -96], 6);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
  
      // Create an SVG layer
      const svg = d3.select(map.getPanes().overlayPane).append("svg");
      const g = svg.append("g").attr("class", "leaflet-zoom-hide");
  
      const res = await fetch('https://db.trayectoriasafro.org/static/mdb/data/trayectorias_arcs.json');
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
  
        // Clear existing arcs
        g.selectAll("path").remove();
  
        // Draw each arc
        g.selectAll("path")
          .data(arcs)
          .enter()
          .append("path")
          .attr("d", d => {
            const [x1, y1] = projectPoint(d.from.lat, d.from.lon);
            const [x2, y2] = projectPoint(d.to.lat, d.to.lon);
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dr = Math.sqrt(dx * dx + dy * dy) * 0.6; // curvature
            return `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`;
          })
          .attr("stroke", "#004080")
          .attr("stroke-width", 1)
          .attr("fill", "none")
          .attr("opacity", 0.5);
      }
  
      // Initial draw
      update();
  
      // Redraw on zoom/pan
      map.on("zoomend moveend", update);
    });
  </script>
  
  <style>
    #map {
      width: 100%;
      height: 600px;
    }
  </style>
  
  <div id="map"></div>
  