import { personasescfull } from '$lib/api';
import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.html5.min';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons-bs5';

export const initDataTable = (tableId, columns) => {
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

                personasescfull(params)
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
            searching: false,
            ordering: true,
            info: true,
            dom: 'Bfrtip', // Add buttons to the table
            buttons: [
                {
                    extend: 'colvis',
                    text: 'Toggle Columns', // Button text
                    columns: ':not(:first-child)', // Exclude first column (e.g., ID)
                },
            ],
        });
    });
};
