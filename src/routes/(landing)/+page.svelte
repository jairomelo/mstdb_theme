<script>
  import { onMount } from 'svelte';

  let query = '';
  let currentFilter = ''; 
  let formElement;

  function handleHeroSearch() {
    if (query) {
      const filterParam = currentFilter !== '' ? `&filter=${currentFilter}` : '';
      window.location.href = `/Search/?q=${encodeURIComponent(query)}${filterParam}`;
    }
  }

  function setFilter(filter) {
    currentFilter = filter;
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

<section
  class="hero-section d-flex align-items-center justify-content-center text-white"
>
  <div class="overlay"></div>
  <div class="hero-content text-center">
    <h1 class="display-4">Rutas de la Esclavitud en Nueva España</h1>
    <p class="lead">La circulación de afrodescendientes esclavizados y libres en la Nueva España</p>

    <form
      on:submit|preventDefault={handleHeroSearch}
      class="form-inline justify-content-center mt-4"
      bind:this={formElement}
    >
      <div class="input-group">
        <input
          type="text"
          bind:value={query}
          class="form-control form-control-lg"
          placeholder="Busca por palabra clave, documento, nombre, lugar..."
        />
        <button type="submit" class="btn btn-lg btn-primary search-btn">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <div class="hero-filter-options mt-2">
        <button
          type="button"
          class="btn btn-outline-light"
          class:active={currentFilter === 'documento'}
          on:click={() => setFilter('documento')}
        >
          Documentos
        </button>
        <button
          type="button"
          class="btn btn-outline-light"
          class:active={currentFilter === 'personaesclavizada'}
          on:click={() => setFilter('personaesclavizada')}
        >
          Personas Esclavizadas
        </button>
        <button
          type="button"
          class="btn btn-outline-light"
          class:active={currentFilter === 'personanoesclavizada'}
          on:click={() => setFilter('personanoesclavizada')}
        >
          Personas No Esclavizadas
        </button>
        <button
          type="button"
          class="btn btn-outline-light"
          class:active={currentFilter === 'corporacion'}
          on:click={() => setFilter('corporacion')}
        >
          Corporaciones
        </button>
        <button
          type="button"
          class="btn btn-outline-light"
          class:active={currentFilter === 'lugar'}
          on:click={() => setFilter('lugar')}
        >
          Lugares
        </button>
      </div>
    </form>
  </div>
</section>
