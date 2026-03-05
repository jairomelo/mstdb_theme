<script>
    import { onMount } from 'svelte';
    import StaticPlacePeople from './StaticPlacePeople.svelte';
    import DinamicPlacePeople from './DinamicPlacePeople.svelte';

    let activeTab = 'static';
</script>

<div class="tabs">
    <button 
        class:active={activeTab === 'static'} 
        on:click={() => activeTab = 'static'}>
        Vista Estática
    </button>
    <button 
        class:active={activeTab === 'dynamic'} 
        on:click={() => activeTab = 'dynamic'}>
        Vista Dinámica
    </button>
</div>

<div class="tab-content">
    {#if activeTab === 'static'}
        <StaticPlacePeople />
    {:else}
        <DinamicPlacePeople />
    {/if}
</div>