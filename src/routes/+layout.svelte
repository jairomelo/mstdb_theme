<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '@fontsource/aleo';
	import '@fontsource/eb-garamond';
	import { dropdown, collapse } from '$lib/bootstrap-actions.js';
	import { whoami } from '$lib/api';

	import { goto } from '$app/navigation';

	import { user } from '$lib/stores/user';
	import { logout } from '$lib/api';

	const appVersion = __APP_VERSION__;

	let query = '';
	let formElement;
	let canEdit = false;

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

	onMount(async () => {
		whoami().then(u => { canEdit = u.is_staff || u.groups?.includes('colectores'); }).catch(() => {});
	});
</script>

{#if $page.url.pathname === '/'}
	<slot />
{:else}
	<a class="skip-link" href="#main-content">Saltar al contenido principal</a>
	<nav class="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">
				<i class="bi bi-house-fill" aria-hidden="true"></i>
				<span class="visually-hidden">Inicio</span>
			</a>
			<button
				class="navbar-toggler"
				type="button"
				aria-label="Alternar navegación"
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
							>Buscar/Explorar <i class="bi bi-search" aria-hidden="true"></i></a>
						</li>

						<li class="nav-item">
							<a
								class="nav-link"
								href="/Dashboard/"
								aria-current={$page.url.pathname.startsWith('/Dashboard') ? 'page' : undefined}
							>Visualizaciones</a>
						</li>

						<li class="nav-item dropdown">
							<button
								type="button"
								class="nav-link dropdown-toggle"
								data-bs-toggle="dropdown"
								aria-expanded="false"
								use:dropdown
							>
								Acerca de
							</button>
							<ul class="dropdown-menu dropdown-menu-end">
								<li>
									<a
										class="dropdown-item"
										href="/Archivos/"
										aria-current={$page.url.pathname.startsWith('/Archivos') ? 'page' : undefined}
									>Archivos</a>
								</li>
								<li>
									<a
										class="dropdown-item"
										href="/About/"
										aria-current={$page.url.pathname.startsWith('/About') ? 'page' : undefined}
									>Sobre el proyecto</a>
								</li>
							</ul>
						</li>
					</ul>

					<!-- Placeholder for authentication from the Frontend side -->
					<!-- <ul class="navbar-nav">
						<li class="nav-item dropdown">
							<a
								class="nav-link dropdown-toggle"
								id="navbarDropdown"
								role="button"
								data-bs-toggle="dropdown"
								aria-expanded="false"
								use:dropdown
							>
								<i class="bi bi-person-circle"></i>
							</a>
							<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
								{#if !$user}
									<li>
										<a class="dropdown-item" href="/User/login">Iniciar sesión</a>
									</li>
								{:else}
									<li>
										<a class="dropdown-item" href="/User/dashboard/">Panel de control</a>
									</li>
									<li><hr class="dropdown-divider" /></li>
									<li>
										<a class="dropdown-item" href="#" on:click|preventDefault={handleLogout}>
											Cerrar sesión
										</a>
									</li>
								{/if}
							</ul>
						</li>
					</ul> -->

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
			<h5>Financiamiento</h5>
			<p>
			Partes de este proyecto han sido financiadas por el University of California MRPI 
			<a href="https://www.humanities.uci.edu/routes-enslavement-americas" target="_blank" rel="noopener">
				Routes of Enslavement in the Americas
			</a>
			y la Universidad de California
			<a href="https://alianzamx.universityofcalifornia.edu/research-and-innovation/latino-studies-projects/" target="_blank" rel="noopener">
				Alianza MX — Latino Studies Projects
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
			<h5>Acerca de Trayectorias Afro</h5>
			<ul class="list-unstyled">
			<li><a href="/About">Sobre Nosotros</a></li>
			<li><a href="/Accessibility">Accesibilidad</a></li>
			{#if !canEdit}
				<li><a href="/User/login">Entrar [login]</a></li>
			{:else}
				<li><a href="/User/dashboard/">Panel de control</a></li>
				<li><a href="https://db.trayectoriasafro.org">Sistema anterior</a></li>
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
