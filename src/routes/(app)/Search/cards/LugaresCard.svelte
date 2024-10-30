<script>
    import Card from './Card.svelte';
    import { getFilterConfigByValue } from '$conf/filters.js';
    import { personaLugarRel } from '$lib/api';
    import { tooltip } from '$lib/tooltip.js';

    export let item;

    // Get the icon class for this type
    const iconClass = getFilterConfigByValue(item.type)?.icon || 'bi-geo-alt';

    function getHighlights(highlight) {
        if (!highlight) return [];
        return Object.values(highlight).flat();
    }

    async function fetchPersonaLugarRels(relationIds) {
        return Promise.all(relationIds.map(id => personaLugarRel(id)));
    }

    let personaLugarRelsPromise = fetchPersonaLugarRels(item.source.persona_lugar_rel || []);
</script>

<Card {item}>
    <!-- Icon Slot -->
    <span slot="icon">
        <i class="bi {iconClass} fs-1 text-primary"></i>
    </span>

    <!-- Custom Title -->
    <span slot="title">
        {item.source.nombre_lugar}
    </span>

    <!-- Custom Header Info -->
    <span slot="header-info">
        {#if item.source.tipo}({item.source.tipo}){/if}
    </span>

    <!-- Custom Content -->
    <div class="place-info mt-2">
        <!-- Identifier -->
        <p class="mb-1">
            <small class="text-muted">ID: {item.source.lugar_id || 'N/A'}</small>
        </p>

        <!-- Highlights -->
        {#if getHighlights(item.highlight).length > 0}
            <div class="highlights mt-2">
                <p class="mb-1 fw-bold">
                    <i class="bi bi-search me-2"></i>Coincidencias:
                </p>
                <ul class="list-unstyled mb-0">
                    {#each getHighlights(item.highlight).slice(0, 3) as highlightText}
                        <li>
                            <small>{@html highlightText}</small>
                        </li>
                    {/each}
                    {#if getHighlights(item.highlight).length > 3}
                        <li><small>y {getHighlights(item.highlight).length - 3} más...</small></li>
                    {/if}
                </ul>
            </div>
        {/if}

        <!-- Related Persons -->
        {#if item.source.persona_lugar_rel && item.source.persona_lugar_rel.length > 0}
            <div class="related-persons mt-3">
                <p class="mb-1 fw-bold">
                    <i class="bi bi-people me-2"></i>Personas relacionadas ({item.source.persona_lugar_rel.length}):
                </p>
                {#await personaLugarRelsPromise}
                    <p><small>Cargando personas...</small></p>
                {:then personasInfo}
                    <ul class="list-unstyled mb-0">
                        {#each personasInfo.slice(0, 3) as personaRel}
                            {#each personaRel.personas as persona}
                                <li>
                                    <a href="/Detail/{persona.polymorphic_ctype == 29 ? 'personaesclavizada' : 'personanoesclavizada'}/{persona.persona_id}" class="text-decoration-none">
                                        {persona.nombre_normalizado}
                                    </a>
                                </li>
                            {/each}
                        {/each}
                        {#if personasInfo.length > 3}
                            <li>
                                <a href="/Detail/lugar/{item.source.lugar_id}" class="text-decoration-none">
                                    <small>y {personasInfo.length - 3} más...</small>
                                </a>
                            </li>
                        {/if}
                    </ul>
                {:catch error}
                    <p><small>Error al cargar las personas: {error.message}</small></p>
                {/await}
            </div>
        {/if}
    </div>
</Card>
