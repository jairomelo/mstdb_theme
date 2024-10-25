<script>

    import { tooltip } from '$lib/tooltip.js';

    import { personaLugarRel } from '$lib/api';

    export let item;

    async function fetchPersonaLugarRels(relationIds) {
        return Promise.all(relationIds.map(id => personaLugarRel(id)));
    }

    let personaLugarRelsPromise = fetchPersonaLugarRels(item.source.persona_lugar_rel);

    function getHighlights(highlight) {
		if (!highlight) return [];
		return Object.values(highlight).flat();
	}
	
</script>

<div class="list-group-item list-group-item-action">
    <div class="d-flex w-100 justify-content-between">
        <a href="/Detail/lugares/{item.source.lugar_id}">
        <h5 class="mb-1">{item.source.nombre_lugar} {#if item.source.tipo}({item.source.tipo}){/if}</h5>
    </a>
    </div>

    <div class="matches">
		{#each getHighlights(item.highlight) as highlightText}
			<small>{@html highlightText}</small>
		{/each}
	</div>
    


    {#if item.source.persona_lugar_rel && item.source.persona_lugar_rel.length > 0}
    <div class="row mt-2">
        <div class="col-md-12">
            <p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Personas relacionadas ({item.source.persona_lugar_rel.length}):</p>
            {#await personaLugarRelsPromise}
                <p>Cargando personas...</p>
            {:then personasInfo}
            
            <ul class="list-inline">
                {#if personasInfo.length < 4 }
                {#each personasInfo as personaRel, index }
                    {#each personaRel.personas as personas }
                        <li>
                            {personas.nombre_normalizado}
                        </li>
                    {/each}
                {/each}

                {:else}
                {#each personasInfo.slice(0, 3) as personaRel, index }
                    {#each personaRel.personas as personas }
                        <li>
                            {personas.nombre_normalizado}
                            {#if index == 2 }
                                    <li class="list-inline-item"><a href="/Detail/lugares/{item.source.lugar_id}">[+]</a></li>
                            {/if}
                        </li>
                    {/each}        
                {/each}
                {/if}
            </ul>

            
            {/await}
            </div>
            </div>
    {/if}

    

    <!-- {#if item.source.persona_lugar_rel.length > 0}
        {#each item.source.persona_lugar_rel.slice(0, 5) as relaciones, index}
            {#each relaciones.personas as per}
             <p>{ relaciones }</p>
            {/each}
        {/each}
        {#if item.personas_relacionadas.length > 5}
            <a href="/Detail/lugares/{item.lugar_id}" class="ms-2" use:tooltip={{ title: 'Ver todas las personas relacionadas', trigger: 'hover' }}>
                <i class="bi bi-plus-circle"></i>
            </a>
        {/if}
    {:else}
        <span>No hay personas relacionadas</span>
    {/if} -->
</div>