import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.html5.min';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons-bs5';

import { tooltip } from '$lib/tooltip.js';

// Configure columns here

export const columns = [
    {
        data: 'persona_idno',
        render: (data, type, row) =>
            `<a href="/Detail/personaesclavizada/${row.persona_id}" class="text-decoration-none">${data.split('-').pop()}</a>`,
        title: 'Persona ID',
    },
    { data: 'nombre_normalizado', title: 'Nombre' },
    { data: 'sexo', title: 'Sexo' },
    {
        data: 'edad',
        render: (data, type, row) =>
            data ? `${data} ${row.unidad_temporal_edad === undefined ? 'años' : row.unidad_temporal_edad}` : '-',
        title: 'Edad',
    },
    {
        data: 'hispanizacion',
        render: (data) => (data && data.length > 0 ? data.join(', ') : '-'),
        title: 'Hispanizaciones',
    },
    {
        data: 'etnonimos',
        render: (data) => (data && data.length > 0 ? data.join(', ') : '-'),
        title: 'Etnónimos',
    },
    {
        data: 'ocupaciones',
        render: (data) => (data && data.length > 0 ? data.join(', ') : '-'),
        title: 'Ocupaciones',
    },
    {
        data: 'marcas_corporales',
        render: (data) => data || '-',
        title: 'Marcas Corporales',
    },
    {
        data: 'documentos',
        render: (data) =>
            data && data.length > 0
                ? data
                      .map(
                          (doc) =>
                              `<a href="/Detail/documento/${doc.documento_id}" class="text-decoration-none">${
                                  doc.tipo_documento || doc.titulo.substring(0, 30)
                              }</a>`
                      )
                      .join('<br>')
                : '-',
        title: 'Documentos',
    },
    {
        data: 'relaciones',
        render: (data, type, row) => {
            if (!data || data.length === 0) return '-';
            
            return data.map(relacion => {
                // Filter out the current person from the personas array
                const otherPersonas = relacion.personas.filter(persona => 
                    persona.persona_id !== row.persona_id
                );
                
                if (otherPersonas.length === 0) return null;
                
                return otherPersonas.map(persona => {
                    const baseUrl = persona.polymorphic_ctype === 29 ? 
                        '/Detail/personaesclavizada/' : 
                        '/Detail/personanoesclavizada/';

                    const classColor = persona.polymorphic_ctype === 29 ? 'text-danger' : 'text-success';

                    return `<a href="${baseUrl}${persona.persona_id}" 
                        class="${classColor} text-decoration-none" 
                        data-bs-toggle="tooltip"
                        data-bs-title="${relacion.descripcion_relacion || ''}">${
                        persona.nombre_normalizado} (${relacion.naturaleza_relacion})</a>`;
                }).join(', ');
            })
            .filter(Boolean)
            .join('<br>');
        },
        title: 'Relaciones',
        createdCell: function(td, cellData, rowData, row, col) {
            const links = td.getElementsByTagName('a');
            Array.from(links).forEach(link => {
                tooltip(link);
            });
        }
    },
    {
        data: 'lugares',
        render: (data) => {
            if (!data || data.length === 0) return '-';
            
            // Sort the lugares array
            const sortedLugares = [...data].sort((a, b) => {
                // First sort by date
                const dateA = new Date(a.documento.fecha_inicial);
                const dateB = new Date(b.documento.fecha_inicial);
                
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA - dateB;
                }
                
                // If same date, sort by ordinal with negative first
                // Handle cases where ordinal might be null
                const ordinalA = a.ordinal ?? 0;
                const ordinalB = b.ordinal ?? 0;
                
                if (ordinalA < 0 && ordinalB >= 0) return -1;
                if (ordinalA >= 0 && ordinalB < 0) return 1;
                return ordinalA - ordinalB;
            });
            
            return sortedLugares.map(item => {
                const fecha = new Date(item.documento.fecha_inicial)
                    .getFullYear();
                
                return `${fecha}, <a href="/Detail/lugar/${item.lugar.lugar_id}" 
                    class="text-decoration-none">${item.lugar.nombre_lugar} 
                    (${item.lugar.tipo})</a>`;
            }).join(' => ');
        },
        title: 'Lugares'
    }
];

export const initDataTable = (tableId, columns, endpointresponse) => {
    jQuery(document).ready(() => {
        jQuery(`#${tableId}`).DataTable({
            processing: true,
            serverSide: true,
            ajax: (data, callback) => {
                const params = {
                    start: Math.floor(data.start / data.length) + 1,
                    length: data.length,
                };

                if (data.search.value) {
                    params.search = data.search.value;
                }

                endpointresponse(params)
                    .then((response) => {
                        callback({
                            draw: data.draw,
                            recordsTotal: response.count,
                            recordsFiltered: response.count,
                            data: response.results,
                        });
                    })
                    .catch((error) => {
                        console.error('Error loading data:', error);
                        callback({
                            draw: data.draw,
                            recordsTotal: 0,
                            recordsFiltered: 0,
                            data: [],
                        });
                    });
            },
            columns,
            paging: true,
            pageLength: 25,
            searching: false,
            ordering: true,
            order: [[0, 'asc']],
            info: true,
            layout: {
                topStart: 'buttons',
                topEnd: 'pageLength',
                bottomStart: 'info',
                bottomEnd: 'paging'
            },
            buttons: [
                {
                    extend: 'colvis',
                    text: 'Toggle Columns', 
                    columns: ':not(:first-child)', 
                },
            ],
        });
    });
};
