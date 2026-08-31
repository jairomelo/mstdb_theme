<script>
	import { onMount } from 'svelte';
	import { currentSuffix, currentColor, updateSuffix, titleStem } from '$lib/maintitle';
	import { unifiedStore, loadCounts } from '$lib/unified-store';
	import { animateSuffix } from '$lib/textanimation';
	import { setRandomHeroImage } from '$lib/heroBackground'; // Updated import path
	import { user } from '$lib/stores/user';
	import { loginUrl } from '$lib/auth';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	/* global __APP_VERSION__ */
	const appVersion = __APP_VERSION__;

	let suffixElement;
	let heroSectionElement;

	$: if ($currentSuffix) {
		animateSuffix(suffixElement, updateSuffix);
	}

	let query = '';
	let exactSearch = false;
	let currentFilter = '';
	let formElement;

	$: counts = $unifiedStore.counts;

	const quickBrowseItems = [
		{ label: m.brave_early_pig_urge(), tab: 'personaesclavizada', icon: 'bi-person-fill' },
		{ label: m.free_grassy_pug_clip(), tab: 'personanoesclavizada', icon: 'bi-person' },
		{ label: m.plane_formal_slug_walk(), tab: 'lugar', icon: 'bi-geo-alt-fill' },
		{ label: m.stout_yummy_canary_commend(), tab: 'corporacion', icon: 'bi-building' },
		{ label: m.just_fluffy_grizzly_grip(), tab: 'documento', icon: 'bi-file-text' }
	];

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
		loadCounts();
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

<svelte:head>
	<title>{m.topical_bland_mouse_ascend()}</title>
</svelte:head>

