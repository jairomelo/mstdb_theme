<script>
    import RawData from './views/RawData.svelte';
    import GeneroHispanizacion from './views/GeneroHispanizacion.svelte';

    import Sidebar from '../../Components/Sidebar.svelte';

    let activeView = 'raw-data';

</script>

<div class="dashboard-layout">
    <Sidebar bind:activeView />
    
    <main class="dashboard-content">
        {#if activeView === 'raw-data'}
            <RawData />
        {:else if activeView === 'genero'}
            <GeneroHispanizacion />
        {/if}
    </main>
</div>