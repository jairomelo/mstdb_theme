/**
 * Column definitions and filter configurations per entity type.
 * Used by the browse table view to render columns, sorting, and advanced filters.
 *
 * UI text is stored as Paraglide message keys (`labelKey`, `placeholderKey`,
 * `groupKey`, `options[].labelKey`) and resolved at render time in Svelte so the
 * active locale is honored. Never call `m.*()` at module scope here.
 *
 * `helpKey` points to a short localized definition shown as a tooltip on filter
 * labels and table headers. Context matters: the same visible label (e.g. "Nombre")
 * maps to a different definition per entity.
 */

import { getLocale } from '$lib/paraglide/runtime.js';
import { m } from '$lib/paraglide/messages.js';
import { ageUnitLabel } from '$lib/ageUnit.js';

// ── Column definitions ───────────────────────────────────────────────
// key: matches serializer field name
// labelKey: Paraglide message key for the display header
// sortable: whether the column supports server-side ordering
// visible: included in default view

export const columnsConfig = {
	personaesclavizada: [
		{
			key: 'short_id',
			labelKey: 'conf_col_short_id',
			helpKey: 'help_short_id',
			sortable: false,
			visible: true
		},
		{
			key: 'persona_idno',
			labelKey: 'conf_col_id',
			helpKey: 'help_persona_idno',
			sortable: true,
			visible: false
		},
		{
			key: 'nombre_normalizado',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_nombre_persona',
			sortable: true,
			visible: true
		},
		{ key: 'sexo', labelKey: 'conf_col_sexo', helpKey: 'help_sexo', sortable: true, visible: true },
		{ key: 'edad', labelKey: 'conf_col_edad', helpKey: 'help_edad', sortable: true, visible: true },
		{
			key: 'etnonimos',
			labelKey: 'conf_col_etnonimos',
			helpKey: 'help_etnonimos',
			sortable: true,
			visible: true
		},
		{
			key: 'hispanizacion',
			labelKey: 'conf_col_hispanizacion',
			helpKey: 'help_hispanizacion',
			sortable: true,
			visible: true
		},
		{
			key: 'calidades',
			labelKey: 'conf_col_calidades',
			helpKey: 'help_calidades',
			sortable: true,
			visible: true
		},
		{
			key: 'has_relaciones',
			labelKey: 'conf_col_relaciones',
			helpKey: 'help_relaciones',
			sortable: true,
			visible: true
		},
		{
			key: 'has_lugares',
			labelKey: 'conf_col_trayectoria',
			helpKey: 'help_trayectoria',
			sortable: true,
			visible: true
		},
		{
			key: 'procedencia',
			labelKey: 'conf_col_procedencia',
			helpKey: 'help_procedencia',
			sortable: true,
			visible: true
		},
		{
			key: 'estado_civil',
			labelKey: 'conf_col_estado_civil',
			helpKey: 'help_estado_civil',
			sortable: true,
			visible: true
		},
		{
			key: 'documento_list',
			labelKey: 'conf_col_documentos',
			helpKey: 'help_documentos',
			sortable: true,
			visible: true
		},
		{
			key: 'fecha_nacimiento',
			labelKey: 'conf_col_nacimiento',
			helpKey: 'help_fecha_nacimiento',
			sortable: true,
			visible: false
		},
		{
			key: 'earliest_doc_date',
			labelKey: 'conf_col_primer_registro',
			helpKey: 'help_primer_registro',
			sortable: true,
			visible: false
		},
		{
			key: 'latest_doc_date',
			labelKey: 'conf_col_ultimo_registro',
			helpKey: 'help_ultimo_registro',
			sortable: true,
			visible: false
		},
		{
			key: 'documented_span',
			labelKey: 'conf_col_periodo_anios',
			helpKey: 'help_periodo',
			sortable: true,
			visible: false
		},
		{
			key: 'altura',
			labelKey: 'conf_col_altura',
			helpKey: 'help_altura',
			sortable: true,
			visible: false
		},
		{
			key: 'cabello',
			labelKey: 'conf_col_cabello',
			helpKey: 'help_cabello',
			sortable: true,
			visible: false
		},
		{
			key: 'ojos',
			labelKey: 'conf_col_ojos',
			helpKey: 'help_ojos',
			sortable: true,
			visible: false
		},
		{
			key: 'marcas_corporales',
			labelKey: 'conf_col_marcas_corporales',
			helpKey: 'help_marcas',
			sortable: true,
			visible: false
		},
		{
			key: 'conducta',
			labelKey: 'conf_col_conducta',
			helpKey: 'help_conducta',
			sortable: true,
			visible: false
		},
		{
			key: 'salud',
			labelKey: 'conf_col_salud',
			helpKey: 'help_salud',
			sortable: true,
			visible: false
		},
		{
			key: 'evento_valor_sp_list',
			labelKey: 'conf_col_valor',
			helpKey: 'help_valor',
			sortable: false,
			visible: false
		},
		{
			key: 'evento_forma_de_pago_list',
			labelKey: 'conf_col_forma_pago',
			helpKey: 'help_forma_pago',
			sortable: false,
			visible: false
		},
		{
			key: 'evento_total_list',
			labelKey: 'conf_col_total',
			helpKey: 'help_total',
			sortable: false,
			visible: false
		},
		{
			key: 'created_at',
			labelKey: 'conf_col_creado',
			helpKey: 'help_creado',
			sortable: true,
			visible: false
		},
		{
			key: 'updated_at',
			labelKey: 'conf_col_actualizado',
			helpKey: 'help_actualizado',
			sortable: true,
			visible: false
		}
	],
	personanoesclavizada: [
		{
			key: 'short_id',
			labelKey: 'conf_col_short_id',
			helpKey: 'help_short_id',
			sortable: false,
			visible: true
		},
		{
			key: 'persona_idno',
			labelKey: 'conf_col_id',
			helpKey: 'help_persona_idno',
			sortable: true,
			visible: false
		},
		{
			key: 'nombre_normalizado',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_nombre_persona',
			sortable: true,
			visible: true
		},
		{ key: 'sexo', labelKey: 'conf_col_sexo', helpKey: 'help_sexo', sortable: true, visible: true },
		{
			key: 'ocupaciones',
			labelKey: 'conf_col_ocupaciones',
			helpKey: 'help_ocupaciones',
			sortable: true,
			visible: true
		},
		{
			key: 'calidades',
			labelKey: 'conf_col_calidades',
			helpKey: 'help_calidades',
			sortable: true,
			visible: true
		},
		{
			key: 'has_relaciones',
			labelKey: 'conf_col_relaciones',
			helpKey: 'help_relaciones',
			sortable: true,
			visible: true
		},
		{
			key: 'has_lugares',
			labelKey: 'conf_col_lugares',
			helpKey: 'help_trayectoria',
			sortable: true,
			visible: true
		},
		{
			key: 'estado_civil',
			labelKey: 'conf_col_estado_civil',
			helpKey: 'help_estado_civil',
			sortable: true,
			visible: true
		},
		{
			key: 'documento_list',
			labelKey: 'conf_col_documentos',
			helpKey: 'help_documentos',
			sortable: true,
			visible: true
		},
		{
			key: 'created_at',
			labelKey: 'conf_col_creado',
			helpKey: 'help_creado',
			sortable: true,
			visible: false
		},
		{
			key: 'updated_at',
			labelKey: 'conf_col_actualizado',
			helpKey: 'help_actualizado',
			sortable: true,
			visible: false
		}
	],
	documento: [
		{
			key: 'short_id',
			labelKey: 'conf_col_short_id',
			helpKey: 'help_short_id',
			sortable: false,
			visible: false
		},
		{
			key: 'documento_idno',
			labelKey: 'conf_col_id',
			helpKey: 'help_documento_idno',
			sortable: false,
			visible: true
		},
		{
			key: 'titulo',
			labelKey: 'conf_col_titulo',
			helpKey: 'help_titulo',
			sortable: true,
			visible: true
		},
		{
			key: 'tipo_documento',
			labelKey: 'conf_col_tipo',
			helpKey: 'help_tipo_documental',
			sortable: false,
			visible: true
		},
		{
			key: 'archivo',
			labelKey: 'conf_col_archivo',
			helpKey: 'help_archivo',
			sortable: false,
			visible: true
		},
		{
			key: 'fecha_inicial',
			labelKey: 'conf_col_fecha_inicial',
			helpKey: 'help_fecha_inicial',
			sortable: true,
			visible: true
		},
		{
			key: 'fecha_final',
			labelKey: 'conf_col_fecha_final',
			helpKey: 'help_fecha_final',
			sortable: true,
			visible: false
		},
		{
			key: 'evento_valor_sp',
			labelKey: 'conf_col_valor',
			helpKey: 'help_valor',
			sortable: false,
			visible: false
		},
		{
			key: 'evento_forma_de_pago',
			labelKey: 'conf_col_forma_pago',
			helpKey: 'help_forma_pago',
			sortable: false,
			visible: false
		},
		{
			key: 'evento_total',
			labelKey: 'conf_col_total',
			helpKey: 'help_total',
			sortable: false,
			visible: false
		},
		{
			key: 'personas_esclavizadas_count',
			labelKey: 'conf_col_personas_esclavizadas',
			helpKey: 'help_personas_esclavizadas_count',
			sortable: false,
			visible: true
		},
		{
			key: 'personas_no_esclavizadas_count',
			labelKey: 'conf_col_personas_no_esclavizadas',
			helpKey: 'help_personas_no_esclavizadas_count',
			sortable: false,
			visible: true
		},
		{
			key: 'created_at',
			labelKey: 'conf_col_creado',
			helpKey: 'help_creado',
			sortable: true,
			visible: false
		}
	],
	lugar: [
		{
			key: 'short_id',
			labelKey: 'conf_col_short_id',
			helpKey: 'help_short_id',
			sortable: false,
			visible: false
		},
		{
			key: 'nombre_lugar',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_nombre_lugar',
			sortable: true,
			visible: true
		},
		{
			key: 'tipo',
			labelKey: 'conf_col_tipo',
			helpKey: 'help_tipo_lugar',
			sortable: true,
			visible: true
		},
		{
			key: 'otros_nombres',
			labelKey: 'conf_col_otros_nombres',
			helpKey: 'help_otros_nombres',
			sortable: false,
			visible: true
		},
		{
			key: 'persona_count',
			labelKey: 'conf_col_personas',
			helpKey: 'help_persona_count',
			sortable: true,
			visible: true
		},
		{
			key: 'lat',
			labelKey: 'conf_col_latitud',
			helpKey: 'help_lat',
			sortable: false,
			visible: false
		},
		{
			key: 'lon',
			labelKey: 'conf_col_longitud',
			helpKey: 'help_lon',
			sortable: false,
			visible: false
		}
	],
	corporacion: [
		{
			key: 'short_id',
			labelKey: 'conf_col_short_id',
			helpKey: 'help_short_id',
			sortable: false,
			visible: false
		},
		{
			key: 'nombre_institucion',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_nombre_institucion',
			sortable: true,
			visible: true
		},
		{
			key: 'tipo_institucion',
			labelKey: 'conf_col_tipo',
			helpKey: 'help_tipo_institucion',
			sortable: false,
			visible: true
		},
		{
			key: 'lugar_corporacion',
			labelKey: 'conf_col_lugar',
			helpKey: 'help_lugar_corporacion',
			sortable: false,
			visible: true
		}
	]
};

