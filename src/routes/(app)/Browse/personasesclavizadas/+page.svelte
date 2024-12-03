<script>
    import { onMount } from 'svelte';
    import { personasescfull } from '$lib/api';
    
    let isClient = false;

    onMount(async () => {
        isClient = true;

        if (isClient) {
            const jQuery = (await import('jquery')).default;
            window.$ = window.jQuery = jQuery;
        
            const { initDataTablePersonasEsclavizadas } = await import('$lib/datatable');
            initDataTablePersonasEsclavizadas('dataTable', personasescfull);
        }
    });
</script>

<div class="container mt-4">
    <div class="card shadow">
        <div class="card-header bg-primary text-white">
            <h3 class="card-title mb-0">Personas Esclavizadas</h3>
        </div>
        <div class="card-body">
            <table id="dataTable" class="table table-striped table-hover order-column"></table>
        </div>
    </div>
</div>
