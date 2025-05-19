<script>
	import { login, whoami, setCsrfCookie } from '$lib/api';
	import { user } from '$lib/stores/user';


	let username = '';
	let password = '';
	let error = null;

	async function handleLogin() {
		error = null;

		try {
			await setCsrfCookie();
			await login(username, password);
			const u = await whoami(); // re-confirm session
			user.set(u);              // update global store

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
