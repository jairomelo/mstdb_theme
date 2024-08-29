<script>
  let query = '';
  let currentFilter = 'all';

  function handleHeroSearch() {
      if (query) {
          window.location.href = `/Search/?q=${encodeURIComponent(query)}&filter=${currentFilter}`;
      }
  }

  function setFilter(filter) {
      currentFilter = filter;
  }
</script>

<section class="hero-section d-flex align-items-center justify-content-center text-white">
    <div class="overlay"></div>
    <div class="hero-content text-center">
        <h1 class="display-4">Rutas de la Esclavitud en Nueva España</h1>
        <p class="lead">Base de datos de personas esclavizadas en Nueva España</p>

        <form on:submit|preventDefault={handleHeroSearch} class="form-inline justify-content-center mt-4">
            <div class="input-group">
                <input type="text" bind:value={query} class="form-control form-control-lg" placeholder="Buscar...">
                <button type="submit" class="btn btn-lg btn-light search-btn">
                    <i class="bi bi-search"></i>
                </button>
            </div>
            
            <div class="hero-filter-options mt-2">
              <button type="button" class="btn btn-outline-light" on:click={() => setFilter('documentos')}>Documentos</button>
              <button type="button" class="btn btn-outline-light" on:click={() => setFilter('personas_esclavizadas')}>Personas Esclavizadas</button>
              <button type="button" class="btn btn-outline-light" on:click={() => setFilter('personas_no_esclavizadas')}>Personas No Esclavizadas</button>
              <button type="button" class="btn btn-outline-light" on:click={() => setFilter('corporaciones')}>Corporaciones</button>
            </div>
        </form>
    </div>
</section>
