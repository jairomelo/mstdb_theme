import { personasescfull } from '$lib/api';

/**
 * Initialize DataTable with server-side processing.
 * @param {string} tableId - The ID of the table element.
 * @param {Object} columns - The column configuration for DataTables.
 */
export const initDataTable = (tableId, columns) => {
    jQuery(document).ready(() => {
        jQuery(`#${tableId}`).DataTable({
            processing: true,
            serverSide: true,
            ajax: (data, callback) => {
                // Map DataTables parameters to API parameters
                const params = {
                    start: Math.floor(data.start / data.length) + 1, // Use DataTables start as page number
                    length: data.length, // Page size
                };

                if (data.search.value) {
                    params.search = data.search.value; // Add search term if present
                }

                // Fetch data from API
                personasescfull(params)
                    .then((response) => {
                        callback({
                            draw: data.draw, // DataTables draw count
                            recordsTotal: response.count, // Total records
                            recordsFiltered: response.count, // Total filtered records
                            data: response.results, // Data for current page
                        });
                    })
                    .catch((error) => {
                        console.error('Error loading data:', error);
                        callback({
                            draw: data.draw,
                            recordsTotal: 0,
                            recordsFiltered: 0,
                            data: [], // Return an empty dataset on error
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
