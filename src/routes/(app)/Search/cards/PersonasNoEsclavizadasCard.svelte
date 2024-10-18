<script>

	import { tooltip } from '$lib/tooltip.js';

	export let pernoesc;
</script>

<div class="list-group-item list-group-item-action">
    <div class="row">
        <div class="col-md-6">
            <a href="/Detail/personaNoEsclavizada/{pernoesc.persona_id}">
                <h5 class="mb-2">
                    {pernoesc.nombre_normalizado}
                    {#if pernoesc.fecha_nacimiento || pernoesc.fecha_defuncion}
                        (<small>{pernoesc.fecha_nacimiento || ''}</small>)
                    {/if}
                </h5>
            </a>
            <small class="identifier">{pernoesc.persona_idno || ''}</small><br />
            {#if pernoesc.sexo || pernoesc.edad}
                <small>
                    {#if pernoesc.sexo}Género: {pernoesc.sexo}{/if}
                    {#if pernoesc.edad} | Edad: {pernoesc.edad}{/if}
                </small><br />
            {/if}
        </div>
        <div class="col-md-6">
            {#if pernoesc.documentos && pernoesc.documentos.length > 0}
                <p class="mb-1">
                    <i class="bi bi-file-earmark-text me-2"></i>Documentos asociados:
                </p>
                <ul class="list-unstyled">
                    {#each pernoesc.documentos.slice(0, 3) as doc}
                        <li>
                            <a
                                href="/Detail/documentos/{doc.documento_id}"
                                class="tooltip-url text-dark"
                                use:tooltip={{ title: doc.notas, trigger: 'hover' }}
                            >
                                <small>
                                    {doc.titulo.length > 50
                                        ? doc.titulo.substring(0, 50) + '...'
                                        : doc.titulo}
                                </small>
                                <i class="bi bi-box-arrow-up-right me-1"></i>
                            </a>
                        </li>
                    {/each}
                    {#if pernoesc.documentos.length > 3}
                        <li><small>y {pernoesc.documentos.length - 3} más...</small></li>
                    {/if}
                </ul>
            {:else}
                <p><small>No hay documentos asociados a esta persona.</small></p>
            {/if}
        </div>
    </div>

    {#if pernoesc.lugares && pernoesc.lugares.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Lugares relacionados:</p>
                <ul class="list-inline">
                    {#each pernoesc.lugares as lugar, index}
                        <li class="list-inline-item">
                            <small>{lugar.lugar.nombre_lugar} ({lugar.lugar.tipo}) [{lugar.documento.fecha_inicial}]{#if lugar.situacion_lugar} - {lugar.situacion_lugar}{/if}</small>
                        </li>
                        {#if index < pernoesc.lugares.length - 1}
                            <li class="list-inline-item">|</li>
                        {/if}
                    {/each}
                </ul>
            </div>
        </div>
    {/if}

    {#if pernoesc.relaciones && pernoesc.relaciones.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-people me-2"></i>Personas relacionadas:</p>
                <ul class="list-inline">
                    {#each pernoesc.relaciones as relacion}
                        {#each relacion.personas as personas}
                            {#if personas.persona_idno != pernoesc.persona_idno}
                                <li class="list-inline-item">
                                    {#if personas.polymorphic_ctype == 29}
                                        <a class="text-primary" href="/Detail/personaEsclavizada/{personas.persona_id}">
                                            {personas.nombre_normalizado}
                                        </a>
                                    {:else}
                                        <a class="text-secondary" href="/Detail/personaNoEsclavizada/{personas.persona_id}">
                                            {personas.nombre_normalizado}
                                        </a>
                                    {/if}
                                    <span
                                        use:tooltip={{ title: relacion.descripcion_relacion, trigger: 'hover' }}
                                    ><i class="bi bi-info-circle"></i></span>
                                </li>
                            {/if}
                        {/each}
                    {/each}
                </ul>
            </div>
        </div>
    {/if}
</div>