// ── Default visible columns (derived from columnsConfig) ─────────────
export const defaultVisibleColumns = Object.fromEntries(
	Object.entries(columnsConfig).map(([type, cols]) => [
		type,
		cols.filter((c) => c.visible).map((c) => c.key)
	])
);

// ── Advanced filter definitions per entity type ──────────────────────
// key: query param sent to API  |  labelKey: UI label key  |  type: control type
// helpKey: localized tooltip definition  |  options: for 'select' type — {value, labelKey}

export const filtersDefinition = {
	personaesclavizada: [
		{
			key: 'search',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_search_persona',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_nombre'
		},
		{
			key: 'fecha_documento__gte',
			labelKey: 'conf_filter_desde',
			helpKey: 'help_year_range',
			type: 'year'
		},
		{
			key: 'fecha_documento__lte',
			labelKey: 'conf_filter_hasta',
			helpKey: 'help_year_range',
			type: 'year'
		},
		{
			key: 'procedencia',
			labelKey: 'conf_col_procedencia',
			helpKey: 'help_procedencia',
			type: 'id-searchable-select',
			facetKey: 'procedencias',
			groupKey: 'conf_group_trayectorias'
		},
		{
			key: 'trayectoria_lugar',
			labelKey: 'conf_filter_lugares_trayectoria',
			helpKey: 'help_filter_lugares_trayectoria',
			type: 'id-searchable-select',
			facetKey: 'lugares',
			multi: true,
			groupKey: 'conf_group_trayectorias'
		},
		{
			key: 'etnonimos__etonimo__icontains',
			labelKey: 'conf_filter_etnonimo',
			helpKey: 'help_etnonimos',
			type: 'searchable-select',
			facetKey: 'etnonimos',
			groupKey: 'conf_group_categorias_socioetnicas'
		},
		{
			key: 'hispanizacion__hispanizacion__icontains',
			labelKey: 'conf_col_hispanizacion',
			helpKey: 'help_hispanizacion',
			type: 'searchable-select',
			facetKey: 'hispanizaciones',
			groupKey: 'conf_group_categorias_socioetnicas'
		},
		{
			key: 'calidades__calidad__icontains',
			labelKey: 'conf_filter_calidad',
			helpKey: 'help_calidades',
			type: 'searchable-select',
			facetKey: 'calidades',
			groupKey: 'conf_group_categorias_socioetnicas'
		},
		{
			key: 'sexo',
			labelKey: 'conf_col_sexo',
			helpKey: 'help_sexo',
			type: 'select',
			groupKey: 'conf_group_biografia',
			options: [
				{ value: '', labelKey: 'conf_opt_todos' },
				{ value: 'v', labelKey: 'conf_opt_varon' },
				{ value: 'm', labelKey: 'conf_opt_mujer' },
				{ value: 'i', labelKey: 'conf_opt_indeterminado' }
			]
		},
		{
			key: 'estado_civil',
			labelKey: 'conf_col_estado_civil',
			helpKey: 'help_estado_civil',
			type: 'select',
			groupKey: 'conf_group_biografia',
			options: [
				{ value: '', labelKey: 'conf_opt_todos' },
				{ value: 'Casado', labelKey: 'conf_opt_casado' },
				{ value: 'Casada', labelKey: 'conf_opt_casada' },
				{ value: 'Soltero', labelKey: 'conf_opt_soltero' },
				{ value: 'Soltera', labelKey: 'conf_opt_soltera' },
				{ value: 'Viudo', labelKey: 'conf_opt_viudo' },
				{ value: 'Viuda', labelKey: 'conf_opt_viuda' },
				{ value: 'Doncella', labelKey: 'conf_opt_doncella' }
			]
		},
		{
			key: 'edad__gte',
			labelKey: 'conf_filter_edad_min',
			rangeLabelKey: 'conf_col_edad',
			helpKey: 'help_edad',
			type: 'number',
			placeholderKey: 'conf_ph_min',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'edad__lte',
			labelKey: 'conf_filter_edad_max',
			helpKey: 'help_edad',
			type: 'number',
			placeholderKey: 'conf_ph_max',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'altura__icontains',
			labelKey: 'conf_col_altura',
			helpKey: 'help_altura',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_altura',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'cabello__icontains',
			labelKey: 'conf_col_cabello',
			helpKey: 'help_cabello',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_cabello',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'ojos__icontains',
			labelKey: 'conf_col_ojos',
			helpKey: 'help_ojos',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_ojos',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'marcas_corporales__icontains',
			labelKey: 'conf_col_marcas_corporales',
			helpKey: 'help_marcas',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_marcas',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'conducta__icontains',
			labelKey: 'conf_filter_conducta_libre',
			helpKey: 'help_conducta',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_conducta',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'conducta_canonica',
			labelKey: 'conf_filter_conducta_canonica',
			helpKey: 'help_conducta_canonica',
			type: 'searchable-select',
			facetKey: 'conductas',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'salud__icontains',
			labelKey: 'conf_col_salud',
			helpKey: 'help_salud',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_salud',
			groupKey: 'conf_group_biografia'
		},
		{
			key: 'tipo_documental',
			labelKey: 'conf_filter_tipo_documental',
			helpKey: 'help_tipo_documental',
			type: 'searchable-select',
			facetKey: 'tipos_documentales',
			groupKey: 'conf_group_documento'
		},
		{
			key: 'evento_valor_sp__icontains',
			labelKey: 'conf_filter_valor_economico',
			helpKey: 'help_valor',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_valor',
			groupKey: 'conf_group_documento'
		},
		{
			key: 'archivo',
			labelKey: 'conf_col_archivo',
			helpKey: 'help_archivo',
			type: 'id-searchable-select',
			facetKey: 'archivos',
			groupKey: 'conf_group_documento'
		}
	],
	personanoesclavizada: [
		{
			key: 'search',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_search_persona',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_nombre'
		},
		{
			key: 'fecha_documento__gte',
			labelKey: 'conf_filter_desde',
			helpKey: 'help_year_range',
			type: 'year'
		},
		{
			key: 'fecha_documento__lte',
			labelKey: 'conf_filter_hasta',
			helpKey: 'help_year_range',
			type: 'year'
		},
		{
			key: 'trayectoria_lugar',
			labelKey: 'conf_filter_lugares_trayectoria',
			helpKey: 'help_filter_lugares_trayectoria',
			type: 'id-searchable-select',
			facetKey: 'lugares',
			multi: true,
			groupKey: 'conf_group_trayectorias'
		},
		{
			key: 'ocupaciones__actividad__icontains',
			labelKey: 'conf_filter_ocupacion',
			helpKey: 'help_ocupaciones',
			type: 'searchable-select',
			facetKey: 'ocupaciones',
			groupKey: 'conf_group_categorias_socioetnicas'
		},
		{
			key: 'calidades__calidad__icontains',
			labelKey: 'conf_filter_calidad',
			helpKey: 'help_calidades',
			type: 'searchable-select',
			facetKey: 'calidades',
			groupKey: 'conf_group_categorias_socioetnicas'
		},
		{
			key: 'sexo',
			labelKey: 'conf_col_sexo',
			helpKey: 'help_sexo',
			type: 'select',
			groupKey: 'conf_group_biografia',
			options: [
				{ value: '', labelKey: 'conf_opt_todos' },
				{ value: 'v', labelKey: 'conf_opt_varon' },
				{ value: 'm', labelKey: 'conf_opt_mujer' },
				{ value: 'i', labelKey: 'conf_opt_indeterminado' }
			]
		},
		{
			key: 'honorifico',
			labelKey: 'conf_filter_honorifico',
			helpKey: 'help_honorifico',
			type: 'select',
			groupKey: 'conf_group_biografia',
			options: [
				{ value: '', labelKey: 'conf_opt_todos' },
				{ value: 'don', labelKey: 'conf_opt_don' },
				{ value: 'doña', labelKey: 'conf_opt_dona' },
				{ value: 'doctor', labelKey: 'conf_opt_doctor' },
				{ value: 'fray', labelKey: 'conf_opt_fray' },
				{ value: 'na', labelKey: 'conf_opt_na' }
			]
		},
		{
			key: 'estado_civil',
			labelKey: 'conf_col_estado_civil',
			helpKey: 'help_estado_civil',
			type: 'select',
			groupKey: 'conf_group_biografia',
			options: [
				{ value: '', labelKey: 'conf_opt_todos' },
				{ value: 'Casado', labelKey: 'conf_opt_casado' },
				{ value: 'Casada', labelKey: 'conf_opt_casada' },
				{ value: 'Soltero', labelKey: 'conf_opt_soltero' },
				{ value: 'Soltera', labelKey: 'conf_opt_soltera' },
				{ value: 'Viudo', labelKey: 'conf_opt_viudo' },
				{ value: 'Viuda', labelKey: 'conf_opt_viuda' },
				{ value: 'Doncella', labelKey: 'conf_opt_doncella' }
			]
		},
		{
			key: 'tipo_documental',
			labelKey: 'conf_filter_tipo_documental',
			helpKey: 'help_tipo_documental',
			type: 'searchable-select',
			facetKey: 'tipos_documentales',
			groupKey: 'conf_group_documento'
		},
		{
			key: 'archivo',
			labelKey: 'conf_col_archivo',
			helpKey: 'help_archivo',
			type: 'id-searchable-select',
			facetKey: 'archivos',
			groupKey: 'conf_group_documento'
		}
	],
	documento: [
		{
			key: 'search',
			labelKey: 'conf_col_titulo',
			helpKey: 'help_search_documento',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_titulo'
		},
		{
			key: 'tipo_documento__tipo_documental__icontains',
			labelKey: 'conf_filter_tipo_documental',
			helpKey: 'help_tipo_documental',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_tipo'
		},
		{
			key: 'evento_valor_sp__icontains',
			labelKey: 'conf_filter_valor_economico',
			helpKey: 'help_valor',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_valor'
		},
		{
			key: 'fecha_inicial__gte',
			labelKey: 'conf_filter_fecha_desde',
			helpKey: 'help_fecha_inicial',
			type: 'date',
			placeholderKey: 'conf_ph_fecha_iso'
		},
		{
			key: 'fecha_inicial__lte',
			labelKey: 'conf_filter_fecha_hasta',
			helpKey: 'help_fecha_final',
			type: 'date',
			placeholderKey: 'conf_ph_fecha_iso'
		}
	],
	lugar: [
		{
			key: 'search',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_search_lugar',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_nombre'
		},
		{
			key: 'tipo',
			labelKey: 'conf_col_tipo',
			helpKey: 'help_tipo_lugar',
			type: 'select',
			options: [
				{ value: '', labelKey: 'conf_opt_todos' },
				{ value: 'ciudad', labelKey: 'conf_opt_ciudad' },
				{ value: 'pueblo', labelKey: 'conf_opt_pueblo' },
				{ value: 'estado', labelKey: 'conf_opt_estado_lugar' },
				{ value: 'provincia/departamento', labelKey: 'conf_opt_provincia' },
				{ value: 'pais', labelKey: 'conf_opt_pais' },
				{ value: 'region', labelKey: 'conf_opt_region' },
				{ value: 'rio', labelKey: 'conf_opt_rio' },
				{ value: 'hacienda', labelKey: 'conf_opt_hacienda' },
				{ value: 'mina', labelKey: 'conf_opt_mina' }
			]
		}
	],
	corporacion: [
		{
			key: 'search',
			labelKey: 'conf_col_nombre',
			helpKey: 'help_search_corporacion',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_nombre'
		},
		{
			key: 'tipo_institucion__tipo__icontains',
			labelKey: 'conf_col_tipo_institucion',
			helpKey: 'help_tipo_institucion',
			type: 'text',
			placeholderKey: 'conf_ph_buscar_tipo'
		},
		{
			key: 'lugar_corporacion__nombre_lugar__icontains',
			labelKey: 'conf_col_lugar',
			helpKey: 'help_lugar_corporacion',
			type: 'text',
			placeholderKey: 'conf_ph_nombre_lugar'
		}
	]
};

