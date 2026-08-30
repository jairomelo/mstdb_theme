<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';
	import { aggregatedTrajectories } from '$lib/api';
	import RouteDetailPanel from '../../Search/RouteDetailPanel.svelte';
	import config from '../../../../config';

	const ARC_COLOR = '#ff6600';
	const MARKER_FILL = '#2980b9';
	const MARKER_STROKE = '#1a5276';
	const PARTICLE_COLOR = '#d9480f';
	const PARTICLE_CAP = 80;
	const TRAVEL_MS = 2600;
	const BUCKET_MS = 1300;

	let L = null;
	let map = null;
	let svg = null;
	let gRoot = null,
		gArcs = null,
		gMarkers = null,
		gParticles = null;
	let mapContainer;
	let mapFrame;
	let modalEl;

	let loading = true;
	let error = null;
	let routes = [];
	let places = [];
	let meta = { min_year: null, max_year: null, undated_count: 0 };

	let routeLimit = 250;
	let origin = '';
	let destination = '';
	let startYear = '';
	let endYear = '';

	function yearToDate(year, day) {
		const y = String(year ?? '').trim();
		return /^\d{4}$/.test(y) ? `${y}-${day}` : '';
	}

	$: startDate = yearToDate(startYear, '01-01');
	$: endDate = yearToDate(endYear, '12-31');

	let mode = 'timeline';
	let granularity = 5;
	let speed = 1;
	let playing = false;
	let playhead = 0;

	let selectedRoute = null;
	let lastFocusedArc = null;

	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipData = null;

	const prefersReducedMotion =
		browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	$: activeFilters = {
		...(startDate ? { fecha_inicial__gte: startDate } : {}),
		...(endDate ? { fecha_inicial__lte: endDate } : {})
	};

	$: visibleRoutes = routes
		.filter(
			(route) =>
				(!origin || route.from_lugar_id === Number(origin)) &&
				(!destination || route.to_lugar_id === Number(destination))
		)
		.sort((a, b) => b.count - a.count)
		.slice(0, routeLimit);

	$: maxCount = Math.max(1, ...visibleRoutes.map((route) => route.count));

	$: buildBuckets(meta, granularity);

	function buildBuckets(m, g) {
		const list = [];
		if (m.min_year != null && m.max_year != null) {
			const start = Math.floor(m.min_year / g) * g;
			const end = Math.floor(m.max_year / g) * g;
			for (let year = start; year <= end; year += g) {
				list.push({ key: year, label: g === 1 ? String(year) : `${year}–${year + g - 1}` });
			}
		}
		buckets = list;
		if (playhead >= buckets.length) playhead = 0;
	}

	let buckets = [];
	$: bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));

	$: series = computeSeries(visibleRoutes, buckets, bucketIndex, granularity, places);

	function computeSeries(routesList, bucketsList, indexMap, g, placesList) {
		const n = bucketsList.length;
		const routeSeries = new Map();
		const placeIn = new Map();
		const placeOut = new Map();
		for (const place of placesList) {
			placeIn.set(place.lugar_id, new Array(n).fill(0));
			placeOut.set(place.lugar_id, new Array(n).fill(0));
		}
		for (const route of routesList) {
			const period = new Array(n).fill(0);
			if (route.years) {
				for (const [yearStr, count] of Object.entries(route.years)) {
					const idx = indexMap.get(Math.floor(Number(yearStr) / g) * g);
					if (idx !== undefined) period[idx] += count;
				}
			}
			const cum = prefixSums(period);
			routeSeries.set(routeKey(route), { period, cum });
			const inArr = placeIn.get(route.to_lugar_id);
			const outArr = placeOut.get(route.from_lugar_id);
			for (let i = 0; i < n; i++) {
				if (inArr) inArr[i] += period[i];
				if (outArr) outArr[i] += period[i];
			}
		}
		const placeCum = new Map();
		for (const place of placesList) {
			const inCum = prefixSums(placeIn.get(place.lugar_id) || []);
			const outCum = prefixSums(placeOut.get(place.lugar_id) || []);
			placeCum.set(place.lugar_id, {
				in: inCum,
				out: outCum,
				total: inCum.map((v, i) => v + (outCum[i] || 0))
			});
		}
		return { routeSeries, placeCum };
	}

	function prefixSums(arr) {
		const out = new Array(arr.length);
		let acc = 0;
		for (let i = 0; i < arr.length; i++) {
			acc += arr[i];
			out[i] = acc;
		}
		return out;
	}

	function routeKey(route) {
		return `${route.from_lugar_id}->${route.to_lugar_id}`;
	}

	function routeCumAt(route, idx) {
		const s = series.routeSeries.get(routeKey(route));
		return s && idx < s.cum.length ? s.cum[idx] : 0;
	}

	function routePeriodAt(route, idx) {
		const s = series.routeSeries.get(routeKey(route));
		return s && idx < s.period.length ? s.period[idx] : 0;
	}

	function placeCumAt(place, idx) {
		const s = series.placeCum.get(place.lugar_id);
		return s && idx < s.total.length ? s.total[idx] : 0;
	}

	$: maxCumTotal = Math.max(
		1,
		...visibleRoutes.map((route) => {
			const s = series.routeSeries.get(routeKey(route));
			return s && s.cum.length ? s.cum[s.cum.length - 1] : 0;
		})
	);

	$: maxPlaceCum = Math.max(
		1,
		...places.map((place) => {
			const s = series.placeCum.get(place.lugar_id);
			return s && s.total.length ? s.total[s.total.length - 1] : 0;
		})
	);

	$: currentBucketLabel = buckets[playhead]
		? granularity === 1
			? `Año: ${buckets[playhead].label}`
			: `Periodo: ${buckets[playhead].label}`
		: '—';

	function defaultRouteLimit(total) {
		const max = Math.max(10, total);
		return Math.min(Math.max(10, Math.round(total / 2 / 10) * 10), max);
	}

	async function loadData() {
		loading = true;
		error = null;
		try {
			const params = { include_timeline: 1 };
			if (startDate) params.fecha_inicial__gte = startDate;
			if (endDate) params.fecha_inicial__lte = endDate;
			const data = await aggregatedTrajectories(params);
			routes = data.routes || [];
			routeLimit = defaultRouteLimit(routes.length);
			places = data.places || [];
			meta = {
				min_year: data.min_year ?? null,
				max_year: data.max_year ?? null,
				undated_count: data.undated_count ?? 0
			};
			playhead = 0;
			playing = false;
		} catch (e) {
			console.error(e);
			error = e.message || 'Error desconocido';
		} finally {
			loading = false;
			if (mode === 'timeline' && meta.min_year != null && !error) {
				playing = true;
			}
		}
	}

	onMount(async () => {
		if (!browser) return;

		try {
			const leaflet = await import('leaflet');
			L = leaflet.default;

			map = L.map(mapContainer).setView([17.5, -96], 6);
			L.tileLayer(`${config.apiBaseUrl}tiles/light_nolabels/{z}/{x}/{y}.png`, {
				attribution: '©OpenStreetMap, ©CartoDB',
				maxZoom: 8
			}).addTo(map);

			svg = d3.select(map.getPanes().overlayPane).append('svg');
			gRoot = svg.append('g').attr('class', 'leaflet-zoom-hide');
			gArcs = gRoot.append('g');
			gMarkers = gRoot.append('g');
			gParticles = gRoot.append('g');

			await loadData();
			map.on('zoomend moveend', renderScene);
		} catch (e) {
			console.error(e);
			error = e.message;
			loading = false;
		}
	});

	onDestroy(() => {
		stopPlaybackTimer();
		stopParticleLoop();
		if (map) {
			map.remove();
			map = null;
		}
	});

	// ------------------------------------------------------------------
	// Geometry
	// ------------------------------------------------------------------

	function projectPoint(lat, lon) {
		const point = map.latLngToLayerPoint([lat, lon]);
		return [point.x, point.y];
	}

	function arcGeometry(route) {
		const [x1, y1] = projectPoint(route.from_lat, route.from_lon);
		const [x2, y2] = projectPoint(route.to_lat, route.to_lon);
		const dx = x2 - x1;
		const dy = y2 - y1;
		const dist = Math.hypot(dx, dy) || 1;
		const bend = Math.min(80, dist * 0.25);
		return {
			p0: [x1, y1],
			pc: [(x1 + x2) / 2 - (dy / dist) * bend, (y1 + y2) / 2 + (dx / dist) * bend],
			p1: [x2, y2]
		};
	}

	function arcPathD(route) {
		const { p0, pc, p1 } = arcGeometry(route);
		return `M ${p0[0]},${p0[1]} Q ${pc[0]},${pc[1]} ${p1[0]},${p1[1]}`;
	}

	function bezierPoint(t, p0, pc, p1) {
		const u = 1 - t;
		return [
			u * u * p0[0] + 2 * u * t * pc[0] + t * t * p1[0],
			u * u * p0[1] + 2 * u * t * pc[1] + t * t * p1[1]
		];
	}

	// ------------------------------------------------------------------
	// Rendering (d3 data-joins, no full rebuild per tick)
	// ------------------------------------------------------------------

	$: ready = Boolean(browser && map && svg && !loading);
	$: if (ready) renderScene(mode, visibleRoutes, series, playhead);

	function renderScene() {
		if (!map || !svg || !gRoot) return;
		layoutSvg();
		renderArcs();
		renderMarkers();
		rebuildParticles();
	}

	function layoutSvg() {
		const bounds = map.getBounds();
		const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
		const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());
		svg
			.attr('width', bottomRight.x - topLeft.x)
			.attr('height', bottomRight.y - topLeft.y)
			.style('left', `${topLeft.x}px`)
			.style('top', `${topLeft.y}px`);
		gRoot.attr('transform', `translate(${-topLeft.x},${-topLeft.y})`);
	}

	function renderArcs() {
		if (!gArcs) return;
		const sel = gArcs.selectAll('path.map-arc').data(visibleRoutes, (d) => routeKey(d));

		sel.exit().remove();

		const enter = sel
			.enter()
			.append('path')
			.attr('class', 'map-arc leaflet-interactive')
			.attr('fill', 'none')
			.attr('stroke', ARC_COLOR)
			.attr('stroke-linecap', 'round')
			.attr('opacity', 0)
			.attr('tabindex', 0)
			.attr('role', 'img')
			.on('pointerenter', onArcPointerEnter)
			.on('pointermove', onPointerMove)
			.on('pointerleave', hideTooltip)
			.on('focus', onArcFocus)
			.on('blur', hideTooltip)
			.on('click', onArcActivate)
			.on('keydown', onArcKeydown);

		const merged = enter.merge(sel);
		merged.attr('d', arcPathD).attr('aria-label', arcAriaLabel);

		merged
			.transition('tl')
			.duration(220)
			.attr('stroke-width', arcWidth)
			.attr('opacity', arcOpacity);
	}

	function arcWidth(route) {
		if (mode === 'static') return Math.max(2, Math.log(route.count + 1) * 3);
		const cum = routeCumAt(route, playhead);
		return cum > 0 ? Math.max(1.5, Math.log(cum + 1) * 3) : 1;
	}

	function arcOpacity(route) {
		if (mode === 'static') return 0.3 + 0.5 * (route.count / maxCount);
		const cum = routeCumAt(route, playhead);
		return cum > 0 ? 0.3 + 0.55 * (cum / maxCumTotal) : 0.06;
	}

	function arcAriaLabel(route) {
		if (mode === 'static') {
			const span = route.min_year != null ? `${route.min_year}–${route.max_year}` : 'sin fecha';
			return `Ruta de ${route.from_nombre} a ${route.to_nombre}, ${route.count} personas (${span}). Enter para ver detalle.`;
		}
		const cum = routeCumAt(route, playhead);
		return `Ruta de ${route.from_nombre} a ${route.to_nombre}, ${cum} movimientos acumulados. Enter para ver detalle.`;
	}

	function renderMarkers() {
		if (!gMarkers) return;
		if (mode !== 'timeline') {
			gMarkers.selectAll('circle.map-marker').remove();
			return;
		}
		const sel = gMarkers.selectAll('circle.map-marker').data(places, (p) => p.lugar_id);

		sel.exit().remove();

		const enter = sel
			.enter()
			.append('circle')
			.attr('class', 'map-marker')
			.attr('fill', MARKER_FILL)
			.attr('stroke', MARKER_STROKE)
			.attr('stroke-width', 1)
			.attr('fill-opacity', 0.6)
			.attr('r', 0)
			.on('pointerenter', onMarkerPointerEnter)
			.on('pointermove', onPointerMove)
			.on('pointerleave', hideTooltip);

		const merged = enter.merge(sel);
		merged
			.attr('cx', (p) => projectPoint(p.lat, p.lon)[0])
			.attr('cy', (p) => projectPoint(p.lat, p.lon)[1]);

		merged
			.transition('tl')
			.duration(220)
			.attr('r', (p) => markerRadius(p));
	}

	function markerRadius(place) {
		const cum = placeCumAt(place, playhead);
		return cum > 0 ? Math.max(5, Math.sqrt(cum / maxPlaceCum) * 22) : 0;
	}

	// ------------------------------------------------------------------
	// Particles (rAF loop along the arc Béziers)
	// ------------------------------------------------------------------

	let particles = [];
	let rafId = null;

	$: if (ready) rebuildParticles(mode, series, playhead, visibleRoutes);

	function rebuildParticles() {
		if (mode !== 'timeline' || prefersReducedMotion) {
			particles = [];
			syncParticleDom();
			return;
		}
		const active = [];
		let total = 0;
		for (const route of visibleRoutes) {
			const period = routePeriodAt(route, playhead);
			if (period > 0) {
				active.push({ route, period });
				total += period;
			}
		}
		const list = [];
		if (total > 0) {
			let remaining = PARTICLE_CAP;
			active.sort((a, b) => b.period - a.period);
			for (const item of active) {
				if (remaining <= 0) break;
				const count = Math.min(
					remaining,
					Math.max(1, Math.round((item.period / total) * PARTICLE_CAP))
				);
				remaining -= count;
				for (let k = 0; k < count; k++) {
					list.push({ route: item.route, offset: k / count });
				}
			}
		}
		particles = list;
		syncParticleDom();
	}

	function syncParticleDom() {
		if (!gParticles) return;
		const sel = gParticles.selectAll('circle.map-particle').data(particles);
		sel.exit().remove();
		sel
			.enter()
			.append('circle')
			.attr('class', 'map-particle')
			.attr('r', 3)
			.attr('fill', PARTICLE_COLOR)
			.attr('stroke', '#fff')
			.attr('stroke-width', 0.8)
			.merge(sel);
	}

	$: if (browser && playing && mode === 'timeline' && !prefersReducedMotion) {
		startParticleLoop();
	} else {
		stopParticleLoop();
	}

	function startParticleLoop() {
		if (rafId != null) return;
		const loop = (now) => {
			rafId = requestAnimationFrame(loop);
			drawParticles(now);
		};
		rafId = requestAnimationFrame(loop);
	}

	function stopParticleLoop() {
		if (rafId != null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function drawParticles(now) {
		if (!gParticles || !map) return;
		const duration = TRAVEL_MS / speed;
		gParticles.selectAll('circle.map-particle').each(function (p) {
			const t = (now / duration + p.offset) % 1;
			const { p0, pc, p1 } = arcGeometry(p.route);
			const [x, y] = bezierPoint(t, p0, pc, p1);
			this.setAttribute('cx', x);
			this.setAttribute('cy', y);
		});
	}

	// ------------------------------------------------------------------
	// Playback
	// ------------------------------------------------------------------

	let playTimer = null;

	function startPlaybackTimer(rate) {
		stopPlaybackTimer();
		playTimer = setTimeout(() => {
			if (playhead < buckets.length - 1) {
				playhead += 1;
				startPlaybackTimer(rate);
			} else {
				playing = false;
			}
		}, BUCKET_MS / rate);
	}

	function stopPlaybackTimer() {
		if (playTimer != null) {
			clearTimeout(playTimer);
			playTimer = null;
		}
	}

	$: if (playing && mode === 'timeline') startPlaybackTimer(speed);
	else stopPlaybackTimer();

	function togglePlay() {
		if (!buckets.length) return;
		if (!playing && playhead >= buckets.length - 1) playhead = 0;
		playing = !playing;
	}

	function skipToStart() {
		playhead = 0;
	}

	function skipToEnd() {
		playhead = Math.max(0, buckets.length - 1);
	}

	function enterTimeline() {
		if (meta.min_year == null) return;
		mode = 'timeline';
		playhead = 0;
		playing = !prefersReducedMotion;
	}

	function exitTimeline() {
		mode = 'static';
		playing = false;
	}

	// ------------------------------------------------------------------
	// Tooltip
	// ------------------------------------------------------------------

	function setRouteTooltip(route) {
		const lines = [];
		if (mode === 'static') {
			lines.push(`${route.count} persona(s)`);
		} else {
			lines.push(`Acumulado: ${routeCumAt(route, playhead)} movimiento(s)`);
			lines.push(`${currentBucketLabel}: ${routePeriodAt(route, playhead)} movimiento(s)`);
		}
		lines.push(route.min_year != null ? `Años: ${route.min_year}–${route.max_year}` : 'Sin fecha');
		tooltipData = { title: `${route.from_nombre} → ${route.to_nombre}`, lines };
	}

	function setMarkerTooltip(place) {
		const s = series.placeCum.get(place.lugar_id);
		const idx = Math.min(playhead, (s?.total.length || 1) - 1);
		const total = s ? s.total[idx] || 0 : 0;
		const inCount = s ? s.in[idx] || 0 : 0;
		const outCount = s ? s.out[idx] || 0 : 0;
		tooltipData = {
			title: place.nombre,
			lines: [`Acumulado: ${total} movimiento(s)`, `Entrantes: ${inCount} · Salientes: ${outCount}`]
		};
	}

	function positionTooltipFromEvent(event) {
		if (!mapFrame) return;
		const rect = mapFrame.getBoundingClientRect();
		let x = event.clientX - rect.left + 14;
		let y = event.clientY - rect.top + 14;
		if (x > rect.width - 280) x = Math.max(8, event.clientX - rect.left - 294);
		if (y > rect.height - 130) y = Math.max(8, event.clientY - rect.top - 120);
		tooltipX = x;
		tooltipY = y;
		tooltipVisible = true;
	}

	function onArcPointerEnter(event, route) {
		setRouteTooltip(route);
		positionTooltipFromEvent(event);
	}

	function onMarkerPointerEnter(event, place) {
		setMarkerTooltip(place);
		positionTooltipFromEvent(event);
	}

	function onPointerMove(event) {
		if (tooltipData) positionTooltipFromEvent(event);
	}

	function onArcFocus(event, route) {
		setRouteTooltip(route);
		const { p0, pc, p1 } = arcGeometry(route);
		const [mx, my] = bezierPoint(0.5, p0, pc, p1);
		const containerPoint = map.layerPointToContainerPoint(L.point(mx, my));
		const frameRect = mapFrame.getBoundingClientRect();
		const mapRect = mapContainer.getBoundingClientRect();
		tooltipX = mapRect.left - frameRect.left + containerPoint.x + 12;
		tooltipY = mapRect.top - frameRect.top + containerPoint.y + 12;
		tooltipVisible = true;
	}

	function hideTooltip() {
		tooltipVisible = false;
		tooltipData = null;
	}

	// ------------------------------------------------------------------
	// Detail modal
	// ------------------------------------------------------------------

	function onArcActivate(event, route) {
		openModal(route, event.currentTarget);
	}

	function onArcKeydown(event, route) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openModal(route, event.currentTarget);
		}
	}

	async function openModal(route, sourceEl) {
		hideTooltip();
		lastFocusedArc = sourceEl || null;
		selectedRoute = route;
		await tick();
		if (modalEl) {
			const focusable = modalEl.querySelector(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			(focusable || modalEl).focus();
		}
	}

	function closeModal() {
		selectedRoute = null;
		if (lastFocusedArc && document.contains(lastFocusedArc)) lastFocusedArc.focus();
		lastFocusedArc = null;
	}

	function onModalKeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeModal();
			return;
		}
		if (event.key !== 'Tab' || !modalEl) return;
		const focusables = Array.from(
			modalEl.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.disabled);
		if (!focusables.length) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

