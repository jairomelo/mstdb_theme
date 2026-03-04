<script>
    import { browseStore, toggleSort } from '$lib/browse-store';
    import { columnsConfig, entityIdField, entityTabConfig, renderCellValue } from '$conf/columns';

    export let entityType;
    export let results;

    $: allColumns = columnsConfig[entityType] || [];
    $: visibleColumnKeys = $browseStore.tabs[entityType]?.visibleColumns || [];
    $: visibleColumns = allColumns.filter(c => visibleColumnKeys.includes(c.key));
    $: sortField = $browseStore.tabs[entityType]?.sortField || '';
    $: sortDir = $browseStore.tabs[entityType]?.sortDir || 'asc';
    $: idField = entityIdField[entityType];
    $: detailPath = entityTabConfig[entityType]?.detailPath || '';

    function handleSort(col) {
        if (col.sortable) {
            toggleSort(entityType, col.key);
        }
    }

    function getDetailUrl(row) {
        const id = row[idField];
        return id ? `${detailPath}/${id}` : '#';
    }
</script>

<div class="table-responsive">
    <table class="table table-sm table-striped table-hover align-middle mb-0">
        <thead class="table-light sticky-top">
            <tr>
                {#each visibleColumns as col}
                    <th
                        class:sortable={col.sortable}
                        class:sorted={sortField === col.key}
                        on:click={() => handleSort(col)}
                        style="white-space: nowrap; cursor: {col.sortable ? 'pointer' : 'default'};"
                    >
                        {col.label}
                        {#if col.sortable}
                            {#if sortField === col.key}
                                <i class="bi {sortDir === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up-alt'} ms-1"></i>
                            {:else}
                                <i class="bi bi-chevron-expand ms-1 text-muted opacity-50"></i>
                            {/if}
                        {/if}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each results as row}
                <tr class="browse-row" on:click={() => window.location.href = getDetailUrl(row)}>
                    {#each visibleColumns as col}
                        <td>
                            {#if col.key === idField || col.key === 'persona_idno' || col.key === 'documento_idno'}
                                <a href={getDetailUrl(row)} class="text-decoration-none">
                                    {renderCellValue(entityType, col.key, row)}
                                </a>
                            {:else}
                                {renderCellValue(entityType, col.key, row)}
                            {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>


