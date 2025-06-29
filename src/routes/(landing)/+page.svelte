<script>
  import { onMount } from 'svelte';
  import { currentSuffix, currentColor, updateSuffix, titleStem } from '$lib/maintitle';
  import { animateSuffix } from '$lib/textanimation';
  import { setRandomHeroImage } from '$lib/heroBackground'; // Updated import path

  let suffixElement;
  let heroSectionElement;

  $: if ($currentSuffix) {
    animateSuffix(suffixElement, updateSuffix);
  }

  let query = '';
  let exactSearch = false;
  let currentFilter = ''; 
  let formElement;

  function handleHeroSearch() {
    if (query) {
      const filterParam = currentFilter !== '' ? `&filter=${currentFilter}` : '';
      const searchQuery = exactSearch ? `"${query}"` : query;
      window.location.href = `/Search/?q=${encodeURIComponent(searchQuery)}${filterParam}`;
    }
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

  function scrollToBody() {
    const element = document.getElementById('landing-body');
    element.scrollIntoView({ behavior: 'smooth' });
  }

  let showScrollButton = true;

  function handleScroll() {
    showScrollButton = window.scrollY < 100;
  }

  onMount(() => {
    updateSuffix();
    setRandomHeroImage(heroSectionElement); // Pass heroSectionElement here
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<section
  class="hero-section d-flex align-items-center justify-content-center text-white"
  bind:this={heroSectionElement}
>
  <div class="overlay"></div>
  <div class="hero-content text-center">
    <h1 class="display-4 dynamic-title">
		<span class="title-stem">{titleStem}</span>
		<span
		  class="title-suffix"
		  style="color: {$currentColor};"
		  bind:this={suffixElement}
		>
		  <span class="letters">
			{#each $currentSuffix.split('') as letter, i (letter + i)}
			  <span class="letter">{letter}</span>
			{/each}
		  </span>
		  <span class="line"></span>
		</span>
	  </h1>
    <p class="lead">La circulación de afrodescendientes esclavizados y libres en la Nueva España</p>

    <form
      on:submit|preventDefault={handleHeroSearch}
      class="form-inline justify-content-center mt-4"
      bind:this={formElement}
    >
      <!-- Search bar -->
      <div class="input-group mb-2">
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

      <!-- Checkbox below and right-aligned -->
      <div class="d-flex justify-content-end">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            bind:checked={exactSearch}
            id="exactSearchCheck"
          />
          <label class="form-check-label text-white" for="exactSearchCheck">
            Búsqueda exacta
          </label>
        </div>
      </div>
    </form>
  </div>

  {#if showScrollButton}
    <div class="go-to-body">
      <button 
        class="scroll-down-btn" 
        on:click={scrollToBody}
        aria-label="Scroll to content"
      >
        <i class="bi bi-chevron-double-down"></i>
      </button>
    </div>
  {/if}
</section>

<section id="landing-body">
  <div class="row database-band" data-aos="fade-up" data-aos-easing="ease" data-aos-duration="500">
    <div class="col-md-12 band-story">
      <div class="band-header">
        <div class="icon-wrapper">
          <img src="/icons/i_peresc.webp" alt="Ícono Personas Esclavizadas" class="section-icon">
        </div>
        <div class="title-group">
          <h2>Base de datos</h2>
          <h2 class="accent-title">Afrodescendientes en Nueva España</h2>
        </div>
      </div>
      <div class="band-content">
        <p>
          Esta base de datos recopila información sobre la circulación de personas afrodescendientes, 
          tanto esclavizadas como libres, en la Nueva España. Explore los registros históricos para 
          conocer más sobre sus vidas, movimientos y relaciones.
        </p>
      </div>
      <div class="band-buttons">
        <a href="/Dashboard" class="btn btn-outline-primary me-3">
          <i class="bi bi-people-fill me-2"></i>Tablero de datos
        </a>
      </div>
    </div>
  </div>

  <!-- About Section -->
  <div class="container mt-5">
    <div class="row about-section" data-aos="fade-up" data-aos-easing="ease" data-aos-duration="500">
      <div class="col-md-12">
        <h2 class="section-title">Sobre el Proyecto</h2>
        <div class="about-content">
          <p class="lead">
            El sitio web Trayectorias Afro es el resultado de colaboración entre investigadores 
            de varias instituciones de México y Estados Unidos desde 2022, para la construcción 
            de una base de datos de personas esclavizadas en la Nueva España en la que, a través 
            del análisis pormenorizado de fuentes documentales se dé cuenta de su movilidad 
            geográfica en el territorio novohispano.
          </p>
          <p>
            Este proyecto también busca democratizar la información poniendo la documentación 
            histórica al alcance de amplios sectores de la sociedad mexicana y del mundo académico.
          </p>
          <!-- Added "Read More" button -->
          <div class="text-end mt-4">
            <a href="/About" class="btn btn-outline-primary">
              <i class="bi bi-arrow-right me-2"></i>Leer más
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="row features-section mt-5" data-aos="fade-up" data-aos-easing="ease" data-aos-duration="500">
      <div class="col-md-4">
        <div class="feature-card">
          <i class="bi bi-search feature-icon"></i>
          <h3>Búsqueda</h3>
          <p>Explore registros históricos detallados sobre personas esclavizadas y libres</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="feature-card">
          <i class="bi bi-geo-alt feature-icon"></i>
          <h3>Tablero de Datos</h3>
          <p>Visualice los movimientos y rutas en el territorio novohispano</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer mt-5">
  <div class="container">
    <div class="row">
      <div class="col-md-4">
        <h5>Financiamiento</h5>
        <p>
          Partes de este proyecto han sido financiadas por el University of California MRPI 
          <a href="https://www.humanities.uci.edu/routes-enslavement-americas" target="_blank" rel="noopener">
            Routes of Enslavement in the Americas
          </a>
        </p>
      </div>
      <div class="col-md-4">
        <h5>Agradecimientos</h5>
        <p>
          Agradecemos el hospedaje web de este proyecto a la 
          <a href="https://neogranadina.org/" target="_blank" rel="noopener">Fundación Neogranadina</a>, 
          y el asesoramiento para esto de Juan Cobo de la 
          <a href="https://www.history.ucsb.edu/faculty/juan-cobo/" target="_blank" rel="noopener">
            Universidad de California, Santa Bárbara
          </a>.
        </p>
      </div>
      <div class="col-md-4">
        <h5>Enlaces Rápidos</h5>
        <ul class="list-unstyled">
          <li><a href="/About">Sobre Nosotros</a></li>
          <li><a href="/Browse/personasesclavizadas">Base de Datos</a></li>
        </ul>
      </div>
    </div>
  </div>
</footer>
