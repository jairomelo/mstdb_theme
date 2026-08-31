<script>
	/**
	 * SuggestMerge.svelte
	 * A small modal that lets any authenticated user suggest merging two entity
	 * records.  Usage:
	 *   <SuggestMerge {entity} {currentId} {currentLabel} />
	 */
	import { createEventDispatcher } from 'svelte';
	import { mergeSuggest } from '$lib/api';

	export let entity = ''; // 'pe' | 'pn' | 'lug' | 'doc' | 'cor'
	export let currentId = null; // pre-fills as canonical
	export let currentLabel = ''; // display name of current record

	const dispatch = createEventDispatcher();

	let open = false;
	let canonicalId = '';
	let duplicateId = '';
	let notas = '';
	let saving = false;
	let error = null;
	let success = false;

	const ENTITY_LABELS = {
		pe: 'Persona Esclavizada',
		pn: 'Persona No Esclavizada',
		lug: 'Lugar',
		doc: 'Documento',
		cor: 'Corporación'
	};

	function openModal() {
		open = true;
		// Default: current record as canonical; user fills in the duplicate
		canonicalId = currentId ?? '';
		duplicateId = '';
		notas = '';
		error = null;
		success = false;
	}

	function closeModal() {
		open = false;
	}

	async function submit() {
		error = null;
		if (!canonicalId || !duplicateId) {
			error = 'Ambos IDs son obligatorios.';
			return;
		}
		if (String(canonicalId) === String(duplicateId)) {
			error = 'Los IDs deben ser distintos.';
			return;
		}
		saving = true;
		try {
			await mergeSuggest({ entity, canonical_id: canonicalId, duplicate_id: duplicateId, notas });
			success = true;
		} catch (e) {
			error = e.data?.error ?? 'Error al enviar la sugerencia.';
		} finally {
			saving = false;
		}
	}

	function onKeydown(e) {
		if (e.key === 'Escape') closeModal();
	}
</script>

<svelte:window on:keydown={onKeydown} />

<button
	type="button"
	class="btn btn-sm btn-outline-secondary"
	on:click={openModal}
	title="Sugerir fusión de registros duplicados"
>
	<i class="bi bi-git me-1"></i>Sugerir merge
</button>

{#if open}
	<div
		class="modal d-block"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		aria-labelledby="suggest-merge-title"
		style="background:rgba(0,0,0,.4);"
	>
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="suggest-merge-title">
						<i class="bi bi-git me-2"></i>Sugerir fusión — {ENTITY_LABELS[entity] ?? entity}
					</h5>
					<button
						type="button"
						class="btn-close"
						aria-label="Cerrar"
						title="Cerrar"
						on:click={closeModal}
					></button>
				</div>
				<div class="modal-body">
					{#if success}
						<div class="alert alert-success" role="alert">
							<i class="bi bi-check-circle-fill me-2"></i>Sugerencia enviada. El equipo de staff la
							revisará.
						</div>
						<button class="btn btn-outline-secondary" on:click={closeModal}>Cerrar</button>
					{:else}
						<p class="text-muted small mb-3">
							Indica cuál es el registro canónico (a conservar) y cuál es el duplicado (a fusionar y
							eliminar). El equipo de staff revisará la sugerencia antes de ejecutar la fusión.
						</p>

						{#if error}
							<div class="alert alert-danger py-2" role="alert">
								<small>{error}</small>
							</div>
						{/if}

						<div class="mb-3">
							<label class="form-label fw-semibold" for="suggest-canonical">
								ID canónico <span class="text-success">(a conservar)</span>
								<span class="text-danger" aria-hidden="true">*</span>
							</label>
							<input
								id="suggest-canonical"
								type="number"
								class="form-control"
								bind:value={canonicalId}
								placeholder="ID del registro definitivo"
								required
							/>
							{#if currentId}
								<div class="form-text">
									Registro actual: <strong>{currentLabel}</strong> (ID {currentId})
								</div>
							{/if}
						</div>

						<div class="mb-3">
							<label class="form-label fw-semibold" for="suggest-duplicate">
								ID duplicado <span class="text-danger">(a eliminar)</span>
								<span class="text-danger" aria-hidden="true">*</span>
							</label>
							<input
								id="suggest-duplicate"
								type="number"
								class="form-control"
								bind:value={duplicateId}
								placeholder="ID del registro a fusionar"
								required
							/>
						</div>

						<div class="mb-3">
							<label class="form-label fw-semibold" for="suggest-notas">Notas (opcional)</label>
							<textarea
								id="suggest-notas"
								class="form-control"
								rows="2"
								bind:value={notas}
								placeholder="Por qué crees que son el mismo registro…"
							></textarea>
						</div>

						<div class="d-flex gap-2">
							<button class="btn btn-primary" on:click={submit} disabled={saving}>
								{#if saving}
									<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
								{/if}
								Enviar sugerencia
							</button>
							<button class="btn btn-outline-secondary" on:click={closeModal}>Cancelar</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
