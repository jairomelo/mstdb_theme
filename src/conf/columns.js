/**
 * Column definitions and filter configurations per entity type.
 * Used by the browse table view to render columns, sorting, and advanced filters.
 */

// ── Column definitions ───────────────────────────────────────────────
// key: matches serializer field name
// label: display header
// sortable: whether the column supports server-side ordering
// visible: included in default view

export const columnsConfig = {
    personaesclavizada: [
        { key: 'persona_idno', label: 'ID', sortable: false, visible: true },
        { key: 'nombre_normalizado', label: 'Nombre', sortable: true, visible: true },
        { key: 'sexo', label: 'Sexo', sortable: false, visible: true },
        { key: 'edad', label: 'Edad', sortable: true, visible: true },
        { key: 'etnonimos', label: 'Etnónimos', sortable: false, visible: true },
        { key: 'hispanizacion', label: 'Hispanización', sortable: false, visible: true },
        { key: 'has_relaciones', label: 'Relaciones', sortable: false, visible: true },
        { key: 'has_lugares', label: 'Trayectoria', sortable: false, visible: true },
        { key: 'documento_list', label: 'Documentos', sortable: false, visible: true },
        { key: 'created_at', label: 'Creado', sortable: true, visible: false },
        { key: 'updated_at', label: 'Actualizado', sortable: true, visible: false },
    ],
    personanoesclavizada: [
        { key: 'persona_idno', label: 'ID', sortable: false, visible: true },
        { key: 'nombre_normalizado', label: 'Nombre', sortable: true, visible: true },
        { key: 'sexo', label: 'Sexo', sortable: false, visible: true },
        { key: 'ocupaciones', label: 'Ocupaciones', sortable: false, visible: true },
        { key: 'calidades', label: 'Calidades', sortable: false, visible: true },
        { key: 'has_relaciones', label: 'Relaciones', sortable: false, visible: true },
        { key: 'has_lugares', label: 'Lugares', sortable: false, visible: true },
        { key: 'documento_list', label: 'Documentos', sortable: false, visible: true },
        { key: 'created_at', label: 'Creado', sortable: true, visible: false },
        { key: 'updated_at', label: 'Actualizado', sortable: true, visible: false },
    ],
    documento: [
        { key: 'documento_idno', label: 'ID', sortable: false, visible: true },
        { key: 'titulo', label: 'Título', sortable: true, visible: true },
        { key: 'tipo_documento', label: 'Tipo', sortable: false, visible: true },
        { key: 'archivo', label: 'Archivo', sortable: false, visible: true },
        { key: 'fecha_inicial', label: 'Fecha inicial', sortable: true, visible: true },
        { key: 'fecha_final', label: 'Fecha final', sortable: true, visible: false },
        { key: 'created_at', label: 'Creado', sortable: true, visible: false },
    ],
    lugar: [
        { key: 'nombre_lugar', label: 'Nombre', sortable: true, visible: true },
        { key: 'tipo', label: 'Tipo', sortable: true, visible: true },
        { key: 'otros_nombres', label: 'Otros nombres', sortable: false, visible: true },
        { key: 'persona_count', label: 'Personas', sortable: false, visible: true },
        { key: 'lat', label: 'Latitud', sortable: false, visible: false },
        { key: 'lon', label: 'Longitud', sortable: false, visible: false },
    ],
    corporacion: [
        { key: 'nombre_institucion', label: 'Nombre', sortable: true, visible: true },
        { key: 'tipo_institucion', label: 'Tipo', sortable: false, visible: true },
        { key: 'lugar_corporacion', label: 'Lugar', sortable: false, visible: true },
    ],
};

// ── Default visible columns (derived from columnsConfig) ─────────────
export const defaultVisibleColumns = Object.fromEntries(
    Object.entries(columnsConfig).map(([type, cols]) => [
        type,
        cols.filter(c => c.visible).map(c => c.key),
    ])
);

// ── Advanced filter definitions per entity type ──────────────────────
// key: query param sent to API  |  label: UI label  |  type: control type
// options: for 'select' type — array of {value, label}

