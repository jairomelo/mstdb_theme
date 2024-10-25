<script>

	import { tooltip } from '$lib/tooltip.js';

	// import api detail endpoints
	import { personaLugarRel, personaPersonasRel } from '$lib/api';

	export let item;

    async function fetchPersonaLugarRels(relationIds) {
        return Promise.all(relationIds.map(id => personaLugarRel(id)));
    }

    let personaLugarRelsPromise = fetchPersonaLugarRels(item.source.persona_lugar_rel);


    async function fetchPersonaPersonasRels(relationIds) {
        return Promise.all(relationIds.map(id => personaPersonasRel(id)));
    }

    let personaPersonasRelsPromise = fetchPersonaPersonasRels(item.source.persona_x_persona_rel);

    function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}

</script>


<div class="list-group-item list-group-item-action">
    <div class="row">
        <div class="col-md-6">
            <a href="/Detail/personaEsclavizada/{item.source.persona_id}">
                <h5 class="mb-2">
                    {item.source.nombre_normalizado}

                    {#if item.source.fecha_nacimiento || item.source.fecha_defuncion}
                        (<small>{item.source.fecha_nacimiento || ''}</small>)
                    {/if}
                </h5>
            </a>
            <small class="identifier">{item.source.persona_idno || ''}</small>
            {#if item.source.procedencia}
                <p class="mb-1">Procedencia: {item.source.procedencia.nombre_lugar || 'Desconocida'}</p>
            {/if}
            {#if item.source.sexo || item.source.edad}
                <small
                    >{#if item.source.sexo}Género: {item.source.sexo}
                    {/if}{#if item.source.edad} | Edad: {item.source.edad}{/if}</small
                ><br />
            {/if}
        </div>
        <div class="col-md-6">
            {#if item.source.documentos && item.source.documentos.length > 0}
                <p class="mb-1">
                    <i class="bi bi-file-earmark-text me-2"></i>Documentos asociados:
                </p>
                <ul class="list-unstyled">
                    {#each item.source.documentos.slice(0, 3) as doc}
                        <li>
                            <a
                                href="/Detail/documentos/{doc.documentopk}"
                                class="tooltip-url text-dark"
                                use:tooltip={{ title: doc.documento_idno, trigger: 'hover' }}
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
                    {#if item.source.documentos.length > 3}
                        <li><small>y {item.source.documentos.length - 3} más...</small></li>
                    {/if}
                </ul>
            {:else}
                <p><small>No hay documentos asociados a esta persona.</small></p>
            {/if}
        </div>
    </div>


    <div class="matches">
		{#each getHighlights(item.highlight) as highlightText}
			<small>{@html highlightText}</small>
		{/each}
	</div>

    {#if item.source.persona_lugar_rel && item.source.persona_lugar_rel.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Lugares transitados:</p>
                {#await personaLugarRelsPromise}
                    <p>Cargando lugares...</p>
                {:then lugaresInfo}
                    <ul class="list-inline">
                        {#each lugaresInfo as lugarRel, index}
                        <li class="list-inline-item">
                            <a href="/Detail/lugares/{lugarRel.lugar.lugar_id}">
                            <small
                                >{lugarRel.lugar.nombre_lugar} ({lugarRel.lugar.tipo}) [{lugarRel.documento
                                    .fecha_inicial_raw}]</small
                                >
                            </a>
                            {#if index < lugaresInfo.length - 1}
                                    <li class="list-inline-item">|</li>
                            {/if}
                        </li>
                        {/each}
                    </ul>
                {:catch error}
                    <p>Error al cargar los lugares: {error.message}</p>
                {/await}
            </div>
        </div>
    {/if}

    {#if item.source.persona_x_persona_rel && item.source.persona_x_persona_rel.length > 0}
        <div class="row mt-2">
            <div class="col-md-12">
                <p class="mb-1"><i class="bi bi-people me-2"></i>Personas relacionadas:</p>
                {#await personaPersonasRelsPromise}
                    <p>Cargando relaciones...</p>
                {:then relacionesInfo}
                    <ul class="list-inline">
                        {#each relacionesInfo as relacion, index}
                        {#each relacion.personas as personas}
                            {#if personas.persona_idno != item.persona_idno}
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
                {:catch error}
                    <p>Error al cargar las relaciones: {error.message}</p>
                {/await}
            </div>
        </div>
    {/if}
</div>