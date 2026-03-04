<script>
    import { getFilterConfigByValue } from '$conf/filters.js';
    import { entityIdField, entityTabConfig } from '$conf/columns';
    import { renderCellValue } from '$conf/columns';

    import DocumentCard from './cards/DocumentCard.svelte';
    import PersonasEsclavizadasCard from './cards/PersonasEsclavizadasCard.svelte';
    import PersonasNoEsclavizadasCard from './cards/PersonasNoEsclavizadasCard.svelte';
    import CorporacionesCard from './cards/CorporacionesCard.svelte';
    import LugaresCard from './cards/LugaresCard.svelte';

    export let entityType;
    export let results;

    const componentMap = {
        personaesclavizada: PersonasEsclavizadasCard,
        personanoesclavizada: PersonasNoEsclavizadasCard,
        corporacion: CorporacionesCard,
        lugar: LugaresCard,
        documento: DocumentCard,
    };

    $: cardComponent = componentMap[entityType];

    // Wrap browse results to match the search card interface: { type, source }
    function wrapItem(row) {
        return {
            type: entityType,
            source: row,
        };
    }
</script>

<div class="list-group mb-4">
    {#each results as row}
        {#if cardComponent}
            <svelte:component
                this={cardComponent}
                item={wrapItem(row)}
                iconClass={getFilterConfigByValue(entityType)?.icon}
            />
        {/if}
    {/each}
</div>
