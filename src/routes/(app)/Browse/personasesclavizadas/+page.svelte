<script>
    import { onMount } from 'svelte';
    import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
    import 'datatables.net-bs5';

    import { initDataTable } from '$lib/datatable';

    onMount(() => {
    const columns = [
        {
            data: 'persona_idno',
            render: (data, type, row) => `<a href="/Detail/personaesclavizada/${row.persona_id}" class="text-decoration-none">${data.split('-').pop()}</a>`,
            title: 'Persona ID',
        },
        { data: 'nombre_normalizado', title: 'Nombre' },
        { data: 'sexo', title: 'Sexo' },
        { 
            data: 'edad', 
            render: (data, type, row) => data ? `${data} ${row.unidad_temporal_edad === undefined ? 'años' : row.unidad_temporal_edad}` : '-',
            title: 'Edad' 
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

        initDataTable('dataTable', columns);
    });
</script>

<div>
    
        <table id="dataTable" class="table table-striped">
            <thead>
                <tr>
                    <th>Persona ID</th>
                    <th>Nombre</th>
                    <th>Sexo</th>
                    <th>Edad</th>
                    <th>Hispanizaciones</th>
                    <th>Etnónimos</th>
                    <th>Ocupaciones</th>
                    <th>Marcas Corporales</th>
                    <th>Documentos</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

</div>


