<script>
    import { onMount } from 'svelte';

    import { personasescfull } from '$lib/api';
    
    let isClient = false;

    onMount( async () => {
        isClient = true;

        if (isClient) {

            const jQuery = (await import('jquery')).default;

            window.$ = window.jQuery = jQuery;
        
            const { initDataTable, columns } = await import('$lib/datatable'); // if you want to add or replace columns, do it here

            initDataTable('dataTable', columns, personasescfull);
        }
    });
</script>

<div>
    <table id="dataTable" class="table table-striped"></table>
</div>