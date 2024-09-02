<script>
    import { onMount } from 'svelte';
    import { tooltip } from '$lib/tooltip.js';

    export let data;
    let documento = null;
    let error = null;

    onMount(async () => {
        try {
            const endpoint = `http://localhost/mdb/api/documentos/${data.id}/`;
            const response = await fetch(endpoint);
            
            if (response.ok) {
                documento = await response.json();
                // Initialize tooltips after the DOM has updated
                setTimeout(() => {
                    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                    tooltipTriggerList.map(tooltipTriggerEl => new tooltip(tooltipTriggerEl));
                }, 0);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (e) {
            error = e.message;
            console.error("Failed to fetch document:", e);
        }
    });

    let treeExpanded = false;

    function toggleFullTree() {
        treeExpanded = !treeExpanded;
        // Update the class of the archive-tree div
        const archiveTreeElement = document.querySelector('.archive-tree');
        if (archiveTreeElement) {
            archiveTreeElement.classList.toggle('expanded', treeExpanded);
        }
    }
</script>

<div class="container mt-4">
    {#if error}
        <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
        </div>
    {:else if documento}
        <div class="card">
            <div class="card-header bg-dark bg-gradient text-white">
                <h1 class="card-title mb-0">{documento.titulo}</h1>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong><i class="bi bi-fingerprint me-2"></i>ID:</strong> {documento.documento_idno}</p>
                        <p><strong><i class="bi bi-file-earmark-text me-2"></i>Tipo de documento:</strong> {documento.tipo_documento}</p>
                        <p><strong><i class="bi bi-calendar-range me-2"></i>Fecha:</strong> {documento.fecha_inicial_raw || 'N/A'}{documento.fecha_final_raw && documento.fecha_final_raw !== documento.fecha_inicial_raw ? ` - ${documento.fecha_final_raw}` : ''}</p>

                        <div class="archive-tree">
                            <button type="button" class="btn btn-link p-0 text-start" on:click={toggleFullTree}>
                                <h5>
                                    <i class="bi" class:bi-chevron-right={!treeExpanded} class:bi-chevron-down={treeExpanded}></i>
                                    Ubicación del documento:
                                </h5>
                            </button>
                            {#if treeExpanded}
                            <ul class="tree">
                                <li>
                                    <span><i class="bi bi-archive me-2"></i>{documento.archivo?.nombre || 'Archivo'}</span>
                                    <ul>
                                        <li>
                                            <span><i class="bi bi-folder me-2"></i>{documento.fondo || 'Fondo'}</span>
                                            <ul>
                                                <li>
                                                    {#if documento.subfondo}<span><i class="bi bi-folder2 me-2"></i>{documento.subfondo}</span>{/if}
                                                    <ul>
                                                        <li>
                                                            {#if documento.serie}<span><i class="bi bi-folder2 me-2"></i>{documento.serie}</span>{/if}
                                                            <ul>
                                                                <li>
                                                                    {#if documento.subserie}<span><i class="bi bi-folder2 me-2"></i>{documento.subserie}</span>{/if}
                                                                    <ul>
                                                                        {#if documento.tipo_udc || documento.unidad_documental_compuesta}
                                                                            <li>
                                                                                <span><i class="bi bi-folder2 me-2"></i>{documento.tipo_udc || 'Unidad Documental'}{documento.unidad_documental_compuesta ? `. ${documento.unidad_documental_compuesta}` : ''}</span>
                                                                                {#if documento.folio_inicial}
                                                                                    <ul>
                                                                                        <li>
                                                                                            <span><i class="bi bi-file-earmark-richtext me-2"></i>Folio: {documento.folio_inicial}{documento.folio_final ? ` - ${documento.folio_final}` : ''}</span>
                                                                                        </li>
                                                                                    </ul>
                                                                                {/if}
                                                                            </li>
                                                                        {/if}
                                                                    </ul>
                                                                </li>
                                                            </ul>
                                                        </li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            {/if}
                        </div>
                    </div>
                    <div class="col-md-6">
                        
                        <p><strong><i class="bi bi-geo-alt me-2"></i>Lugar de producción:</strong> {documento.lugar_de_produccion || 'No disponible'}</p>
                        <p><strong><i class="bi bi-exclamation-circle me-2"></i>Deteriorado:</strong> {documento.deteriorado ? 'Sí' : 'No'}</p>
                    </div>
                </div>
                <div class="mt-3">
                    <h5><i class="bi bi-card-text me-2"></i>Descripción:</h5>
                    <p>{documento.descripcion || 'No disponible'}</p>
                </div>
                <div class="mt-3">
                    <h5><i class="bi bi-pencil-square me-2"></i>Notas:</h5>
                    <p>{documento.notas || 'No disponible'}</p>
                </div>
                <div class="mt-3 text-muted">
                    <small data-bs-toggle="tooltip" data-bs-placement="top" title="Fecha de creación">
                        <i class="bi bi-clock-history me-1"></i>Creado: {new Date(documento.created_at).toLocaleString()}
                    </small>
                    <small class="ms-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Última actualización">
                        <i class="bi bi-clock me-1"></i>Actualizado: {new Date(documento.updated_at).toLocaleString()}
                    </small>
                </div>
            </div>
        </div>
    {:else}
        <div class="d-flex justify-content-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    {/if}
</div>