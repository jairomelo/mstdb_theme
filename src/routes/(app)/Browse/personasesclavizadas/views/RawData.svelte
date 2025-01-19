<script>
    import { onMount } from 'svelte';
    import { personasescfull } from '$lib/api';

    let isClient = false;
    let dataTable;
    let tableContainer;

    // Add resize observer
    let resizeObserver;

    const handleResize = () => {
        if (dataTable) {
            dataTable.columns.adjust().draw();
        }
    };

    onMount(async () => {
        isClient = true;

        if (isClient) {
            const jQuery = (await import('jquery')).default;
            window.$ = window.jQuery = jQuery;
        
            const { initDataTablePersonasEsclavizadas } = await import('$lib/datatable');
            dataTable = await initDataTablePersonasEsclavizadas('dataTable', personasescfull);

            // Setup resize observer
            resizeObserver = new ResizeObserver(handleResize);
            if (tableContainer) {
                resizeObserver.observe(tableContainer);
            }
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (dataTable) {
                dataTable.destroy();
            }
        };
    });
</script>

<div class="card shadow" bind:this={tableContainer}>
    <div class="card-header bg-primary text-white">
        <h3 class="card-title mb-0">Personas Esclavizadas</h3>
    </div>
    <div class="card-body">
        <table id="dataTable" class="table table-striped table-hover order-column"></table>
    </div>
</div>