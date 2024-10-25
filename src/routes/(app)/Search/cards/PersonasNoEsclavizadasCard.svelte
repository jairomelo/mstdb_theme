<script>

	import { tooltip } from '$lib/tooltip.js';
    import { personaLugarRel, personaPersonasRel } from '$lib/api';

	export let pernoesc;

    async function fetchPersonaLugarRels(relationIds) {
        return Promise.all(relationIds.map(id => personaLugarRel(id)));
    }

    async function fetchPersonaPersonasRels(relationIds) {
        return Promise.all(relationIds.map(id => personaPersonasRel(id)));
    }

    let personaLugarRelsPromise = fetchPersonaLugarRels(pernoesc.source.persona_lugar_rel || []);
    let personaPersonasRelsPromise = fetchPersonaPersonasRels(pernoesc.source.persona_x_persona_rel || []);

    function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}

</script>

<div class="list-group-item list-group-item-action">
    <div class="row">
        <div class="col-md-6">
            <a href="/Detail/personaNoEsclavizada/{pernoesc.source.persona_id}">
                <h5 class="mb-2">
                    {pernoesc.source.nombre_normalizado}
                    {#if pernoesc.source.fecha_nacimiento || pernoesc.source.fecha_defuncion}
                        (<small>{pernoesc.source.fecha_nacimiento || ''}</small>)
                    {/if}
                </h5>
            </a>
            <small class="identifier">{pernoesc.source.persona_idno || ''}</small><br />
            {#if pernoesc.source.sexo || pernoesc.source.edad}
                <small
                    >{#if pernoesc.source.sexo}Género: {pernoesc.source.sexo}
                    {/if}{#if pernoesc.source.edad} | Edad: {pernoesc.source.edad}{/if}</small
                ><br />
            {/if}
        </div>
        <div class="col-md-6">
            {#if pernoesc.source.documentos && pernoesc.source.documentos.length > 0}
                <p class="mb-1">
                    <i class="bi bi-file-earmark-text me-2"></i>Documentos asociados:
                </p>
                <ul class="list-unstyled">
                    {#each pernoesc.source.documentos.slice(0, 3) as doc}
                        <li>
                            <a
                                href="/Detail/documentos/{doc.documentopk}"
                                class="tooltip-url text-dark"
                                use:tooltip={{ title: doc.documento_idno, trigger: 'hover' }}
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
                    {#if pernoesc.source.documentos.length > 3}
                        <li><small>y {pernoesc.source.documentos.length - 3} más...</small></li>
                    {/if}
                </ul>
            {:else}
                <p><small>No hay documentos asociados a esta persona.</small></p>
            {/if}
        </div>
    </div>

    
    <div class="matches">
		{#each getHighlights(pernoesc.highlight) as highlightText}
			<small>{@html highlightText}</small>
		{/each}
	</div>


    {#if pernoesc.source.persona_lugar_rel && pernoesc.source.persona_lugar_rel.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Lugares relacionados:</p>
                {#await personaLugarRelsPromise}
                    <p>Cargando lugares...</p>
                {:then lugaresInfo}
                    <ul class="list-inline">
                        {#each lugaresInfo as lugarRel, index}
                            <li class="list-inline-item">
                                <a href="/Detail/lugares/{lugarRel.lugar.lugar_id}">
                                    <small>{lugarRel.lugar.nombre_lugar} ({lugarRel.lugar.tipo}) [{lugarRel.documento.fecha_inicial_raw}]{#if lugarRel.situacion_lugar} - {lugarRel.situacion_lugar}{/if}</small>
                                </a>
                            </li>
                            {#if index < lugaresInfo.length - 1}
                                <li class="list-inline-item">|</li>
                            {/if}
                        {/each}
                    </ul>
                {:catch error}
                    <p>Error al cargar los lugares: {error.message}</p>
                {/await}
            </div>
        </div>
    {/if}

    {#if pernoesc.persona_x_persona_rel && pernoesc.persona_x_persona_rel.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-people me-2"></i>Personas relacionadas:</p>
                {#await personaPersonasRelsPromise}
                    <p>Cargando relaciones...</p>
                {:then relacionesInfo}
                    <ul class="list-inline">
                        {#each relacionesInfo as relacion}
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
                {:catch error}
                    <p>Error al cargar las relaciones: {error.message}</p>
                {/await}
            </div>
        </div>
    {/if}
</div>