<script>
    import { goto } from '$app/navigation';
    import { unifiedStore, toggleSort } from '$lib/unified-store';
    import { columnsConfig, entityIdField, entityTabConfig, renderCellValue } from '$conf/columns';

    export let entityType;
    export let results;

    $: allColumns = columnsConfig[entityType] || [];
    $: visibleColumnKeys = $unifiedStore.tabs[entityType]?.visibleColumns || [];
    $: visibleColumns = allColumns.filter(c => visibleColumnKeys.includes(c.key));
    $: sortField = $unifiedStore.tabs[entityType]?.sortField || '';
    $: sortDir = $unifiedStore.tabs[entityType]?.sortDir || 'asc';
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

    function handleRowClick(e, row) {
        // Don't navigate if user clicked an <a> inside the row (it handles its own navigation)
        if (e.target.closest('a')) return;
        goto(getDetailUrl(row));
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
                <tr class="browse-row" on:click={(e) => handleRowClick(e, row)}>
                    {#each visibleColumns as col}
                        <td>
                            {#if col.key === idField || col.key === 'persona_idno' || col.key === 'documento_idno'}
                                <a href={getDetailUrl(row)} class="text-decoration-none">
                                    {renderCellValue(entityType, col.key, row)}
                                </a>
                            {:else if col.key === 'has_relaciones' && (entityType === 'personaesclavizada' || entityType === 'personanoesclavizada')}
                                {#if row.has_relaciones}
                                    <a href="{getDetailUrl(row)}#relations-network"
                                       class="text-decoration-none" title="Ver red de relaciones"
                                       on:click|stopPropagation>
                                        <i class="bi bi-diagram-3 text-primary"></i>
                                    </a>
                                {:else}
                                    <span class="text-muted">—</span>
                                {/if}
                            {:else if col.key === 'has_lugares' && (entityType === 'personaesclavizada' || entityType === 'personanoesclavizada')}
                                {#if row.has_lugares}
                                    <a href="{getDetailUrl(row)}#places-map"
                                       class="text-decoration-none" title="Ver trayectoria"
                                       on:click|stopPropagation>
                                        <i class="bi bi-geo-alt text-success"></i>
                                    </a>
                                {:else}
                                    <span class="text-muted">—</span>
                                {/if}
                            {:else if col.key === 'documento_list' && (entityType === 'personaesclavizada' || entityType === 'personanoesclavizada')}
                                {#if row.documento_list?.length > 0}
                                    <span class="d-flex gap-1 flex-wrap">
                                        {#each row.documento_list as doc}
                                            <a href="/Detail/documento/{doc.documento_id}"
                                               class="text-decoration-none" title={doc.titulo || doc.documento_idno}
                                               on:click|stopPropagation>
                                                <i class="bi bi-file-earmark-text"></i>
                                            </a>
                                        {/each}
                                    </span>
                                {:else}
                                    <span class="text-muted">—</span>
                                {/if}
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