export const filtersDefinition = {
    personaesclavizada: [
        { key: 'search', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre...' },
        {
            key: 'sexo', label: 'Sexo', type: 'select',
            options: [
                { value: '', label: 'Todos' },
                { value: 'v', label: 'Varón' },
                { value: 'm', label: 'Mujer' },
                { value: 'i', label: 'Indeterminado' },
            ],
        },
        { key: 'etnonimos__etonimo__icontains', label: 'Etnónimo', type: 'text', placeholder: 'Buscar etnónimo...' },
        { key: 'hispanizacion__hispanizacion__icontains', label: 'Hispanización', type: 'text', placeholder: 'Buscar hispanización...' },
        { key: 'edad__gte', label: 'Edad mínima', type: 'number', placeholder: 'Min' },
        { key: 'edad__lte', label: 'Edad máxima', type: 'number', placeholder: 'Max' },
    ],
    personanoesclavizada: [
        { key: 'search', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre...' },
        {
            key: 'sexo', label: 'Sexo', type: 'select',
            options: [
                { value: '', label: 'Todos' },
                { value: 'v', label: 'Varón' },
                { value: 'm', label: 'Mujer' },
                { value: 'i', label: 'Indeterminado' },
            ],
        },
        {
            key: 'honorifico', label: 'Honorífico', type: 'select',
            options: [
                { value: '', label: 'Todos' },
                { value: 'don', label: 'Don' },
                { value: 'doña', label: 'Doña' },
                { value: 'doctor', label: 'Doctor' },
                { value: 'fray', label: 'Fray' },
                { value: 'na', label: 'N/A' },
            ],
        },
        { key: 'ocupaciones__actividad__icontains', label: 'Ocupación', type: 'text', placeholder: 'Buscar ocupación...' },
        { key: 'calidades__calidad__icontains', label: 'Calidad', type: 'text', placeholder: 'Buscar calidad...' },
    ],
    documento: [
        { key: 'search', label: 'Título', type: 'text', placeholder: 'Buscar por título...' },
        { key: 'tipo_documento__tipo_documental__icontains', label: 'Tipo documental', type: 'text', placeholder: 'Buscar tipo...' },
        { key: 'fecha_inicial__gte', label: 'Fecha desde', type: 'date', placeholder: 'AAAA-MM-DD' },
        { key: 'fecha_inicial__lte', label: 'Fecha hasta', type: 'date', placeholder: 'AAAA-MM-DD' },
    ],
    lugar: [
        { key: 'search', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre...' },
        {
            key: 'tipo', label: 'Tipo', type: 'select',
            options: [
                { value: '', label: 'Todos' },
                { value: 'ciudad', label: 'Ciudad' },
                { value: 'pueblo', label: 'Pueblo' },
                { value: 'estado', label: 'Estado' },
                { value: 'provincia/departamento', label: 'Provincia/Departamento' },
                { value: 'pais', label: 'País' },
                { value: 'region', label: 'Región' },
                { value: 'rio', label: 'Río' },
                { value: 'hacienda', label: 'Hacienda' },
                { value: 'mina', label: 'Mina' },
            ],
        },
    ],
    corporacion: [
        { key: 'search', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre...' },
        { key: 'tipo_institucion__tipo__icontains', label: 'Tipo institución', type: 'text', placeholder: 'Buscar tipo...' },
    ],
};

// ── Tab labels & icons ───────────────────────────────────────────────
export const entityTabConfig = {
    personaesclavizada: { label: 'Personas esclavizadas', icon: 'bi-person-lock', detailPath: '/Detail/personaesclavizada' },
    personanoesclavizada: { label: 'Personas no esclavizadas', icon: 'bi-person', detailPath: '/Detail/personanoesclavizada' },
    documento: { label: 'Documentos', icon: 'bi-file-text', detailPath: '/Detail/documento' },
    lugar: { label: 'Lugares', icon: 'bi-geo-alt', detailPath: '/Detail/lugar' },
    corporacion: { label: 'Corporaciones', icon: 'bi-building', detailPath: '/Detail/corporacion' },
};

// ── ID field per entity type (for building detail links) ─────────────
export const entityIdField = {
    personaesclavizada: 'persona_id',
    personanoesclavizada: 'persona_id',
    documento: 'documento_id',
    lugar: 'lugar_id',
    corporacion: 'corporacion_id',
};

// ── Cell value renderer helpers ──────────────────────────────────────
// Returns a display string for a given cell value based on column key

export function renderCellValue(entityType, columnKey, row) {
    const value = row[columnKey];

    if (value === null || value === undefined) return '—';

    // Handle nested objects
    if (columnKey === 'archivo' && typeof value === 'object') {
        return value.nombre || value.nombre_abreviado || '—';
    }
    if (columnKey === 'lugar_corporacion' && typeof value === 'object') {
        return value.nombre_lugar ? `${value.nombre_lugar} (${value.tipo || ''})` : '—';
    }
    if (columnKey === 'tipo_institucion' && typeof value === 'object') {
        return value.tipo || '—';
    }

    // Handle arrays
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '—';
    }

    // Edad with unit
    if (columnKey === 'edad' && value) {
        const unit = row.unidad_temporal_edad || 'años';
        return `${value} ${unit}`;
    }

    return String(value);
}