{#if browser}
	<div class="map-container card arcs-map">
		<div class="card-body">
			<div class="arcs-map-filters">
				<div class="arcs-map-filter arcs-map-filter-limit">
					<label class="form-label" for="route-limit">Rutas mostradas: {routeLimit}</label>
					<input
						id="route-limit"
						class="form-range"
						type="range"
						min="10"
						max={Math.max(10, routes.length)}
						step="10"
						bind:value={routeLimit}
					/>
				</div>
				<div class="arcs-map-filter">
					<label class="form-label" for="origin">Origen</label>
					<select id="origin" class="form-select" bind:value={origin}>
						<option value="">Todos los lugares</option>
						{#each places as place}
							<option value={place.lugar_id}>{place.nombre}</option>
						{/each}
					</select>
				</div>
				<div class="arcs-map-filter">
					<label class="form-label" for="destination">Destino</label>
					<select id="destination" class="form-select" bind:value={destination}>
						<option value="">Todos los lugares</option>
						{#each places as place}
							<option value={place.lugar_id}>{place.nombre}</option>
						{/each}
					</select>
				</div>
				<div class="arcs-map-filter arcs-map-filter-dates">
					<label class="form-label" for="start-year">Rango de fechas</label>
					<div class="input-group">
						<input
							id="start-year"
							class="form-control"
							type="number"
							inputmode="numeric"
							min={meta.min_year ?? undefined}
							max={meta.max_year ?? undefined}
							step="1"
							placeholder={meta.min_year != null ? String(meta.min_year) : 'Año'}
							aria-label="Año inicial"
							bind:value={startYear}
						/>
						<input
							id="end-year"
							class="form-control"
							type="number"
							inputmode="numeric"
							min={meta.min_year ?? undefined}
							max={meta.max_year ?? undefined}
							step="1"
							placeholder={meta.max_year != null ? String(meta.max_year) : 'Año'}
							aria-label="Año final"
							bind:value={endYear}
						/>
						<button class="btn btn-outline-secondary" type="button" on:click={loadData}
							>Aplicar</button
						>
					</div>
				</div>
			</div>

			<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
				{#if mode === 'static'}
					<button
						class="btn btn-primary"
						type="button"
						on:click={enterTimeline}
						disabled={loading || meta.min_year == null}
					>
						<i class="bi bi-play-circle me-1" aria-hidden="true"></i>Ver línea de tiempo
					</button>
					{#if !loading && meta.min_year == null}
						<span class="small text-muted">Sin movimientos con fecha disponibles.</span>
					{/if}
				{:else}
					<button class="btn btn-outline-primary" type="button" on:click={exitTimeline}>
						<i class="bi bi-map me-1" aria-hidden="true"></i>Vista estática
					</button>
				{/if}
			</div>

			{#if mode === 'timeline'}
				<div class="timeline-controls" role="group" aria-label="Controles de la línea de tiempo">
					<button
						class="btn btn-sm btn-outline-secondary"
						type="button"
						on:click={skipToStart}
						aria-label="Ir al inicio de la línea de tiempo"
						disabled={!buckets.length}
					>
						<i class="bi bi-skip-start-fill" aria-hidden="true"></i>
					</button>
					<button
						class="btn btn-sm btn-primary"
						type="button"
						on:click={togglePlay}
						aria-label={playing ? 'Pausar animación' : 'Reproducir animación'}
						disabled={!buckets.length}
					>
						<i class="bi {playing ? 'bi-pause-fill' : 'bi-play-fill'}" aria-hidden="true"></i>
					</button>
					<button
						class="btn btn-sm btn-outline-secondary"
						type="button"
						on:click={skipToEnd}
						aria-label="Ir al final de la línea de tiempo"
						disabled={!buckets.length}
					>
						<i class="bi bi-skip-end-fill" aria-hidden="true"></i>
					</button>
					<input
						class="form-range timeline-scrubber"
						type="range"
						min="0"
						max={Math.max(0, buckets.length - 1)}
						step="1"
						bind:value={playhead}
						aria-label="Posición de la línea de tiempo"
						aria-valuetext={currentBucketLabel}
						disabled={!buckets.length}
					/>
					<span class="timeline-year badge text-bg-secondary">{currentBucketLabel}</span>
					<label class="form-label small mb-0" for="granularity">
						Agrupar por
						<select id="granularity" class="form-select form-select-sm" bind:value={granularity}>
							<option value={1}>1 año</option>
							<option value={5}>5 años</option>
							<option value={10}>10 años</option>
						</select>
					</label>
					<label class="form-label small mb-0" for="speed">
						Velocidad
						<select id="speed" class="form-select form-select-sm" bind:value={speed}>
							<option value={0.5}>0.5×</option>
							<option value={1}>1×</option>
							<option value={2}>2×</option>
						</select>
					</label>
				</div>
			{/if}

			<div class="map-frame" bind:this={mapFrame}>
				<div bind:this={mapContainer} id="map"></div>
				{#if loading}
					<div class="map-loading-overlay" role="status">
						<div class="spinner-border text-primary" aria-hidden="true"></div>
						<p class="mb-0 mt-2">Cargando trayectorias… Esto puede tomar unos momentos.</p>
					</div>
				{/if}
				{#if error}
					<div class="map-error-overlay" role="alert">
						<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
						<p class="mb-0 ms-2">Error cargando trayectorias: {error}</p>
					</div>
				{/if}
				{#if mode === 'timeline' && !loading && !error && meta.min_year == null}
					<div class="map-empty-overlay">
						<p class="mb-0">
							<i class="bi bi-calendar-x me-2" aria-hidden="true"></i>
							No hay movimientos con fecha para mostrar en la línea de tiempo.
						</p>
					</div>
				{/if}
				{#if tooltipVisible && tooltipData}
					<div class="map-tooltip" style:left="{tooltipX}px" style:top="{tooltipY}px">
						<strong>{tooltipData.title}</strong>
						{#each tooltipData.lines as line}
							<div>{line}</div>
						{/each}
					</div>
				{/if}
			</div>

			{#if mode === 'timeline' && meta.undated_count > 0}
				<p class="small arcs-map-notice mt-2 mb-0">
					<i class="bi bi-info-circle me-1" aria-hidden="true"></i>
					{meta.undated_count} movimientos sin fecha no se muestran en la línea de tiempo.
				</p>
			{/if}

			<p class="small text-muted mt-2 mb-1">
				{Math.min(routeLimit, visibleRoutes.length)} de {routes.length} rutas agregadas ·
				{places.length} lugares
				{#if meta.min_year != null}
					· {meta.min_year}–{meta.max_year}
				{/if}
			</p>

			<div class="arcs-map-legend small text-muted">
				<span class="legend-item">
					<span class="legend-arc" aria-hidden="true"></span>
					Grosor del arco: {mode === 'timeline' ? 'movimientos acumulados' : 'personas'}
				</span>
				{#if mode === 'timeline'}
					<span class="legend-item">
						<span class="legend-marker" aria-hidden="true"></span>
						Tamaño del círculo: movimientos acumulados del lugar
					</span>
					<span class="legend-item">
						<span class="legend-particle" aria-hidden="true"></span>
						Puntos en movimiento: flujos del periodo mostrado
					</span>
					<span class="legend-note">
						Los conteos por periodo cuentan movimientos (no personas únicas); la vista estática
						cuenta personas únicas por ruta.
					</span>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if selectedRoute}
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div
		class="modal d-block arcs-map-dialog"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		aria-labelledby="arcs-map-dialog-title"
		bind:this={modalEl}
		on:keydown={onModalKeydown}
		on:click|self={closeModal}
	>
		<div class="modal-dialog modal-lg modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="arcs-map-dialog-title">
						<i class="bi bi-arrow-right-circle me-2" aria-hidden="true"></i>
						{selectedRoute.from_nombre} → {selectedRoute.to_nombre}
					</h5>
					<button
						type="button"
						class="btn-close"
						aria-label="Cerrar detalle de ruta"
						on:click={closeModal}
					></button>
				</div>
				<div class="modal-body">
					<RouteDetailPanel
						fromId={selectedRoute.from_lugar_id}
						toId={selectedRoute.to_lugar_id}
						fromNombre={selectedRoute.from_nombre}
						toNombre={selectedRoute.to_nombre}
						count={selectedRoute.count}
						filters={activeFilters}
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="modal-backdrop show"></div>
{/if}
