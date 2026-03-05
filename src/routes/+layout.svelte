<script>
	import { page } from '$app/stores';
	import '@fontsource/aleo';
	import '@fontsource/eb-garamond';
	import { dropdown, collapse } from '$lib/bootstrap-actions.js';

	import { goto } from '$app/navigation';

	import { user } from '$lib/stores/user';
	import { logout } from '$lib/api';

	let query = '';
	let formElement;

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
</script>

{#if $page.url.pathname === '/'}
	<slot />
{:else}
	<nav class="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="/"><i class="bi bi-house-fill"></i></a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				use:collapse
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<!-- Add ms-auto class to push everything to the right -->
				<div class="d-flex align-items-center ms-auto">
					<ul class="navbar-nav me-2">
						<li class="nav-item">
							<a class="nav-link" href="/Search/">Buscar/Explorar <i class="bi bi-search"></i></a>
						</li>

						<li class="nav-item">
							<a class="nav-link" href="/Dashboard/">Visualizaciones</a>
						</li>

					
						<li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" use:dropdown>
								Acerca de
							</a>
								<ul class="dropdown-menu">
									<li>
										<a class="dropdown-item" href="/Archivos/">Archivos</a>
									</li>
									<li>
										<a class="dropdown-item" href="/About/">Acerca de</a>
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

	<div class="content-container">
		<slot />
	</div>
{/if}
