<script>
    import { createEventDispatcher } from 'svelte';

    export let open = false;
    export let message = '¿Está seguro de querer borrar este elemento? Esta acción no se puede deshacer.';
    export let confirmLabel = 'Borrar';
    export let loading = false;

    const dispatch = createEventDispatcher();
</script>

{#if open}
    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirmar borrado</h5>
                    <button type="button" class="btn-close"
                        aria-label="Cancelar"
                        on:click={() => dispatch('cancel')} />
                </div>
                <div class="modal-body">{message}</div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"
                        on:click={() => dispatch('cancel')}>Cancelar</button>
                    <button type="button" class="btn btn-danger"
                        disabled={loading}
                        on:click={() => dispatch('confirm')}>
                        {#if loading}
                            <span class="spinner-border spinner-border-sm me-1" />
                        {/if}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" />
{/if}
