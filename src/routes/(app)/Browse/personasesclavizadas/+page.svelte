<script>
    import { onMount } from 'svelte';
    import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
    import jQuery from 'jquery';
    import 'datatables.net-bs5';

    import { personasescfull } from '$lib/api';

    let tableData = [];
    let dataLoaded = false;

    onMount(async () => {
        try {
            const res = await personasescfull();
            tableData = res;
            dataLoaded = true;

            // console.log(tableData);

            jQuery(document).ready(function () {
                jQuery('#dataTable').DataTable({
                    scrollCollapse: true,
                    scrollY: 400,
                    scrollX: true,
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true
                });
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
</script>

<div>
    {#if !dataLoaded}
        <p>Loading...</p>
    {:else}
        <table id="dataTable" class="table table-striped">
            <thead>
                <tr>
                    <th>Persona ID</th>
                    <th>Nombre</th>
                    <th>Sexo</th>
                    <th>Documentos</th>
                </tr>
            </thead>
            <tbody>
                {#each tableData.results as row}
                <tr>
                    <td>{row.persona_idno.split('-').pop()}</td>
                    <td>{row.nombre_normalizado}</td>
                    <td>{row.sexo}</td>
                    <td>{#if row.documentos.length > 0}
                            {#each row.documentos as doc}
                                <a href="/Detail/documento/{doc.documento_id}" class="text-decoration-none">
                                    {#if doc.tipo_documento != null} {doc.tipo_documento } {:else} {doc.titulo.substring(0, 30)} {/if}
                                </a>
                            {/each}
                        {/if}
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>


