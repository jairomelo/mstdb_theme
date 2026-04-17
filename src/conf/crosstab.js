/**
 * Dimension and cell-operation registry for the crosstab / pivot-table view.
 * Mirrors mstdb_manager/api/v2/crosstab.py — keep in sync when adding dimensions.
 */

/** @typedef {{ label: string, entities: string[], isPeriod?: boolean, isMM?: boolean }} DimConfig */

/** @type {Record<string, DimConfig>} */
export const DIMENSIONS = {
    fecha_periodo: {
        label: 'Período de tiempo',
        entities: ['personaesclavizada', 'personanoesclavizada'],
        isPeriod: true,
        isMM: false,
    },
    sexo: {
        label: 'Sexo',
        entities: ['personaesclavizada', 'personanoesclavizada'],
        isPeriod: false,
        isMM: false,
    },
    etnonimos: {
        label: 'Etnónimo',
        entities: ['personaesclavizada'],
        isPeriod: false,
        isMM: true,
    },
    calidades: {
        label: 'Calidad',
        entities: ['personaesclavizada', 'personanoesclavizada'],
        isPeriod: false,
        isMM: true,
    },
    hispanizacion: {
        label: 'Agencia / Adaptación',
        entities: ['personaesclavizada'],
        isPeriod: false,
        isMM: true,
    },
    procedencia: {
        label: 'Procedencia (lugar)',
        entities: ['personaesclavizada'],
        isPeriod: false,
        isMM: false,
    },
    lugar_trayectoria: {
        label: 'Lugar (trayectoria)',
        entities: ['personaesclavizada', 'personanoesclavizada'],
        isPeriod: false,
        isMM: true,
    },
    estado_civil: {
        label: 'Estado matrimonial',
        entities: ['personaesclavizada', 'personanoesclavizada'],
        isPeriod: false,
        isMM: true,
    },
    honorifico: {
        label: 'Honorífico',
        entities: ['personanoesclavizada'],
        isPeriod: false,
        isMM: false,
    },
    tipo_documental: {
        label: 'Tipo documental',
        entities: ['personaesclavizada', 'personanoesclavizada'],
        isPeriod: false,
        isMM: true,
    },
    ocupaciones: {
        label: 'Ocupación',
        entities: ['personanoesclavizada'],
        isPeriod: false,
        isMM: true,
    },
};

export const CELL_OPS = {
    count: {
        label: 'Recuento de personas',
        entities: ['personaesclavizada', 'personanoesclavizada'],
    },
    avg_edad: {
        label: 'Edad promedio',
        entities: ['personaesclavizada'],
    },
    pct_of_total: {
        label: '% del total',
        entities: ['personaesclavizada', 'personanoesclavizada'],
    },
};

export const PERIOD_SIZES = [25, 50, 100];

/** Default crosstab config per entity type. */
export const DEFAULT_CROSSTAB_CONFIG = {
    personaesclavizada: { rowDim: 'fecha_periodo', colDim: 'sexo', cellOp: 'count', periodSize: 50 },
    personanoesclavizada: { rowDim: 'fecha_periodo', colDim: 'calidades', cellOp: 'count', periodSize: 50 },
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
