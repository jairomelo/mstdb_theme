<script>
    import { createEventDispatcher } from 'svelte';
    import { browseStore, toggleColumn } from '$lib/browse-store';
    import { columnsConfig } from '$conf/columns';

    export let entityType;

    const dispatch = createEventDispatcher();

    $: allColumns = columnsConfig[entityType] || [];
    $: visibleColumnKeys = $browseStore.tabs[entityType]?.visibleColumns || [];

    function handleToggle(key) {
        toggleColumn(entityType, key);
    }

    function handleClose() {
        dispatch('close');
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop show" on:click={handleClose}></div>
<div class="modal d-block" tabindex="-1" on:click={handleClose}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-dialog modal-sm" on:click|stopPropagation>
        <div class="modal-content">
            <div class="modal-header py-2">
                <h6 class="modal-title">
                    <i class="bi bi-columns me-1"></i>Configurar columnas
                </h6>
                <button type="button" class="btn-close btn-close-sm" on:click={handleClose}></button>
            </div>
            <div class="modal-body py-2">
                <div class="list-group list-group-flush">
                    {#each allColumns as col}
                        <label class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-1 px-2">
                            <input
                                type="checkbox"
                                class="form-check-input mt-0"
                                checked={visibleColumnKeys.includes(col.key)}
                                on:change={() => handleToggle(col.key)}
                            />
                            <span class="small">{col.label}</span>
                        </label>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        opacity: 0.3;
    }
    .modal {
        background: transparent;
    }
    .list-group-item {
        cursor: pointer;
    }
    .list-group-item:hover {
        background-color: #f0f0f0;
    }
</style>
