<script>
	import { onMount } from 'svelte';
	import { whoami, updateProfile, changePassword } from '$lib/api';
	import { loginUrl } from '$lib/auth';

	let user = null;
	let error = null;

	// --- Account edit ---
	let editingAccount = false;
	let accountForm = { username: '', first_name: '', last_name: '', email: '' };
	let accountSaving = false;
	let accountSaved = false;
	let accountError = null;

	// --- Profile edit ---
	let editingProfile = false;
	let profileForm = { bio: '', institution: '', institution_url: '' };
	let profileSaving = false;
	let profileSaved = false;
	let profileError = null;

	function startEditProfile() {
		profileForm = {
			bio: user.profile?.bio || '',
			institution: user.profile?.institution || '',
			institution_url: user.profile?.institution_url || ''
		};
		profileError = null;
		profileSaved = false;
		editingProfile = true;
	}

	async function saveProfile() {
		profileSaving = true;
		profileSaved = false;
		profileError = null;
		try {
			await updateProfile(profileForm);
			user = { ...user, profile: { ...user.profile, ...profileForm } };
			profileSaved = true;
			editingProfile = false;
			setTimeout(() => {
				profileSaved = false;
			}, 3000);
		} catch (e) {
			profileError = e?.message || 'No se pudo guardar. Intenta nuevamente.';
		} finally {
			profileSaving = false;
		}
	}

	// --- Password change ---
	let showPasswordForm = false;
	let pwForm = { current_password: '', new_password: '', confirm_password: '' };
	let pwSaving = false;
	let pwSaved = false;
	let pwError = null;

	function startEditAccount() {
		accountForm = {
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email
		};
		accountError = null;
		accountSaved = false;
		editingAccount = true;
	}

	async function saveAccount() {
		accountSaving = true;
		accountSaved = false;
		accountError = null;
		try {
			const updated = await updateProfile(accountForm);
			user = { ...user, ...accountForm };
			accountSaved = true;
			editingAccount = false;
			setTimeout(() => {
				accountSaved = false;
			}, 3000);
		} catch (e) {
			accountError = e?.message || 'No se pudo guardar. Intenta nuevamente.';
		} finally {
			accountSaving = false;
		}
	}

	async function savePassword() {
		pwError = null;
		if (pwForm.new_password !== pwForm.confirm_password) {
			pwError = 'Las contraseñas no coinciden.';
			return;
		}
		if (pwForm.new_password.length < 8) {
			pwError = 'La contraseña debe tener al menos 8 caracteres.';
			return;
		}
		pwSaving = true;
		try {
			await changePassword({
				current_password: pwForm.current_password,
				new_password: pwForm.new_password
			});
			pwSaved = true;
			pwForm = { current_password: '', new_password: '', confirm_password: '' };
			showPasswordForm = false;
			setTimeout(() => {
				pwSaved = false;
			}, 4000);
		} catch (e) {
			pwError = e?.detail || e?.message || 'Error al cambiar la contraseña.';
		} finally {
			pwSaving = false;
		}
	}

	onMount(async () => {
		try {
			user = await whoami();
			if (!user) {
				window.location.href = loginUrl();
			}
		} catch {
			window.location.href = loginUrl();
		}
	});
</script>

