<script>
	import { page } from '$app/stores';
	import '@fontsource/aleo';
	import '@fontsource/eb-garamond';
	import { dropdown, collapse } from '$lib/bootstrap-actions.js';

	import { goto } from '$app/navigation';

	let query = '';
	let formElement;

	function handleNavSearch() {
		if (query) {
			goto(`/Search/?q=${encodeURIComponent(query)}`);
		}
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
				<ul class="navbar-nav ms-auto mb-lg-0">
					<li class="nav-item dropdown">
						<a
							class="nav-link dropdown-toggle"
							id="navbarDropdown"
							role="button"
							data-bs-toggle="dropdown"
							use:dropdown
						>
							Explorar la base de datos
						</a>
						<ul class="dropdown-menu" aria-labelledby="navbarDropdown">
							<li>
								<a class="dropdown-item" href="/Browse/personasesclavizadas/"
									>Personas Esclavizadas</a
								>
							</li>
							<li>
								<a class="dropdown-item disabled" href="#">Personas No Esclavizadas</a>
							</li>
							<li><hr class="dropdown-divider" /></li>
						</ul>
					</li>
				</ul>

				<div class="d-flex align-items-center">
					<ul class="navbar-nav me-2">
						<li class="nav-item">
							<a class="nav-link" href="/About/">Acerca de</a>
						</li>
					</ul>

					{#if $page.url.pathname !== '/Search'}
						<form
							on:submit|preventDefault={handleNavSearch}
							class="d-flex"
							bind:this={formElement}
						>
							<div class="input-group">
								<input
									type="text"
									bind:value={query}
									class="form-control"
									placeholder="Buscar en la base de datos"
								/>
								<button type="submit" class="btn btn-outline-light">
									<i class="bi bi-search"></i>
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<div class="content-container">
		<slot />
	</div>
{/if}
