<script>
    import RawData from './views/RawData.svelte';
    import GeneroHispanizacion from './views/GeneroHispanizacion.svelte';
    import PlacePeople from './views/PlacePeople.svelte';
    import Sidebar from '../../Components/Sidebar.svelte';

    let activeView = 'raw-data';
</script>

<div class="dashboard-layout content-container">
    <Sidebar bind:activeView />
    
    <main class="dashboard-content">
        {#if activeView === 'raw-data'}
            <RawData />
        {:else if activeView === 'genero'}
            <GeneroHispanizacion />
        {:else if activeView === 'place-people'}
            <PlacePeople />
        {/if}
    </main>
</div>

<style>
    .dashboard-layout {
        position: relative;
        min-height: calc(100vh - 56px); /* Subtract navbar height */
    }

    /* Adjust these values if you're using a different navbar height for larger screens */
    @media (min-width: 992px) {
        .dashboard-layout {
            min-height: calc(100vh - 60px);
        }
    }
</style>
