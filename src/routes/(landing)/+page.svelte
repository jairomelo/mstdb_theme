<script>
import { onMount } from 'svelte';

  let query = '';
  let currentFilter = 'all';
  let formElement;
  let sectionElement;

  function handleHeroSearch() {
      if (query) {
          window.location.href = `/Search/?q=${encodeURIComponent(query)}&filter=${currentFilter}`;
      }
  }

  function setFilter(filter) {
    currentFilter = currentFilter === filter ? 'all' : filter;
  }

  function handleClickOutside(event) {
    if (formElement && !formElement.contains(event.target)) {
      currentFilter = 'all';
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      currentFilter = 'all';
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    sectionElement.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
      sectionElement?.removeEventListener('click', handleClickOutside);
    };
  });

</script>

<section class="hero-section d-flex align-items-center justify-content-center text-white" bind:this={sectionElement}>
    <div class="overlay"></div>
    <div class="hero-content text-center">
        <h1 class="display-4">Rutas de la Esclavitud en Nueva España</h1>
        <p class="lead">La circulación de afrodescendientes esclavizados y libres en la Nueva España</p>

        <form on:submit|preventDefault={handleHeroSearch} class="form-inline justify-content-center mt-4" bind:this={formElement}>
            <div class="input-group">
                <input type="text" bind:value={query} class="form-control form-control-lg" placeholder="Busca por palabra clave, documento, nombre, lugar...">
                <button type="submit" class="btn btn-lg btn-primary search-btn">
                    <i class="bi bi-search"></i>
                </button>
            </div>
            
            <div class="hero-filter-options mt-2">
                <button type="button" class="btn btn-outline-light" class:active={currentFilter === 'documentos'} on:click={() => setFilter('documentos')}>Documentos</button>
                <button type="button" class="btn btn-outline-light" class:active={currentFilter === 'personas_esclavizadas'} on:click={() => setFilter('personas_esclavizadas')}>Personas Esclavizadas</button>
                <button type="button" class="btn btn-outline-light" class:active={currentFilter === 'personas_no_esclavizadas'} on:click={() => setFilter('personas_no_esclavizadas')}>Personas No Esclavizadas</button>
                <button type="button" class="btn btn-outline-light" class:active={currentFilter === 'corporaciones'} on:click={() => setFilter('corporaciones')}>Corporaciones</button>
                <button type="button" class="btn btn-outline-light" class:active={currentFilter === 'personas_lugar_rel'} on:click={() => setFilter('personas_lugar_rel')}>Lugares</button>
            </div>
        </form>
    </div>
</section>
