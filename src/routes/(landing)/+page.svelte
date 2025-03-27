<script>
  import { onMount } from 'svelte';
  import { currentSuffix, currentColor, updateSuffix, titleStem } from '$lib/maintitle';
  import { animateSuffix } from '$lib/textanimation';

  let suffixElement;
  let heroSectionElement;

  // Array of available hero images
  const heroImages = [
    '/media/rutas_project1.webp',
    '/media/rutas_project2.webp',
    '/media/rutas_project3.webp',
    '/media/rutas_project4.webp'
  ];

  // Function to randomly select a hero image
  function setRandomHeroImage() {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    const selectedImage = heroImages[randomIndex];
    
    if (heroSectionElement) {
      heroSectionElement.style.backgroundImage = `url('${selectedImage}')`;
    }
  }

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

/*   function setFilter(filter) {
    currentFilter = filter;
  } */

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
    setRandomHeroImage(); // Set random hero image on mount
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);
    document.addEventListener('scroll', handleScroll)

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
        <a href="/Browse/personasesclavizadas" class="btn btn-outline-primary me-3">
          <i class="bi bi-people-fill me-2"></i>Personas Esclavizadas
        </a>
        <a href="#" class="btn btn-outline-primary">
          <i class="bi bi-people-fill me-2"></i>Personas Libres
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
          <h3>Búsqueda Avanzada</h3>
          <p>Explore registros históricos detallados sobre personas esclavizadas y libres</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="feature-card">
          <i class="bi bi-geo-alt feature-icon"></i>
          <h3>Mapeo Geográfico</h3>
          <p>Visualice los movimientos y rutas en el territorio novohispano</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="feature-card">
          <i class="bi bi-file-text feature-icon"></i>
          <h3>Documentación</h3>
          <p>Acceda a fuentes documentales históricas digitalizadas</p>
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

<style>
  .form-check-label {
    font-size: 0.9rem;
  }

  .input-group-text {
    padding: 0.5rem 1rem;
    min-width: fit-content;
    display: flex;
    align-items: center;
  }

  .input-group .form-check {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .form-check-input {
    margin-right: 0.5rem;
  }

  .band-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(142, 59, 35, 0.1);
    border-radius: 50%;
    padding: 1rem;
    transition: transform 0.3s ease;
  }

  .icon-wrapper:hover {
    transform: scale(1.05);
  }

  .section-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .title-group {
    flex: 1;
  }

  @media (max-width: 768px) {
    .band-header {
      flex-direction: column;
      text-align: center;
    }

    .icon-wrapper {
      margin-bottom: 1rem;
    }
  }

  .band-buttons {
    display: flex;
    gap: 1.5rem;
  }

  .band-buttons .btn {
    transition: all 0.3s ease;
  }

  .band-buttons .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(142, 59, 35, 0.2);
  }

  @media (max-width: 768px) {
    .band-buttons {
      flex-direction: column;
      align-items: center;
    }
  }
</style>