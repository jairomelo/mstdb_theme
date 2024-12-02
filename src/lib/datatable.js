import { personasescfull } from '$lib/api';

/**
 * Initialize DataTable with server-side processing.
 * @param {string} tableId 
 * @param {Object} columns 
 */
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
            scrollCollapse: true,
            scrollY: 400,
            scrollX: true,
            paging: true,
            searching: true,
            ordering: true,
            info: true,
        });
    });
};
