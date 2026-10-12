<script>
	import { onMount } from 'svelte';
	import { unifiedStore, fetchCrosstab, setCrosstabConfig } from '$lib/unified-store';
	import { dimsForEntity, opsForEntity, PERIOD_SIZES, DIMENSIONS, CELL_OPS } from '$conf/crosstab';
	import config from '../../../config';
	import queryString from 'query-string';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	export let entityType;

	$: tab = $unifiedStore.tabs[entityType];
	$: cfg = tab?.crosstabConfig;
	$: result = cfg?.result;
	$: isLoading = cfg?.isLoading;
	$: error = cfg?.error;
	$: meta = result?.meta;

	function resolveDimLabel(dim) {
		const key = DIMENSIONS[dim]?.labelKey;
		return key ? m[key]() : '';
	}

	function formatNumber(value) {
		try {
			return value.toLocaleString(getLocale());
		} catch {
			return value.toLocaleString();
		}
	}

	// Localized labels for the active configuration (fall back to API labels).
	$: rowDimLabel = resolveDimLabel(cfg?.rowDim) || meta?.row_dim_label || '';
	$: colDimLabel = resolveDimLabel(cfg?.colDim) || meta?.col_dim_label || '';
	$: cellOpLabel = (() => {
		const key = CELL_OPS[cfg?.cellOp]?.labelKey;
		return key ? m[key]() : meta?.cell_op_label || '';
	})();

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
	$: allDims = dimsForEntity(entityType).map((d) => ({ ...d, label: m[d.labelKey]() }));
	$: ops = opsForEntity(entityType).map((o) => ({ ...o, label: m[o.labelKey]() }));

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
	function pushOp() {
		setCrosstabConfig(entityType, { cellOp: selOp, result: null });
	}
	function pushPeriod() {
		setCrosstabConfig(entityType, { periodSize: selPeriod, result: null });
	}

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
			export_format: 'csv'
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
			return cell?.avg_edad != null ? formatNumber(cell.avg_edad) : '—';
		}
		if (cfg.cellOp === 'pct_of_total') {
			return cell?.pct != null ? `${cell.pct}%` : '—';
		}
		return cell?.count != null ? formatNumber(cell.count) : '0';
	}

	function totalPrimary(tot) {
		return cellPrimary(tot);
	}

	// ── Sorting ──────────────────────────────────────────────────────────
	// sortCol: -1 = row-label column, 0..N = data columns, Infinity = total column
	let sortCol = null;
	let sortDir = 'asc'; // 'asc' | 'desc'

	function toggleSort(col) {
		if (sortCol === col) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortCol = col;
			sortDir = 'asc';
		}
	}

	// Reset sort when a new result arrives
	$: if (result) {
		sortCol = null;
		sortDir = 'asc';
	}

	function _numericVal(cell) {
		if (!cfg) return 0;
		if (cfg.cellOp === 'avg_edad') return cell?.avg_edad ?? -Infinity;
		if (cfg.cellOp === 'pct_of_total') return cell?.pct ?? -Infinity;
		return cell?.count ?? 0;
	}

	// sortedIndices: an array of original row indices in display order
	$: sortedIndices = (() => {
		if (!result) return [];
		const indices = result.rows.map((_, i) => i);
		if (sortCol == null) return indices;

		indices.sort((a, b) => {
			let va, vb;
			if (sortCol === -1) {
				// Sort by row label (string)
				va = result.rows[a] ?? '';
				vb = result.rows[b] ?? '';
				return sortDir === 'asc'
					? va.localeCompare(vb, getLocale())
					: vb.localeCompare(va, getLocale());
			} else if (sortCol === Infinity) {
				// Sort by row total
				va = _numericVal(result.row_totals[a]);
				vb = _numericVal(result.row_totals[b]);
			} else {
				// Sort by a specific data column
				va = _numericVal(result.cells[a]?.[sortCol]);
				vb = _numericVal(result.cells[b]?.[sortCol]);
			}
			return sortDir === 'asc' ? va - vb : vb - va;
		});
		return indices;
	})();

	function sortIcon(col) {
		if (sortCol !== col) return 'bi-chevron-expand';
		return sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
	}

	onMount(() => {
		if (!cfg?.result && !cfg?.isLoading) {
			fetchCrosstab(entityType);
		}
	});
</script>

