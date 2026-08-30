<script>
	import {
		addLeccionAcceso,
		updateLeccionAcceso,
		deleteLeccionAcceso,
		lookupUsers
	} from '$lib/api.js';

	export let leccionId;
	export let accesos = [];

	let message = null;
	let query = '';
	let results = [];
	let selected = null;
	let searching = false;
	let lookupError = null;
	let newRole = 'collaborator';
	let busy = false;
	let timer;

	$: ownerCount = accesos.filter((a) => a.role === 'owner').length;

	function roleLabel(role) {
		return role === 'owner' ? 'Propietario/a' : 'Colaborador/a';
	}

	function onQueryInput() {
		selected = null;
		results = [];
		lookupError = null;
		clearTimeout(timer);
		if (query.trim().length < 2) return;
		timer = setTimeout(searchUsers, 300);
	}

	async function searchUsers() {
		searching = true;
		lookupError = null;
		try {
			results = await lookupUsers(query.trim());
			results = results.filter((u) => !accesos.some((a) => a.username === u.username));
		} catch (e) {
			lookupError = 'No se pudo buscar usuarios.';
			results = [];
		} finally {
			searching = false;
		}
	}

	function pick(u) {
		selected = u;
		query = u.username;
		results = [];
	}

	async function addUser() {
		if (!selected) {
			lookupError = 'Selecciona un usuario de la búsqueda.';
			return;
		}
		busy = true;
		message = null;
		try {
			const created = await addLeccionAcceso(leccionId, {
				username: selected.username,
				role: newRole
			});
			accesos = [...accesos, created];
			query = '';
			selected = null;
			newRole = 'collaborator';
			message = { type: 'success', text: `Se añadió a ${created.username}.` };
		} catch (e) {
			const detail = e.data?.username?.join?.(' ') || e.data?.detail || e.message;
			message = { type: 'danger', text: detail };
		} finally {
			busy = false;
		}
	}

	async function changeRole(acceso, role) {
		const prev = acceso.role;
		if (role === prev) return;
		accesos = accesos.map((a) =>
			a.leccion_acceso_id === acceso.leccion_acceso_id ? { ...a, role } : a
		);
		message = null;
		try {
			const updated = await updateLeccionAcceso(leccionId, acceso.leccion_acceso_id, { role });
			accesos = accesos.map((a) =>
				a.leccion_acceso_id === updated.leccion_acceso_id ? updated : a
			);
			message = { type: 'success', text: 'Rol actualizado.' };
		} catch (e) {
			accesos = accesos.map((a) =>
				a.leccion_acceso_id === acceso.leccion_acceso_id ? { ...a, role: prev } : a
			);
			message = { type: 'danger', text: e.data?.detail || e.message };
		}
	}

	async function removeAcceso(acceso) {
		message = null;
		try {
			await deleteLeccionAcceso(leccionId, acceso.leccion_acceso_id);
			accesos = accesos.filter((a) => a.leccion_acceso_id !== acceso.leccion_acceso_id);
			message = { type: 'success', text: `Se quitó el acceso a ${acceso.username}.` };
		} catch (e) {
			message = { type: 'danger', text: e.data?.detail || e.message };
		}
	}
</script>

<section class="card mb-4" aria-label="Personas con acceso a la lección">
	<div class="card-header fw-semibold">Colaboración</div>
	<div class="card-body">
		{#if message}
			<div class="alert alert-{message.type} py-2" role="status">{message.text}</div>
		{/if}

		{#if accesos.length}
			<ul class="list-group mb-3">
				{#each accesos as acceso (acceso.leccion_acceso_id)}
					<li class="list-group-item d-flex flex-wrap align-items-center gap-2">
						<div class="me-auto">
							<strong>{acceso.username}</strong>
							{#if acceso.full_name}
								<span class="text-muted"> — {acceso.full_name}</span>
							{/if}
						</div>
						<label class="visually-hidden" for="role-{acceso.leccion_acceso_id}">
							Rol de {acceso.username}
						</label>
						<select
							id="role-{acceso.leccion_acceso_id}"
							class="form-select form-select-sm w-auto"
							value={acceso.role}
							on:change={(e) => changeRole(acceso, e.target.value)}
							disabled={acceso.role === 'owner' && ownerCount <= 1}
						>
							<option value="owner">Propietario/a</option>
							<option value="collaborator">Colaborador/a</option>
						</select>
						<button
							type="button"
							class="btn btn-sm btn-outline-danger"
							on:click={() => removeAcceso(acceso)}
							disabled={acceso.role === 'owner' && ownerCount <= 1}
							aria-label="Quitar acceso a {acceso.username}"
						>
							<i class="bi bi-x-lg" aria-hidden="true"></i>
						</button>
					</li>
				{/each}
			</ul>
			{#if ownerCount <= 1}
				<p class="form-text mb-3">La lección debe conservar al menos una persona propietaria.</p>
			{/if}
		{:else}
			<p class="text-muted">Sin accesos registrados.</p>
		{/if}

		<form class="row g-2 align-items-end" on:submit|preventDefault={addUser}>
			<div class="col-md-5 position-relative">
				<label class="form-label" for="colab-username">Añadir usuario</label>
				<input
					id="colab-username"
					class="form-control"
					placeholder="Nombre de usuario…"
					bind:value={query}
					on:input={onQueryInput}
					autocomplete="off"
					aria-describedby="colab-lookup-hint"
				/>
				<div id="colab-lookup-hint" class="visually-hidden">
					Escribe al menos dos caracteres para buscar usuarios.
				</div>
				{#if results.length || searching}
					<ul class="list-group position-absolute w-100 colab-lookup-results">
						{#if searching}
							<li class="list-group-item text-muted small">Buscando…</li>
						{/if}
						{#each results as u (u.username)}
							<li>
								<button
									type="button"
									class="list-group-item list-group-item-action w-100 text-start"
									on:click={() => pick(u)}
								>
									{u.username}
									{#if u.first_name || u.last_name}
										<span class="text-muted">— {`${u.first_name} ${u.last_name}`.trim()}</span>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				{#if lookupError}
					<div class="invalid-feedback d-block">{lookupError}</div>
				{/if}
				{#if selected}
					<div class="form-text">
						Seleccionado: <strong>{selected.username}</strong>
						{#if selected.first_name || selected.last_name}
							({`${selected.first_name} ${selected.last_name}`.trim()})
						{/if}
					</div>
				{/if}
			</div>
			<div class="col-md-4">
				<label class="form-label" for="colab-role">Rol</label>
				<select id="colab-role" class="form-select" bind:value={newRole}>
					<option value="collaborator">Colaborador/a (edita contenido)</option>
					<option value="owner">Propietario/a (control total)</option>
				</select>
			</div>
			<div class="col-md-3">
				<button type="submit" class="btn btn-outline-primary w-100" disabled={busy || !selected}>
					{#if busy}<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"
						></span>{/if}
					Añadir
				</button>
			</div>
		</form>
	</div>
</section>
