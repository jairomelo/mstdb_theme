<script>
    import ArcsMap from './viz/ArcsMap.svelte';
  
    let activeView = 'arcs-map';
  </script>
  
  <div class="dashboard">
    <header>
      <h1>Dashboard</h1>
      <nav>
        <button on:click={() => activeView = 'arcs-map'}>Mostrar trayectorias</button>
        <!-- More buttons for future views -->
      </nav>
    </header>
  
    <main>
      {#if activeView === 'arcs-map'}
        <ArcsMap />
      {/if}
    </main>
  </div>
  
  <style>
    .dashboard {
      padding: 1rem;
      font-family: sans-serif;
    }
    nav button {
      margin-right: 1rem;
      padding: 0.5rem 1rem;
    }
  </style>
  