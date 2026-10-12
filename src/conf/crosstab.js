/**
 * Dimension and cell-operation registry for the crosstab / pivot-table view.
 * Mirrors mstdb_manager/api/v2/crosstab.py — keep in sync when adding dimensions.
 */

/** @typedef {{ labelKey: string, entities: string[], isPeriod?: boolean, isMM?: boolean }} DimConfig */

/** @type {Record<string, DimConfig>} */
export const DIMENSIONS = {
	fecha_periodo: {
		labelKey: 'conf_dim_periodo',
		entities: ['personaesclavizada', 'personanoesclavizada'],
		isPeriod: true,
		isMM: false
	},
	sexo: {
		labelKey: 'conf_col_sexo',
		entities: ['personaesclavizada', 'personanoesclavizada'],
		isPeriod: false,
		isMM: false
	},
	etnonimos: {
		labelKey: 'conf_filter_etnonimo',
		entities: ['personaesclavizada'],
		isPeriod: false,
		isMM: true
	},
	calidades: {
		labelKey: 'conf_filter_calidad',
		entities: ['personaesclavizada', 'personanoesclavizada'],
		isPeriod: false,
		isMM: true
	},
	hispanizacion: {
		labelKey: 'conf_col_hispanizacion',
		entities: ['personaesclavizada'],
		isPeriod: false,
		isMM: true
	},
	procedencia: {
		labelKey: 'conf_dim_procedencia',
		entities: ['personaesclavizada'],
		isPeriod: false,
		isMM: false
	},
	lugar_trayectoria: {
		labelKey: 'conf_dim_lugar_trayectoria',
		entities: ['personaesclavizada', 'personanoesclavizada'],
		isPeriod: false,
		isMM: true
	},
	estado_civil: {
		labelKey: 'conf_col_estado_civil',
		entities: ['personaesclavizada', 'personanoesclavizada'],
		isPeriod: false,
		isMM: true
	},
	honorifico: {
		labelKey: 'conf_filter_honorifico',
		entities: ['personanoesclavizada'],
		isPeriod: false,
		isMM: false
	},
	tipo_documental: {
		labelKey: 'conf_filter_tipo_documental',
		entities: ['personaesclavizada', 'personanoesclavizada'],
		isPeriod: false,
		isMM: true
	},
	ocupaciones: {
		labelKey: 'conf_filter_ocupacion',
		entities: ['personanoesclavizada'],
		isPeriod: false,
		isMM: true
	}
};

export const CELL_OPS = {
	count: {
		labelKey: 'conf_op_count',
		entities: ['personaesclavizada', 'personanoesclavizada']
	},
	avg_edad: {
		labelKey: 'conf_op_avg_edad',
		entities: ['personaesclavizada']
	},
	pct_of_total: {
		labelKey: 'conf_op_pct',
		entities: ['personaesclavizada', 'personanoesclavizada']
	}
};

export const PERIOD_SIZES = [25, 50, 100];

/** Default crosstab config per entity type. */
export const DEFAULT_CROSSTAB_CONFIG = {
	personaesclavizada: { rowDim: 'fecha_periodo', colDim: 'sexo', cellOp: 'count', periodSize: 50 },
	personanoesclavizada: {
		rowDim: 'fecha_periodo',
		colDim: 'calidades',
		cellOp: 'count',
		periodSize: 50
	}
};

/**
 * Return dimension entries valid for a given entity type,
 * excluding `excludeDim` (to prevent row and col being the same).
 */
export function dimsForEntity(entityType, excludeDim = null) {
	return Object.entries(DIMENSIONS)
		.filter(([key, cfg]) => cfg.entities.includes(entityType) && key !== excludeDim)
		.map(([key, cfg]) => ({ key, ...cfg }));
}

/**
 * Return cell operations valid for a given entity type.
 */
export function opsForEntity(entityType) {
	return Object.entries(CELL_OPS)
		.filter(([, cfg]) => cfg.entities.includes(entityType))
		.map(([key, cfg]) => ({ key, ...cfg }));
}
