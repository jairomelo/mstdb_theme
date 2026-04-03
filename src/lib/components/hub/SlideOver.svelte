<script>
    import { createEventDispatcher } from 'svelte';
    import { fly } from 'svelte/transition';

    export let open = false;
    export let title = '';

    const dispatch = createEventDispatcher();

    function close() {
        open = false;
        dispatch('close');
    }

    function onKeydown(e) {
        if (e.key === 'Escape') close();
    }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
    <!-- Backdrop -->
    <div class="slide-over-backdrop" role="presentation" on:click={close} />

    <!-- Panel -->
    <div class="slide-over-panel"
         role="dialog"
         aria-modal="true"
         aria-label={title}
         transition:fly={{ x: 400, duration: 250 }}>
        <div class="slide-over-header">
            <h5 class="mb-0">{title}</h5>
            <button type="button" class="btn-close" aria-label="Cerrar" on:click={close} />
        </div>
        <div class="slide-over-body">
            <slot />
        </div>
    </div>
{/if}
