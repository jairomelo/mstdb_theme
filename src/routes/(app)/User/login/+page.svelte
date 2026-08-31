<script>
	import { onMount, tick } from 'svelte';
	import { login, whoami, setCsrfCookie, register, fetchPublicConfig } from '$lib/api';
	import { getCookie } from '$lib/csrf';
	import { user } from '$lib/stores/user';
	import { safeNext } from '$lib/auth';

	// --- Login ---
	let username = '';
	let password = '';
	let error = null;

	// --- Register ---
	let mode = 'login'; // 'login' | 'register'
	let reg = {
		username: '',
		first_name: '',
		last_name: '',
		email: '',
		password: '',
		confirm_password: ''
	};
	let regErrors = {};
	let regSuccess = null;
	let regLoading = false;

	// --- Turnstile ---
	let turnstileSiteKey = '';
	let turnstileToken = '';
	let turnstileWidgetId = null;

	async function switchMode(m) {
		mode = m;
		error = null;
		regErrors = {};
		regSuccess = null;
		if (m === 'register') {
			await tick();
			renderTurnstile();
		}
	}

	function renderTurnstile() {
		if (!turnstileSiteKey) return;
		const container = document.getElementById('turnstile-widget');
		if (!container) return;

		const render = () => {
			if (turnstileWidgetId !== null) {
				window.turnstile.reset(turnstileWidgetId);
				return;
			}
			turnstileWidgetId = window.turnstile.render(container, {
				sitekey: turnstileSiteKey,
				callback: (token) => {
					turnstileToken = token;
				},
				'expired-callback': () => {
					turnstileToken = '';
				},
				'error-callback': () => {
					turnstileToken = '';
				}
			});
		};

		if (window.turnstile) {
			render();
		} else {
			window._onTurnstileLoad = render;
		}
	}

	async function handleLogin() {
		error = null;
		try {
			const csrfResponse = await setCsrfCookie();
			let csrfToken = getCookie('csrftoken');
			if (!csrfToken && csrfResponse.csrfToken) {
				csrfToken = csrfResponse.csrfToken;
			}
			if (!csrfToken) {
				throw new Error('CSRF token not available. Please try again.');
			}
			await login(username, password, csrfToken);
			const u = await whoami();
			user.set(u);
			sessionStorage.setItem('ta_welcome', u.username);
			window.location.href = safeNext(new URLSearchParams(window.location.search).get('next'));
		} catch (err) {
			console.error(err);
			error = 'Usuario o contraseña incorrectos';
		}
	}

	async function handleRegister() {
		regErrors = {};
		regSuccess = null;

		if (reg.password !== reg.confirm_password) {
			regErrors.confirm_password = 'Las contraseñas no coinciden.';
			return;
		}

		if (turnstileSiteKey && !turnstileToken) {
			regErrors.turnstile = 'Por favor completa la verificación.';
			return;
		}

		regLoading = true;
		try {
			const res = await register({
				username: reg.username,
				password: reg.password,
				email: reg.email,
				first_name: reg.first_name,
				last_name: reg.last_name,
				turnstile_token: turnstileToken
			});
			regSuccess = res.detail;
			reg = {
				username: '',
				first_name: '',
				last_name: '',
				email: '',
				password: '',
				confirm_password: ''
			};
			turnstileToken = '';
			turnstileWidgetId = null;
		} catch (err) {
			if (err?.data?.errors) {
				regErrors = err.data.errors;
			} else {
				regErrors._general = err?.data?.detail || 'Error al crear la cuenta. Intenta nuevamente.';
			}
			if (window.turnstile && turnstileWidgetId !== null) {
				window.turnstile.reset(turnstileWidgetId);
				turnstileToken = '';
			}
		} finally {
			regLoading = false;
		}
	}

	onMount(async () => {
		try {
			const cfg = await fetchPublicConfig();
			turnstileSiteKey = cfg.turnstile_site_key || '';
		} catch {
			/* non-critical */
		}

		if (turnstileSiteKey) {
			window._onTurnstileLoad = () => {};
			const script = document.createElement('script');
			script.src =
				'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=_onTurnstileLoad&render=explicit';
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}
	});
</script>

<svelte:head>
	<title>{mode === 'register' ? 'Registrarse' : 'Ingresar'} — Trayectorias Afro</title>
</svelte:head>

