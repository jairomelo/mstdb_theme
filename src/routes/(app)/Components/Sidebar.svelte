<script>
    import { slide } from 'svelte/transition';

    export let activeView;

    let isCollapsed = false;

    const toggleSidebar = () => {
        isCollapsed = !isCollapsed;
    };

    const menuItems = [
        { id: 'raw-data', label: 'Raw Data', icon: 'bi bi-table' },
        { id: 'genero', label: 'Género e Hispanización', icon: 'bi bi-pie-chart' },
        { id: 'place-people', label: 'Distribución de Personas por Lugar', icon: 'bi bi-map' }
    ];
</script>

<div class="sidebar {isCollapsed ? 'collapsed' : ''}" transition:slide>
    <div class="sidebar-header">
        <button class="toggle-btn" on:click={toggleSidebar}>
            <i class="bi {isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}"></i>
        </button>
    </div>
    <nav class="sidebar-nav">
        {#each menuItems as item}
            <button
                class="sidebar-nav-item {activeView === item.id ? 'active' : ''}"
                on:click={() => activeView = item.id}
            >
                <i class={item.icon}></i>
                {#if !isCollapsed}
                    <span class="sidebar-nav-label">{item.label}</span>
                {/if}
            </button>
        {/each}
    </nav>
</div>