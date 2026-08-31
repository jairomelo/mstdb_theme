<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '@fontsource/aleo';
	import '@fontsource/eb-garamond';
	import { dropdown, collapse } from '$lib/bootstrap-actions.js';
	import { whoami } from '$lib/api';
	import { m } from '$lib/paraglide/messages.js';

	import { goto, afterNavigate } from '$app/navigation';

	import { user } from '$lib/stores/user';
	import { logout } from '$lib/api';
	import { loginUrl } from '$lib/auth';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';

	const currentLocale = getLocale();

	async function toggleLanguage() {
		const nextLocale = currentLocale === 'es' ? 'en' : 'es';
		await setLocale(nextLocale);
	}

	const WELCOME_DURATION_MS = 3000;

	const appVersion = __APP_VERSION__;

	let query = '';
	let formElement;
	let welcome = null;

	function handleNavSearch() {
		if (query) {
			goto(`/Search/?q=${encodeURIComponent(query)}`);
		}
	}

	async function handleLogout() {
		await logout();
		user.set(null);
		localStorage.removeItem('user');
		window.location.href = '/';
	}

	let welcomeTimeout;

	function dismissWelcome() {
		welcome = null;
		clearTimeout(welcomeTimeout);
	}

	onMount(async () => {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = currentLocale;
		}
		try {
			const u = await whoami();
			user.set(u);
		} catch {
			user.set(null);
		}
		const w = sessionStorage.getItem('ta_welcome');
		if (w) {
			sessionStorage.removeItem('ta_welcome');
			welcome = w;
			welcomeTimeout = setTimeout(dismissWelcome, WELCOME_DURATION_MS);
		}
	});

	// Dismiss the welcome banner as soon as the user moves to another page.
	afterNavigate(({ from }) => {
		if (from) dismissWelcome();
	});
</script>

{#if welcome}
	<div
		class="alert alert-success alert-dismissible fade show welcome-alert"
		role="status"
		aria-live="polite"
	>
		<i class="bi bi-check-circle me-2" aria-hidden="true"></i>{m.fine_chunky_grizzly_bump()}
		<strong>{welcome}</strong>
		<button
			type="button"
			class="btn-close"
			aria-label={m.cute_slimy_orangutan_gleam()}
			on:click={dismissWelcome}
		></button>
	</div>
{/if}
{#if $page.url.pathname === '/'}
	<slot />
{:else}
	<a class="skip-link" href="#main-content">{m.born_frail_jaguar_amuse()}</a>
	<nav class="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">
				<i class="bi bi-house-fill" aria-hidden="true"></i>
				<span class="visually-hidden">{m.tame_patient_vole_trip()}</span>
			</a>
			<button
				class="navbar-toggler"
				type="button"
				aria-label={m.blue_arable_niklas_breathe()}
				aria-controls="navbarSupportedContent"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				use:collapse
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<div class="d-flex align-items-center ms-auto">
					<ul class="navbar-nav me-2">
						<li class="nav-item">
							<a
								class="nav-link"
								href="/Search/"
								aria-current={$page.url.pathname.startsWith('/Search') ? 'page' : undefined}
								>{m.candid_late_sparrow_hug()} <i class="bi bi-search" aria-hidden="true"></i></a
							>
						</li>

						<li class="nav-item">
							<a
								class="nav-link"
								href="/Dashboard/"
								aria-current={$page.url.pathname.startsWith('/Dashboard') ? 'page' : undefined}
								>{m.candid_such_lamb_hug()}</a
							>
						</li>

						<li class="nav-item dropdown">
							<button
								type="button"
								class="nav-link dropdown-toggle"
								data-bs-toggle="dropdown"
								aria-expanded="false"
								use:dropdown
							>
								{m.only_factual_grizzly_dance()}
							</button>
							<ul class="dropdown-menu dropdown-menu-end">
								<li>
									<a
										class="dropdown-item"
										href="/Archivos/"
										aria-current={$page.url.pathname.startsWith('/Archivos') ? 'page' : undefined}
										>{m.sweet_sleek_shrimp_pop()}</a
									>
								</li>
								<li>
									<a
										class="dropdown-item"
										href="/About/"
										aria-current={$page.url.pathname.startsWith('/About') ? 'page' : undefined}
										>{m.seemly_same_quail_boost()}</a
									>
								</li>
							</ul>
						</li>
					</ul>

					<ul class="navbar-nav">
						<li class="nav-item dropdown">
							<button
								type="button"
								class="nav-link dropdown-toggle user-dropdown-toggle"
								id="navbarDropdown"
								data-bs-toggle="dropdown"
								aria-expanded="false"
								aria-label={$user ? m.user_menu_named({ username: $user.username }) : m.user_menu()}
								use:dropdown
							>
								<i class="bi bi-person-circle" aria-hidden="true"></i>
								<span class="user-dropdown-name"
									>{#if $user}{$user.username}{:else}{m.keen_polite_bobcat_snip}{/if}</span
								>
							</button>
							<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
								{#if !$user}
									<li>
										<a class="dropdown-item" href={loginUrl($page.url.pathname + $page.url.search)}
											>{m.start_session()}</a
										>
									</li>
								{:else}
									<li>
										<a class="dropdown-item" href="/User/">{m.weary_tame_peacock_expand()}</a>
									</li>
									<li>
										<a class="dropdown-item" href="/User/profile">{m.perfil()}</a>
									</li>
									<li><hr class="dropdown-divider" /></li>
									<li>
										<a class="dropdown-item" href="#" on:click|preventDefault={handleLogout}>
											{m.end_session()}
										</a>
									</li>
								{/if}
							</ul>
						</li>
					</ul>

					<ul class="navbar-nav ms-lg-2">
						<li class="nav-item">
							<button
								type="button"
								class="btn btn-link nav-link px-2 d-flex align-items-center gap-1"
								on:click={toggleLanguage}
								aria-label={currentLocale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
							>
								<i class="bi bi-translate" aria-hidden="true"></i>
								<span>{currentLocale === 'es' ? 'EN' : 'ES'}</span>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</nav>

	<div id="main-content" class="content-container" tabindex="-1">
		<slot />
	</div>

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
{/if}