<main id="main-content">
	<section
		class="hero-section d-flex align-items-center justify-content-center text-white"
		bind:this={heroSectionElement}
	>
		<div class="overlay"></div>
		<a class="hero-auth-link" href={$user ? '/User/' : loginUrl('/')}>
			<i class="bi bi-person-circle" aria-hidden="true"></i>
			{$user ? $user.username : m.equal_still_wallaby_praise()}
		</a>
		<div class="hero-content text-center">
			<h1 class="display-4 dynamic-title" aria-label="{titleStem} {$currentSuffix}">
				<span class="title-stem">{titleStem}</span>
				<span class="title-suffix" style="color: {$currentColor};" bind:this={suffixElement}>
					<span class="letters">
						{#each $currentSuffix.split('') as letter, i (letter + i)}
							<span class="letter">{letter}</span>
						{/each}
					</span>
					<span class="line"></span>
				</span>
			</h1>
			<p class="lead">
				{m.ok_awake_rabbit_drum()}
			</p>

			<form
				on:submit|preventDefault={handleHeroSearch}
				class="form-inline justify-content-center mt-4"
				bind:this={formElement}
			>
				<!-- Search bar -->
				<div class="input-group mb-2">
					<label for="hero-search" class="visually-hidden">{m.quaint_brief_pony_pat()}</label>
					<input
						id="hero-search"
						type="text"
						bind:value={query}
						class="form-control form-control-lg"
						placeholder={m.bald_zippy_warthog_nourish()}
						aria-label={m.upper_noble_crocodile_kiss()}
					/>
					<button
						type="submit"
						class="btn btn-lg btn-primary search-btn"
						aria-label={m.happy_blue_wombat_aid()}
					>
						<i class="bi bi-search" aria-hidden="true"></i>
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
							{m.simple_muddy_scallop_coax()}
						</label>
					</div>
				</div>
			</form>

			<!-- Quick-browse entity links -->
			<div class="hero-explore-row">
				{#each quickBrowseItems as item}
					<a class="hero-explore-link" href="/Search/?tab={item.tab}">
						<i class="bi {item.icon} hero-explore-icon" aria-hidden="true"></i>
						<span class="hero-explore-label">{item.label}</span>
						{#if counts[item.tab] != null}
							<span
								class="hero-explore-count"
								aria-label={m.records_count({
									count: counts[item.tab].toLocaleString(getLocale())
								})}
							>
								{counts[item.tab].toLocaleString(getLocale())}
							</span>
						{/if}
						<i class="bi bi-arrow-right hero-explore-arrow" aria-hidden="true"></i>
					</a>
				{/each}
			</div>
		</div>

		{#if showScrollButton}
			<div class="go-to-body">
				<button
					class="scroll-down-btn"
					on:click={scrollToBody}
					aria-label={m.civil_mean_elk_push()}
				>
					<i class="bi bi-chevron-double-down" aria-hidden="true"></i>
				</button>
			</div>
		{/if}
	</section>
</main>

<section id="landing-body">
	<!-- About Section -->
	<div class="container mt-5">
		<div
			class="row about-section"
			data-aos="fade-up"
			data-aos-easing="ease"
			data-aos-duration="500"
		>
			<div class="col-md-12">
				<div class="icon-wrapper">
					<img src="/icons/i_peresc.webp" alt={m.mild_quick_parakeet_dart()} class="section-icon" />
				</div>
				<h2 class="section-title">{m.low_flaky_myna_love()}</h2>
				<div class="about-content">
					<p class="lead">
						{m.late_house_capybara_dance()}
					</p>
					<p>
						{m.red_mealy_koala_buzz()}
					</p>
					<!-- Added "Read More" button -->
					<div class="text-end mt-4">
						<a href="/About" class="btn btn-outline-primary">
							<i class="bi bi-arrow-right me-2"></i>{m.weird_ok_squid_catch()}
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Features Section -->
		<div
			class="row features-section mt-5 justify-content-center"
			data-aos="fade-up"
			data-aos-easing="ease"
			data-aos-duration="500"
		>
			<div class="col-md-4">
				<a href="/Archivos" class="feature-card">
					<i class="bi bi-bank feature-icon"></i>
					<h3>{m.funny_brief_moth_feel()}</h3>
					<p>
						{m.zesty_busy_wasp_wave()}
					</p>
				</a>
			</div>
			<div class="col-md-4">
				<a href="/Dashboard" class="feature-card">
					<i class="bi bi-geo-alt feature-icon"></i>
					<h3>{m.north_ago_insect_amaze()}</h3>
					<p>{m.tense_left_eagle_compose()}</p>
				</a>
			</div>
			<div class="col-md-4">
				<a href="/lessons" class="feature-card">
					<i class="bi bi-mortarboard feature-icon"></i>
					<h3>{m.ago_cozy_tapir_aim()}</h3>
					<p>{m.dry_novel_turkey_exhale()}</p>
				</a>
			</div>
		</div>
	</div>

	<!-- Brother Projects -->
	<div class="container mt-5">
		<h2 class="section-title" data-aos="fade-up" data-aos-easing="ease" data-aos-duration="500">
			{m.sharp_full_wren_dare()}
		</h2>
		<div
			class="row justify-content-center"
			data-aos="fade-up"
			data-aos-easing="ease"
			data-aos-duration="500"
		>
			<div class="col-lg-10">
				<a
					href="https://memoricamexico.gob.mx/es/memorica/Memorias_afromexicanas"
					target="_blank"
					rel="noopener"
					class="showcase-card"
				>
					<img
						src="/media/memorica_afromexicanos.jpg"
						alt={m.vivid_least_pig_forgive()}
						class="showcase-card-img"
					/>
					<div class="showcase-card-overlay">
						<span class="showcase-card-badge">{m.lost_giant_worm_attend()}</span>
						<h3 class="showcase-card-title">{m.simple_this_giraffe_endure()}</h3>
						<span class="showcase-card-cta"
							>{m.moving_top_deer_pick()} <i class="bi bi-arrow-right"></i></span
						>
					</div>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="footer mt-5">
	<div class="container">
		<div class="row">
			<div class="col-md-4">
				<h5>{m.house_ornate_tadpole_agree()}</h5>
				<p>
					{m.silly_that_squirrel_pout()}
					<a
						href="https://www.humanities.uci.edu/routes-enslavement-americas"
						target="_blank"
						rel="noopener"
					>
						Routes of Enslavement in the Americas
					</a>
					{m.trite_good_termite_achieve()}
					<a
						href="https://alianzamx.universityofcalifornia.edu/research-and-innovation/latino-studies-projects/"
						target="_blank"
						rel="noopener"
					>
						{m.safe_known_deer_nudge()}
					</a>
				</p>
			</div>
			<div class="col-md-4">
				<h5>{m.sea_flaky_alpaca_believe()}</h5>
				<p>
					{m.tangy_merry_camel_rush()}
					<a href="https://neogranadina.org/" target="_blank" rel="noopener"
						>{m.weird_nimble_hedgehog_grow()}</a
					>{m.low_patient_baboon_enrich()}
					<a href="https://www.history.ucsb.edu/faculty/juan-cobo/" target="_blank" rel="noopener">
						{m.bland_misty_lobster_spur()}
					</a>.
				</p>
			</div>
			<div class="col-md-4">
				<h5>{m.last_early_husky_taste()}</h5>
				<ul class="list-unstyled">
					<li><a href="/About">{m.civil_awake_llama_treat()}</a></li>
					<li><a href="/Accessibility">{m.royal_civil_hare_pride()}</a></li>
					{#if !$user}
						<li><a href={loginUrl('/')}>{m.keen_polite_bobcat_snip()}</a></li>
					{:else}
						<li><a href="/User/">{m.weary_tame_peacock_expand()}</a></li>
						<li><a href="https://db.trayectoriasafro.org">{m.bad_every_lemming_tap()}</a></li>
					{/if}
				</ul>
			</div>
		</div>
		<div class="row mt-3 border-top pt-2">
			<div class="col text-center text-muted small">
				v{appVersion}
			</div>
		</div>
	</div>
</footer>
