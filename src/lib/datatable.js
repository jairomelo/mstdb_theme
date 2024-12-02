import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.html5.min';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons-bs5';

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
