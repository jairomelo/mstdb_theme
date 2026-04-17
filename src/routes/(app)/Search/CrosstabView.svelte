<script>
	import { onMount } from 'svelte';
	import { unifiedStore, fetchCrosstab, setCrosstabConfig } from '$lib/unified-store';
	import { dimsForEntity, opsForEntity, PERIOD_SIZES, DIMENSIONS } from '$conf/crosstab';
	import config from '../../../config';
	import queryString from 'query-string';

	export let entityType;

	$: tab = $unifiedStore.tabs[entityType];
	$: cfg = tab?.crosstabConfig;
	$: result = cfg?.result;
	$: isLoading = cfg?.isLoading;
	$: error = cfg?.error;
	$: meta = result?.meta;

	// Local select values – synced from store ONLY on entity-type switch.
	// Using bind:value so Svelte owns the DOM ↔ variable binding.
	// We must NOT reactively sync store→local on every cfg change, because
	// that would reset the local var back to the old store value the instant
	// bind:value updates it (before on:change can push the new value).
	let selRow = '';
	let selCol = '';
	let selOp = 'count';
	let selPeriod = 50;
	let _syncedEntity = '';

	// Store → local: fires only when entityType changes (tab switch)
	$: if (cfg && entityType !== _syncedEntity) {
		_syncedEntity = entityType;
		selRow = cfg.rowDim;
		selCol = cfg.colDim;
		selOp = cfg.cellOp;
		selPeriod = cfg.periodSize;
	}

	// Dimension lists — do NOT exclude the opposite dim from the list.
	// Both selects always show the full set for the entity type so the
	// browser never loses the selected value when options re-render.
	$: allDims = dimsForEntity(entityType);
	$: ops = opsForEntity(entityType);

	$: rowIsPeriod = DIMENSIONS[selRow]?.isPeriod;
	$: colIsPeriod = DIMENSIONS[selCol]?.isPeriod;
	$: showPeriodSize = rowIsPeriod || colIsPeriod;

	// Local → store (push on every user change)
	function pushRow() {
		if (selRow === selCol) {
			// Swap if user picked the same dim as the other axis
			selCol = cfg?.rowDim ?? '';
			setCrosstabConfig(entityType, { rowDim: selRow, colDim: selCol, result: null });
		} else {
			setCrosstabConfig(entityType, { rowDim: selRow, result: null });
		}
	}
	function pushCol() {
		if (selCol === selRow) {
			selRow = cfg?.colDim ?? '';
			setCrosstabConfig(entityType, { colDim: selCol, rowDim: selRow, result: null });
		} else {
			setCrosstabConfig(entityType, { colDim: selCol, result: null });
		}
	}
	function pushOp() { setCrosstabConfig(entityType, { cellOp: selOp, result: null }); }
	function pushPeriod() { setCrosstabConfig(entityType, { periodSize: selPeriod, result: null }); }

	function apply() {
		fetchCrosstab(entityType);
	}

	async function downloadCsv() {
		const state = $unifiedStore;
		const params = {
			type: entityType,
			row_dim: cfg.rowDim,
			col_dim: cfg.colDim,
			cell_op: cfg.cellOp,
			period_size: cfg.periodSize,
			export_format: 'csv',
		};
		if (state.query) {
			params.q = state.exactSearch
				? `"${state.query.replace(/^"|"$/g, '')}"`
				: state.query.replace(/^"|"$/g, '');
		}
		for (const [key, value] of Object.entries(tab.filters || {})) {
			if (value !== null && value !== '' && value !== undefined) {
				params[key] = value;
			}
		}
		const url = `${config.apiBaseUrl}crosstab/?${queryString.stringify(params)}`;
		const res = await fetch(url, { credentials: 'include' });
		const blob = await res.blob();
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'crosstab.csv';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function cellPrimary(cell) {
		if (!cfg) return '';
		if (cfg.cellOp === 'avg_edad') {
			return cell?.avg_edad != null ? cell.avg_edad.toLocaleString('es') : '—';
		}
		if (cfg.cellOp === 'pct_of_total') {
			return cell?.pct != null ? `${cell.pct}%` : '—';
		}
		return cell?.count != null ? cell.count.toLocaleString('es') : '0';
	}

	function totalPrimary(tot) {
		return cellPrimary(tot);
	}

	onMount(() => {
		if (!cfg?.result && !cfg?.isLoading) {
			fetchCrosstab(entityType);
		}
	});
</script>

<div class="crosstab-wrapper">
	<!-- Config panel -->
	<div class="crosstab-controls d-flex flex-wrap align-items-end gap-3 mb-3 p-3 bg-light border rounded">
		<div>
			<label class="form-label small fw-semibold mb-1" for="ct-row-{entityType}">Filas</label>
			<select
				id="ct-row-{entityType}"
				class="form-select form-select-sm"
				bind:value={selRow}
				on:change={pushRow}
				aria-label="Dimensión de filas"
			>
				{#each allDims as dim}
					<option value={dim.key}>{dim.label}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="form-label small fw-semibold mb-1" for="ct-col-{entityType}">Columnas</label>
			<select
				id="ct-col-{entityType}"
				class="form-select form-select-sm"
				bind:value={selCol}
				on:change={pushCol}
				aria-label="Dimensión de columnas"
			>
				{#each allDims as dim}
					<option value={dim.key}>{dim.label}</option>
				{/each}
			</select>
		</div>

		{#if showPeriodSize}
		<div>
			<label class="form-label small fw-semibold mb-1" for="ct-period-{entityType}">Intervalo</label>
			<select
				id="ct-period-{entityType}"
				class="form-select form-select-sm"
				bind:value={selPeriod}
				on:change={pushPeriod}
				aria-label="Tamaño del intervalo temporal"
			>
				{#each PERIOD_SIZES as ps}
					<option value={ps}>{ps} años</option>
				{/each}
			</select>
		</div>
		{/if}

		<div>
			<label class="form-label small fw-semibold mb-1" for="ct-op-{entityType}">Celdas</label>
			<select
				id="ct-op-{entityType}"
				class="form-select form-select-sm"
				bind:value={selOp}
				on:change={pushOp}
				aria-label="Operación de celda"
			>
				{#each ops as op}
					<option value={op.key}>{op.label}</option>
				{/each}
			</select>
		</div>

		<button class="btn btn-sm btn-primary" on:click={apply} disabled={isLoading}>
			{#if isLoading}
				<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
				Calculando…
			{:else}
				<i class="bi bi-play-fill me-1" aria-hidden="true"></i>Aplicar
			{/if}
		</button>

		{#if result}
		<button
			class="btn btn-sm btn-outline-secondary"
			aria-label="Descargar tabla como CSV"
			on:click={downloadCsv}
		>
			<i class="bi bi-download me-1" aria-hidden="true"></i>CSV
		</button>
		{/if}
	</div>

	<!-- M2M warning -->
	{#if meta?.m2m_warning}
	<div class="alert alert-warning alert-sm py-1 px-2 small mb-2" role="note">
		<i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
		{meta.m2m_warning}
	</div>
	{/if}

	<!-- Error state -->
	{#if error}
	<div class="alert alert-danger">
		<i class="bi bi-exclamation-circle me-2"></i>{error}
	</div>
	{/if}

	<!-- Loading state -->
	{#if isLoading}
	<div class="text-center py-5">
		<div class="spinner-border text-primary" role="status">
			<span class="visually-hidden">Calculando tabla cruzada…</span>
		</div>
	</div>
	{:else if result}

	<!-- Pivot table -->
	<div class="table-responsive crosstab-table-wrap">
		<table class="table table-sm table-bordered table-hover crosstab-table" aria-label="Tabla cruzada">
			<caption class="visually-hidden">
				{meta?.row_dim_label} × {meta?.col_dim_label}
				{#if meta?.period_size}(intervalos de {meta.period_size} años){/if}
				— {meta?.cell_op_label}
			</caption>

			<thead class="table-dark">
				<tr>
					<!-- Top-left: describes the row dimension -->
					<th scope="col" class="crosstab-row-header">{meta?.row_dim_label}</th>
					{#each result.cols as col}
						<th scope="col" class="text-end">{col}</th>
					{/each}
					<th scope="col" class="text-end crosstab-total-col">Total</th>
				</tr>
			</thead>

			<tbody>
				{#each result.rows as rowLabel, ri}
				<tr>
					<th scope="row" class="crosstab-row-header">{rowLabel}</th>
					{#each result.cells[ri] as cell}
						<td class="text-end" class:crosstab-zero={cell?.count === 0}>
							{cellPrimary(cell)}
						</td>
					{/each}
					<td class="text-end fw-semibold crosstab-total-col">
						{totalPrimary(result.row_totals[ri])}
					</td>
				</tr>
				{/each}
			</tbody>

			<tfoot class="table-secondary">
				<tr>
					<th scope="row" class="crosstab-row-header fw-semibold">Total</th>
					{#each result.col_totals as ct}
						<td class="text-end fw-semibold">{totalPrimary(ct)}</td>
					{/each}
					<td class="text-end fw-bold crosstab-total-col">
						{#if cfg?.cellOp === 'avg_edad'}
							{result.grand_total?.avg_edad != null
								? result.grand_total.avg_edad.toLocaleString('es')
								: '—'}
						{:else if cfg?.cellOp === 'pct_of_total'}
							100%
						{:else}
							{result.grand_total?.count?.toLocaleString('es') ?? 0}
						{/if}
					</td>
				</tr>
			</tfoot>
		</table>
	</div>

	<!-- Summary line -->
	<p class="text-muted small mt-1 mb-0">
		{result.rows.length} {meta?.row_dim_label?.toLowerCase() ?? 'filas'},
		{result.cols.length} {meta?.col_dim_label?.toLowerCase() ?? 'columnas'} —
		{result.grand_total?.count?.toLocaleString('es') ?? 0} personas en total
	</p>

	{:else}
	<!-- Empty state -->
	<div class="text-center text-muted py-5">
		<i class="bi bi-layout-three-columns fs-2 d-block mb-2" aria-hidden="true"></i>
		Selecciona las dimensiones y pulsa <strong>Aplicar</strong> para generar la tabla cruzada.
	</div>
	{/if}
</div>
