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

<div class="container mt-4">
	<div class="login-container">
		<h1 class="login-title">Ingresar</h1>
		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<i class="bi bi-person"></i>
				<input type="text" placeholder="Username" bind:value={username} required />
			</div>
			<div class="form-group">
				<i class="bi bi-lock"></i>
				<input type="password" placeholder="Password" bind:value={password} required />
			</div>
			<button type="submit" class="login-btn">Entrar</button>
		</form>

		{#if error}
			<div class="error-message">
				<i class="bi bi-exclamation-circle"></i>
				{error}
			</div>
		{/if}
	</div>
</div>