// ── Tab labels & icons ───────────────────────────────────────────────
export const entityTabConfig = {
	personaesclavizada: {
		labelKey: 'conf_tab_personaesclavizada',
		icon: 'bi-person-lock',
		detailPath: '/Detail/personaesclavizada'
	},
	personanoesclavizada: {
		labelKey: 'conf_tab_personanoesclavizada',
		icon: 'bi-person',
		detailPath: '/Detail/personanoesclavizada'
	},
	documento: {
		labelKey: 'conf_tab_documento',
		icon: 'bi-file-text',
		detailPath: '/Detail/documento'
	},
	lugar: { labelKey: 'conf_tab_lugar', icon: 'bi-geo-alt', detailPath: '/Detail/lugar' },
	corporacion: {
		labelKey: 'conf_tab_corporacion',
		icon: 'bi-building',
		detailPath: '/Detail/corporacion'
	}
};

// ── ID field per entity type (for building detail links) ─────────────
export const entityIdField = {
	personaesclavizada: 'persona_id',
	personanoesclavizada: 'persona_id',
	documento: 'documento_id',
	lugar: 'lugar_id',
	corporacion: 'corporacion_id'
};

// ── Cell value renderer helpers ──────────────────────────────────────
// Returns a display string for a given cell value based on column key.
// Locale-aware formatting uses the live locale at call time (never module scope).

