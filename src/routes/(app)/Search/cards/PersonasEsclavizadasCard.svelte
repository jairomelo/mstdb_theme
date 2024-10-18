<script>

	import { tooltip } from '$lib/tooltip.js';

	export let peresc;
</script>

<div class="list-group-item list-group-item-action">
    <div class="row">
        <div class="col-md-6">
            <a href="/Detail/personaEsclavizada/{peresc.persona_id}">
                <h5 class="mb-2">
                    {peresc.nombre_normalizado}

                    {#if peresc.fecha_nacimiento || peresc.fecha_defuncion}
                        (<small>{peresc.fecha_nacimiento || ''}</small>)
                    {/if}
                </h5>
            </a>
            <small class="identifier">{peresc.persona_idno || ''}</small>
            <p class="mb-1">Procedencia: {peresc.procedencia || 'Desconocida'}</p>
            {#if peresc.sexo || peresc.edad}
                <small
                    >{#if peresc.sexo}Género: {peresc.sexo}
                    {/if}{#if peresc.edad} | Edad: {peresc.edad}{/if}</small
                ><br />
            {/if}
        </div>
        <div class="col-md-6">
            {#if peresc.documentos && peresc.documentos.length > 0}
                <p class="mb-1">
                    <i class="bi bi-file-earmark-text me-2"></i>Documentos asociados:
                </p>
                <ul class="list-unstyled">
                    {#each peresc.documentos.slice(0, 3) as doc}
                        <li>
                            <a
                                href="/Detail/documentos/{doc.documento_id}"
                                class="tooltip-url text-dark"
                                use:tooltip={{ title: doc.notas, trigger: 'hover' }}
                            >
                                <small
                                    >{doc.titulo.length > 50
                                        ? doc.titulo.substring(0, 50) + '...'
                                        : doc.titulo}</small
                                >
                                <i class="bi bi-box-arrow-up-right me-1"></i>
                            </a>
                        </li>
                    {/each}
                    {#if peresc.documentos.length > 3}
                        <li><small>y {peresc.documentos.length - 3} más...</small></li>
                    {/if}
                </ul>
            {:else}
                <p><small>No hay documentos asociados a esta persona.</small></p>
            {/if}
        </div>
    </div>

    {#if peresc.lugares.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Lugares transitados:</p>
                <ul class="list-inline">
                    {#each peresc.lugares as lugar, index}
                        <li class="list-inline-item">
                            <small
                                >{lugar.lugar.nombre_lugar} ({lugar.lugar.tipo}) [{lugar.documento
                                    .fecha_inicial}]</small
                            >
                            {#if index < peresc.lugares.length - 1}
                                    <li class="list-inline-item">|</li>
                            {/if}
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}

    {#if peresc.relaciones.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-people me-2"></i>Personas relacionadas:</p>
                <ul class="list-inline">
                    {#each peresc.relaciones as relacion}
                        {#each relacion.personas as personas}
                            {#if personas.persona_idno != peresc.persona_idno}
                                <li class="list-inline-item">
                                    {#if personas.polymorphic_ctype == 29}<a class="text-primary"
                                            href="/Detail/personaEsclavizada/{personas.persona_id}"
                                        >
                                            {personas.nombre_normalizado}
                                        </a>
                                    {:else}
                                        <a class="text-secondary" href="/Detail/personaNoEsclavizada/{personas.persona_id}">
                                        {personas.nombre_normalizado}
                                    </a>
                                    {/if}
                                    <span
                                        use:tooltip={{ title: relacion.descripcion_relacion, trigger: 'hover' }}
                                        ><i class="bi bi-info-circle"></i></span
                                    >
                                </li>
                            {/if}
                        {/each}
                    {/each}
                </ul>
            </div>
        </div>
    {/if}
</div>