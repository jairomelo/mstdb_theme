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
	<nav class="navbar navbar-dark fixed-top bg-transparent">
		<div class="container-fluid">
			<button
				class="navbar-toggler ms-2"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="false"
				aria-label="Toggle navigation"
				use:collapse
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item dropdown">
						<a
							class="nav-link dropdown-toggle"
							id="navbarDropdown"
							role="button"
							data-bs-toggle="dropdown"
							aria-expanded="false"
							use:dropdown
						>
							Explorar la base de datos
						</a>
						<ul class="dropdown-menu" aria-labelledby="navbarDropdown" data-bs-popper="none">
							<li>
								<a class="dropdown-item" href="/Browse/personasesclavizadas/"
									>Personas Esclavizadas</a
								>
							</li>
							<li><hr class="dropdown-divider" /></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</nav>
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
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item dropdown">
						<a
							class="nav-link active dropdown-toggle"
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

				{#if $page.url.pathname !== '/Search'}
					<form
						on:submit|preventDefault={handleNavSearch}
						class="d-flex ms-auto"
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
	</nav>

	<div class="content-container">
		<slot />
	</div>
{/if}
