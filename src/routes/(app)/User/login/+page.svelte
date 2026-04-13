<script>
	import { login, whoami, setCsrfCookie } from '$lib/api';
	import { getCookie } from '$lib/csrf';
	import { user } from '$lib/stores/user';


	let username = '';
	let password = '';
	let error = null;

	async function handleLogin() {
		error = null;

		try {
			// console.log("All cookies before setCsrfCookie:", document.cookie);
			const csrfResponse = await setCsrfCookie();
			// console.log("CSRF Response:", csrfResponse);
			// console.log("All cookies after setCsrfCookie:", document.cookie);
			
			// Try to get token from cookie first
			let csrfToken = getCookie("csrftoken");
			// console.log("CSRF Token from cookie:", csrfToken);
			
			// If cookie failed, use the token from response
			if (!csrfToken && csrfResponse.csrfToken) {
				csrfToken = csrfResponse.csrfToken;
				console.log("Using CSRF Token from response:", csrfToken);
			}
			
			if (!csrfToken) {
				throw new Error("CSRF token not available. Please try again.");
			}
			
			// Pass the token explicitly to login
			await login(username, password, csrfToken);
			const u = await whoami();
			user.set(u);

			window.location.href = '/User/dashboard';
		} catch (err) {
			console.error(err);
			error = 'An error occurred during login';
		}
	}
</script>

<svelte:head>
	<title>Ingresar — Trayectorias Afro</title>
</svelte:head>

<div class="container mt-4">
	<div class="login-container">
		<h1 class="login-title">Ingresar</h1>
		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<label for="login-username" class="visually-hidden">Nombre de usuario</label>
				<i class="bi bi-person" aria-hidden="true"></i>
				<input
					id="login-username"
					type="text"
					placeholder="Nombre de usuario"
					bind:value={username}
					autocomplete="username"
					aria-describedby={error ? 'login-error' : undefined}
					required
				/>
			</div>
			<div class="form-group">
				<label for="login-password" class="visually-hidden">Contraseña</label>
				<i class="bi bi-lock" aria-hidden="true"></i>
				<input
					id="login-password"
					type="password"
					placeholder="Contraseña"
					bind:value={password}
					autocomplete="current-password"
					aria-describedby={error ? 'login-error' : undefined}
					required
				/>
			</div>
			<button type="submit" class="login-btn">Entrar</button>
		</form>

		{#if error}
			<div id="login-error" class="error-message" role="alert">
				<i class="bi bi-exclamation-circle" aria-hidden="true"></i>
				{error}
			</div>
		{/if}
	</div>
</div>
