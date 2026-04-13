<script>
    import { createEventDispatcher } from 'svelte';
    import { hasPerm } from '$lib/stores/user';

    export let title = '';
    export let icon = 'bi-person';
    export let entities = [];
    export let idField = 'persona_id';
    export let addPermission = '';
    export let unlinkPermission = '';
    export let emptyLabel = 'Agregar';

    const dispatch = createEventDispatcher();
</script>

<div class="card mb-4">
    <div class="card-header cataloguer-section-header py-2">
        <span class="fw-semibold"><i class="bi {icon} me-1"></i>{title}</span>
        {#if $hasPerm(addPermission)}
        <button class="btn btn-outline-primary btn-sm" on:click={() => dispatch('add')}>
            <i class="bi bi-plus-lg me-1"></i>Agregar
        </button>
        {/if}
    </div>
    <div class="card-body">
        <div class="row g-3">
            {#each entities as entity (entity[idField])}
            <div class="col-md-6 col-lg-4">
                <div class="hub-card h-100">
                    <slot {entity} />
                    {#if $hasPerm(unlinkPermission)}
                    <div class="hub-card-actions">
                        <button
                            class="btn btn-outline-danger btn-sm"
                            title="Desvincular del evento"
                            on:click={() => dispatch('unlink', entity)}
                        >
                            <i class="bi bi-x-lg me-1"></i>Desvincular
                        </button>
                    </div>
                    {/if}
                </div>
            </div>
            {/each}

            {#if entities.length === 0}
            <div class="col-12">
                <div
                    class="hub-card-empty"
                    role="button"
                    tabindex="0"
                    on:click={() => $hasPerm(addPermission) && dispatch('add')}
                    on:keydown={e => (e.key === 'Enter' || e.key === ' ') && $hasPerm(addPermission) && (e.preventDefault(), dispatch('add'))}
                >
                    <i class="bi bi-plus-circle fs-3 text-muted"></i>
                    <span class="text-muted small mt-2">{emptyLabel}</span>
                </div>
            </div>
            {/if}
        </div>
    </div>
</div>
