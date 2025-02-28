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
  let currentFilter = ''; 
  let formElement;

  function handleHeroSearch() {
    if (query) {
      const filterParam = currentFilter !== '' ? `&filter=${currentFilter}` : '';
      window.location.href = `/Search/?q=${encodeURIComponent(query)}${filterParam}`;
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
      <h2>Base de datos</h2>
      <h2 class="accent-title">Afrodescendientes en Nueva España</h2>
    </div>
    <div class="band-content">
      <p>
        Esta base de datos recopila información sobre la circulación de personas afrodescendientes, 
        tanto esclavizadas como libres, en la Nueva España. Explore los registros históricos para 
        conocer más sobre sus vidas, movimientos y relaciones.
      </p>
    </div>
    <div class="band-buttons">
      <a href="/Browse/personasesclavizadas">
        <button class="band-btn">Personas Esclavizadas</button>
      </a>
      <a href="#">
        <button class="band-btn">Personas Libres</button>
      </a>
    </div>
  </div>
</div>

</section>