<div class="container mt-4" style="max-width: 720px;">
	{#if user}
		<!-- Breadcrumb -->
		<nav aria-label="breadcrumb" class="mb-3">
			<ol class="breadcrumb">
				<li class="breadcrumb-item"><a href="/User">Dashboard</a></li>
				<li class="breadcrumb-item active" aria-current="page">Perfil</li>
			</ol>
		</nav>

		<!-- ── Account information ─────────────────────────────────────── -->
		<section class="mb-4" aria-labelledby="account-heading">
			<div class="cataloguer-section-header d-flex justify-content-between align-items-center">
				<h2 class="h5 mb-0" id="account-heading">
					<i class="bi bi-person-circle me-2" aria-hidden="true"></i>Cuenta
				</h2>
				{#if !editingAccount}
					<button class="btn btn-outline-secondary btn-sm" on:click={startEditAccount}>
						<i class="bi bi-pencil me-1" aria-hidden="true"></i>Editar
					</button>
				{/if}
			</div>

			{#if !editingAccount}
				<!-- Read view -->
				<dl class="row mb-0 mt-3">
					<dt class="col-sm-4">Usuario</dt>
					<dd class="col-sm-8">{user.username}</dd>

					<dt class="col-sm-4">Nombre</dt>
					<dd class="col-sm-8">{user.first_name || '—'}</dd>

					<dt class="col-sm-4">Apellido</dt>
					<dd class="col-sm-8">{user.last_name || '—'}</dd>

					<dt class="col-sm-4">Correo electrónico</dt>
					<dd class="col-sm-8">{user.email || '—'}</dd>

					<dt class="col-sm-4">Grupos</dt>
					<dd class="col-sm-8">
						{#if user.groups.length}
							{#each user.groups as g}
								<span class="badge bg-secondary me-1">{g}</span>
							{/each}
						{:else}
							<span class="text-muted">—</span>
						{/if}
						{#if user.is_staff}
							<span class="badge bg-warning text-dark me-1">Staff</span>
						{/if}
						{#if user.is_superuser}
							<span class="badge bg-danger me-1">Superusuario</span>
						{/if}
					</dd>
				</dl>

				{#if accountSaved}
					<p class="text-success small mt-2" role="status">
						<i class="bi bi-check-circle me-1" aria-hidden="true"></i>Cuenta actualizada
					</p>
				{/if}
				{#if pwSaved}
					<p class="text-success small mt-2" role="status">
						<i class="bi bi-check-circle me-1" aria-hidden="true"></i>Contraseña actualizada
					</p>
				{/if}
			{:else}
				<!-- Edit form -->
				<form on:submit|preventDefault={saveAccount} novalidate class="mt-3">
					<div class="row g-3">
						<div class="col-md-6">
							<label for="acc-username" class="form-label">Usuario</label>
							<input
								id="acc-username"
								type="text"
								class="form-control"
								bind:value={accountForm.username}
								required
								maxlength="150"
							/>
						</div>
						<div class="col-md-6">
							<label for="acc-email" class="form-label">Correo electrónico</label>
							<input
								id="acc-email"
								type="email"
								class="form-control"
								bind:value={accountForm.email}
							/>
						</div>
						<div class="col-md-6">
							<label for="acc-first" class="form-label">Nombre</label>
							<input
								id="acc-first"
								type="text"
								class="form-control"
								bind:value={accountForm.first_name}
								maxlength="150"
							/>
						</div>
						<div class="col-md-6">
							<label for="acc-last" class="form-label">Apellido</label>
							<input
								id="acc-last"
								type="text"
								class="form-control"
								bind:value={accountForm.last_name}
								maxlength="150"
							/>
						</div>
					</div>

					<div class="mt-3 d-flex gap-2 align-items-center">
						<button type="submit" class="btn btn-primary btn-sm" disabled={accountSaving}>
							{#if accountSaving}<span
									class="spinner-border spinner-border-sm me-1"
									aria-hidden="true"
								></span>{/if}
							Guardar
						</button>
						<button
							type="button"
							class="btn btn-outline-secondary btn-sm"
							on:click={() => {
								editingAccount = false;
							}}
						>
							Cancelar
						</button>
						{#if accountError}
							<span class="text-danger small" role="alert">{accountError}</span>
						{/if}
					</div>
				</form>
			{/if}

			<!-- Password change (always below, collapsed by default) -->
			<div class="mt-3">
				{#if !showPasswordForm}
					<button
						class="btn btn-link btn-sm ps-0 text-secondary"
						on:click={() => {
							showPasswordForm = true;
							pwError = null;
						}}
					>
						<i class="bi bi-key me-1" aria-hidden="true"></i>Cambiar contraseña
					</button>
				{:else}
					<form on:submit|preventDefault={savePassword} novalidate>
						<p class="fw-semibold small mb-2">Cambiar contraseña</p>
						<div class="row g-2">
							<div class="col-md-4">
								<label for="pw-current" class="form-label visually-hidden">Contraseña actual</label>
								<input
									id="pw-current"
									type="password"
									class="form-control form-control-sm"
									placeholder="Contraseña actual"
									bind:value={pwForm.current_password}
									required
									autocomplete="current-password"
								/>
							</div>
							<div class="col-md-4">
								<label for="pw-new" class="form-label visually-hidden">Nueva contraseña</label>
								<input
									id="pw-new"
									type="password"
									class="form-control form-control-sm"
									placeholder="Nueva contraseña"
									bind:value={pwForm.new_password}
									required
									autocomplete="new-password"
									minlength="8"
								/>
							</div>
							<div class="col-md-4">
								<label for="pw-confirm" class="form-label visually-hidden"
									>Confirmar contraseña</label
								>
								<input
									id="pw-confirm"
									type="password"
									class="form-control form-control-sm"
									placeholder="Confirmar contraseña"
									bind:value={pwForm.confirm_password}
									required
									autocomplete="new-password"
								/>
							</div>
						</div>
						<div class="mt-2 d-flex gap-2 align-items-center">
							<button type="submit" class="btn btn-primary btn-sm" disabled={pwSaving}>
								{#if pwSaving}<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"
									></span>{/if}
								Cambiar
							</button>
							<button
								type="button"
								class="btn btn-outline-secondary btn-sm"
								on:click={() => {
									showPasswordForm = false;
									pwForm = { current_password: '', new_password: '', confirm_password: '' };
								}}
							>
								Cancelar
							</button>
							{#if pwError}
								<span class="text-danger small" role="alert">{pwError}</span>
							{/if}
						</div>
					</form>
				{/if}
			</div>
		</section>

		<!-- ── Profile information ─────────────────────────────────────── -->
		<section class="mb-4" aria-labelledby="profile-heading">
			<div class="cataloguer-section-header d-flex justify-content-between align-items-center">
				<h2 class="h5 mb-0" id="profile-heading">
					<i class="bi bi-person-gear me-2" aria-hidden="true"></i>Información de perfil
				</h2>
				{#if !editingProfile}
					<button class="btn btn-outline-secondary btn-sm" on:click={startEditProfile}>
						<i class="bi bi-pencil me-1" aria-hidden="true"></i>Editar
					</button>
				{/if}
			</div>

			{#if !editingProfile}
				<dl class="row mb-0 mt-3">
					<dt class="col-sm-4">Institución</dt>
					<dd class="col-sm-8">{user.profile?.institution || '—'}</dd>

					<dt class="col-sm-4">URL de institución</dt>
					<dd class="col-sm-8">
						{#if user.profile?.institution_url}
							<a href={user.profile.institution_url} target="_blank" rel="noopener noreferrer"
								>{user.profile.institution_url}</a
							>
						{:else}
							—
						{/if}
					</dd>

					<dt class="col-sm-4">Semblanza</dt>
					<dd class="col-sm-8" style="white-space: pre-line;">{user.profile?.bio || '—'}</dd>
				</dl>

				{#if profileSaved}
					<p class="text-success small mt-2" role="status">
						<i class="bi bi-check-circle me-1" aria-hidden="true"></i>Perfil actualizado
					</p>
				{/if}
			{:else}
				<form on:submit|preventDefault={saveProfile} novalidate class="mt-3">
					<div class="row g-3">
						<div class="col-md-6">
							<label for="pf-institution" class="form-label">Institución</label>
							<input
								id="pf-institution"
								type="text"
								class="form-control"
								bind:value={profileForm.institution}
								maxlength="255"
							/>
						</div>
						<div class="col-md-6">
							<label for="pf-url" class="form-label">URL de institución</label>
							<input
								id="pf-url"
								type="url"
								class="form-control"
								bind:value={profileForm.institution_url}
								placeholder="https://"
							/>
						</div>
						<div class="col-12">
							<label for="pf-bio" class="form-label">Semblanza</label>
							<textarea id="pf-bio" class="form-control" rows="4" bind:value={profileForm.bio}
							></textarea>
						</div>
					</div>
					<div class="mt-3 d-flex gap-2 align-items-center">
						<button type="submit" class="btn btn-primary btn-sm" disabled={profileSaving}>
							{#if profileSaving}<span
									class="spinner-border spinner-border-sm me-1"
									aria-hidden="true"
								></span>{/if}
							Guardar
						</button>
						<button
							type="button"
							class="btn btn-outline-secondary btn-sm"
							on:click={() => {
								editingProfile = false;
							}}
						>
							Cancelar
						</button>
						{#if profileError}
							<span class="text-danger small" role="alert">{profileError}</span>
						{/if}
					</div>
				</form>
			{/if}
		</section>
	{:else if error}
		<p class="text-danger" role="alert">{error}</p>
	{:else}
		<p class="text-muted" aria-live="polite">Cargando…</p>
	{/if}
</div>