<div class="crosstab-wrapper">
	<!-- Config panel -->
	<div
		class="crosstab-controls d-flex flex-wrap align-items-end gap-3 mb-3 p-3 bg-light border rounded"
	>
		<div>
			<label class="form-label small fw-semibold mb-1" for="ct-row-{entityType}"
				>{m.conf_crosstab_rows()}</label
			>
			<select
				id="ct-row-{entityType}"
				class="form-select form-select-sm"
				bind:value={selRow}
				on:change={pushRow}
				aria-label={m.conf_crosstab_aria_row_dim()}
			>
				{#each allDims as dim}
					<option value={dim.key}>{dim.label}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="form-label small fw-semibold mb-1" for="ct-col-{entityType}"
				>{m.conf_crosstab_cols()}</label
			>
			<select
				id="ct-col-{entityType}"
				class="form-select form-select-sm"
				bind:value={selCol}
				on:change={pushCol}
				aria-label={m.conf_crosstab_aria_col_dim()}
			>
				{#each allDims as dim}
					<option value={dim.key}>{dim.label}</option>
				{/each}
			</select>
		</div>

		{#if showPeriodSize}
			<div>
				<label class="form-label small fw-semibold mb-1" for="ct-period-{entityType}"
					>{m.conf_crosstab_interval()}</label
				>
				<select
					id="ct-period-{entityType}"
					class="form-select form-select-sm"
					bind:value={selPeriod}
					on:change={pushPeriod}
					aria-label={m.conf_crosstab_aria_period()}
				>
					{#each PERIOD_SIZES as ps}
						<option value={ps}>{m.conf_crosstab_period_years({ count: ps })}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div>
			<label class="form-label small fw-semibold mb-1" for="ct-op-{entityType}"
				>{m.conf_crosstab_cells()}</label
			>
			<select
				id="ct-op-{entityType}"
				class="form-select form-select-sm"
				bind:value={selOp}
				on:change={pushOp}
				aria-label={m.conf_crosstab_aria_cell_op()}
			>
				{#each ops as op}
					<option value={op.key}>{op.label}</option>
				{/each}
			</select>
		</div>

		<button class="btn btn-sm btn-primary" on:click={apply} disabled={isLoading}>
			{#if isLoading}
				<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
				{m.conf_crosstab_calculating()}
			{:else}
				<i class="bi bi-play-fill me-1" aria-hidden="true"></i>{m.apply_button()}
			{/if}
		</button>

		{#if result}
			<button
				class="btn btn-sm btn-outline-secondary"
				aria-label={m.conf_crosstab_download_csv()}
				title={m.conf_crosstab_download_csv()}
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
				<span class="visually-hidden">{m.conf_crosstab_calculating_table()}</span>
			</div>
		</div>
	{:else if result}
		<!-- Pivot table -->
		<div class="table-responsive crosstab-table-wrap">
			<table
				class="table table-sm table-bordered table-hover crosstab-table"
				aria-label={m.conf_crosstab_table_aria()}
			>
				<caption class="visually-hidden">
					{#if meta?.period_size}
						{m.conf_crosstab_caption_period({
							row: rowDimLabel,
							col: colDimLabel,
							size: meta.period_size,
							op: cellOpLabel
						})}
					{:else}
						{m.conf_crosstab_caption({ row: rowDimLabel, col: colDimLabel, op: cellOpLabel })}
					{/if}
				</caption>

				<thead class="table-dark">
					<tr>
						<th
							scope="col"
							class="crosstab-row-header crosstab-sortable"
							on:click={() => toggleSort(-1)}
							aria-sort={sortCol === -1 ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
						>
							{rowDimLabel}
							<i class="bi {sortIcon(-1)} ms-1 small" aria-hidden="true"></i>
						</th>
						{#each result.cols as col, ci}
							<th
								scope="col"
								class="text-end crosstab-sortable"
								on:click={() => toggleSort(ci)}
								aria-sort={sortCol === ci
									? sortDir === 'asc'
										? 'ascending'
										: 'descending'
									: 'none'}
							>
								{col}
								<i class="bi {sortIcon(ci)} ms-1 small" aria-hidden="true"></i>
							</th>
						{/each}
						<th
							scope="col"
							class="text-end crosstab-total-col crosstab-sortable"
							on:click={() => toggleSort(Infinity)}
							aria-sort={sortCol === Infinity
								? sortDir === 'asc'
									? 'ascending'
									: 'descending'
								: 'none'}
						>
							{m.conf_crosstab_total()}
							<i class="bi {sortIcon(Infinity)} ms-1 small" aria-hidden="true"></i>
						</th>
					</tr>
				</thead>

				<tbody>
					{#each sortedIndices as ri}
						<tr>
							<th scope="row" class="crosstab-row-header">{result.rows[ri]}</th>
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
						<th scope="row" class="crosstab-row-header fw-semibold">{m.conf_crosstab_total()}</th>
						{#each result.col_totals as ct}
							<td class="text-end fw-semibold">{totalPrimary(ct)}</td>
						{/each}
						<td class="text-end fw-bold crosstab-total-col">
							{#if cfg?.cellOp === 'avg_edad'}
								{result.grand_total?.avg_edad != null
									? formatNumber(result.grand_total.avg_edad)
									: '—'}
							{:else if cfg?.cellOp === 'pct_of_total'}
								100%
							{:else}
								{result.grand_total?.count != null ? formatNumber(result.grand_total.count) : 0}
							{/if}
						</td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Summary line -->
		<p class="text-muted small mt-1 mb-0">
			{m.conf_crosstab_summary({
				rows: result.rows.length,
				rowLabel: rowDimLabel.toLowerCase(),
				cols: result.cols.length,
				colLabel: colDimLabel.toLowerCase(),
				total:
					result.grand_total?.count != null
						? formatNumber(result.grand_total.count)
						: formatNumber(0)
			})}
		</p>
	{:else}
		<!-- Empty state -->
		<div class="text-center text-muted py-5">
			<i class="bi bi-layout-three-columns fs-2 d-block mb-2" aria-hidden="true"></i>
			{m.conf_crosstab_empty_before()}<strong>{m.apply_button()}</strong
			>{m.conf_crosstab_empty_after()}
		</div>
	{/if}
</div>