<div class="container mt-4">
	<div class="login-container">
		{#if mode === 'login'}
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
				<button type="submit" class="login-btn">{m.keen_polite_bobcat_snip}</button>
			</form>

			{#if error}
				<div id="login-error" class="error-message" role="alert">
					<i class="bi bi-exclamation-circle" aria-hidden="true"></i>
					{error}
				</div>
			{/if}

			<p class="mt-3 text-center small">
				¿No tienes cuenta?
				<button
					type="button"
					class="btn btn-link btn-sm p-0 align-baseline"
					on:click={() => switchMode('register')}
				>
					Registrarse
				</button>
			</p>
		{:else}
			<h1 class="login-title">Registrarse</h1>

			{#if regSuccess}
				<div class="alert alert-success" role="status">
					<i class="bi bi-check-circle me-2" aria-hidden="true"></i>{regSuccess}
				</div>
				<p class="text-center small">
					<button
						type="button"
						class="btn btn-link btn-sm p-0"
						on:click={() => switchMode('login')}
					>
						← Ir a iniciar sesión
					</button>
				</p>
			{:else}
				<form on:submit|preventDefault={handleRegister} novalidate>
					<div class="form-group">
						<label for="reg-username" class="visually-hidden">Nombre de usuario</label>
						<i class="bi bi-person" aria-hidden="true"></i>
						<input
							id="reg-username"
							type="text"
							placeholder="Nombre de usuario *"
							bind:value={reg.username}
							autocomplete="username"
							required
							aria-describedby={regErrors.username ? 'err-username' : undefined}
						/>
						{#if regErrors.username}
							<span id="err-username" class="error-message" role="alert">{regErrors.username}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="reg-first" class="visually-hidden">Nombre</label>
						<i class="bi bi-person-badge" aria-hidden="true"></i>
						<input
							id="reg-first"
							type="text"
							placeholder="Nombre"
							bind:value={reg.first_name}
							autocomplete="given-name"
						/>
					</div>

					<div class="form-group">
						<label for="reg-last" class="visually-hidden">Apellido</label>
						<i class="bi bi-person-badge" aria-hidden="true"></i>
						<input
							id="reg-last"
							type="text"
							placeholder="Apellido"
							bind:value={reg.last_name}
							autocomplete="family-name"
						/>
					</div>

					<div class="form-group">
						<label for="reg-email" class="visually-hidden">Correo electrónico</label>
						<i class="bi bi-envelope" aria-hidden="true"></i>
						<input
							id="reg-email"
							type="email"
							placeholder="Correo electrónico"
							bind:value={reg.email}
							autocomplete="email"
							aria-describedby={regErrors.email ? 'err-email' : undefined}
						/>
						{#if regErrors.email}
							<span id="err-email" class="error-message" role="alert">{regErrors.email}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="reg-password" class="visually-hidden">Contraseña</label>
						<i class="bi bi-lock" aria-hidden="true"></i>
						<input
							id="reg-password"
							type="password"
							placeholder="Contraseña * (mín. 8 caracteres)"
							bind:value={reg.password}
							autocomplete="new-password"
							required
							minlength="8"
							aria-describedby={regErrors.password ? 'err-password' : undefined}
						/>
						{#if regErrors.password}
							<span id="err-password" class="error-message" role="alert">{regErrors.password}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="reg-confirm" class="visually-hidden">Confirmar contraseña</label>
						<i class="bi bi-lock-fill" aria-hidden="true"></i>
						<input
							id="reg-confirm"
							type="password"
							placeholder="Confirmar contraseña *"
							bind:value={reg.confirm_password}
							autocomplete="new-password"
							required
							aria-describedby={regErrors.confirm_password ? 'err-confirm' : undefined}
						/>
						{#if regErrors.confirm_password}
							<span id="err-confirm" class="error-message" role="alert"
								>{regErrors.confirm_password}</span
							>
						{/if}
					</div>

					{#if regErrors._general}
						<div class="error-message" role="alert">
							<i class="bi bi-exclamation-circle" aria-hidden="true"></i>
							{regErrors._general}
						</div>
					{/if}

					{#if turnstileSiteKey}
						<div id="turnstile-widget" class="my-2" aria-label="Verificación humana"></div>
						{#if regErrors.turnstile}
							<span class="error-message" role="alert">{regErrors.turnstile}</span>
						{/if}
					{/if}

					<button
						type="submit"
						class="login-btn"
						disabled={regLoading || (turnstileSiteKey && !turnstileToken)}
					>
						{#if regLoading}
							<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
						{/if}
						Crear cuenta
					</button>
				</form>

				<p class="mt-3 text-center small">
					¿Ya tienes cuenta?
					<button
						type="button"
						class="btn btn-link btn-sm p-0 align-baseline"
						on:click={() => switchMode('login')}
					>
						Iniciar sesión
					</button>
				</p>
			{/if}
		{/if}
	</div>
</div>