export function renderCellValue(entityType, columnKey, row) {
	const value = row[columnKey];

	if (value === null || value === undefined) return '—';

	// Handle nested objects
	if (columnKey === 'archivo' && typeof value === 'object') {
		return value.nombre || value.nombre_abreviado || '—';
	}

	// Evento value fields — aggregated lists from the archive, plain text
	if (columnKey.startsWith('evento_')) {
		if (Array.isArray(value)) {
			return value.length > 0
				? value
						.map((v) => String(v).trim())
						.filter(Boolean)
						.join('; ') || '—'
				: '—';
		}
		const str = String(value).trim();
		return str || '—';
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

	// Edad with unit — API returns raw code (a/m/d/null); localize here
	if (columnKey === 'edad' && value) {
		return `${value} ${ageUnitLabel(row.unidad_temporal_edad)}`;
	}

	// Date fields — show year or full date for colonial-era data
	if (
		[
			'fecha_nacimiento',
			'earliest_doc_date',
			'latest_doc_date',
			'fecha_inicial',
			'fecha_final'
		].includes(columnKey) &&
		value
	) {
		const d = new Date(value);
		if (!isNaN(d)) {
			// If day/month are Jan 1 (placeholder), show year only
			if (d.getMonth() === 0 && d.getDate() === 1) return String(d.getFullYear());
			return d.toLocaleDateString(getLocale(), {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		}
	}

	// Documented span
	if (columnKey === 'documented_span' && value) {
		return value === 1
			? m.conf_year_singular({ count: value })
			: m.conf_year_plural({ count: value });
	}

	return String(value);
}
