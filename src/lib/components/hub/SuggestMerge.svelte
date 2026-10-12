<script>
	/**
	 * SuggestMerge.svelte
	 * A small modal that lets any authenticated user suggest merging two entity
	 * records.  Usage:
	 *   <SuggestMerge {entity} {currentId} {currentLabel} />
	 */
	import { createEventDispatcher } from 'svelte';
	import { mergeSuggest } from '$lib/api';
	import { m } from '$lib/paraglide/messages.js';

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

	const ENTITY_KEYS = {
		pe: 'lib_merge_entity_pe',
		pn: 'lib_merge_entity_pn',
		lug: 'lib_merge_entity_lug',
		doc: 'lib_merge_entity_doc',
		cor: 'lib_merge_entity_cor'
	};

	function entityLabel(e) {
		const key = ENTITY_KEYS[e];
		return key ? m[key]() : e;
	}

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
			error = m.lib_merge_required_ids();
			return;
		}
		if (String(canonicalId) === String(duplicateId)) {
			error = m.lib_merge_distinct_ids();
			return;
		}
		saving = true;
		try {
			await mergeSuggest({ entity, canonical_id: canonicalId, duplicate_id: duplicateId, notas });
			success = true;
		} catch (e) {
			error = e.data?.error ?? m.lib_merge_error();
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
	title={m.lib_merge_button_title()}
>
	<i class="bi bi-git me-1"></i>{m.lib_merge_button()}
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
						<i class="bi bi-git me-2"></i>{m.lib_merge_modal_title({ entity: entityLabel(entity) })}
					</h5>
					<button
						type="button"
						class="btn-close"
						aria-label={m.lib_merge_close()}
						title={m.lib_merge_close()}
						on:click={closeModal}
					></button>
				</div>
				<div class="modal-body">
					{#if success}
						<div class="alert alert-success" role="alert">
							<i class="bi bi-check-circle-fill me-2"></i>{m.lib_merge_success()}
						</div>
						<button class="btn btn-outline-secondary" on:click={closeModal}
							>{m.lib_merge_close()}</button
						>
					{:else}
						<p class="text-muted small mb-3">
							{m.lib_merge_intro()}
						</p>

						{#if error}
							<div class="alert alert-danger py-2" role="alert">
								<small>{error}</small>
							</div>
						{/if}

						<div class="mb-3">
							<label class="form-label fw-semibold" for="suggest-canonical">
								{m.lib_merge_canonical_label()}
								<span class="text-success">{m.lib_merge_canonical_hint()}</span>
								<span class="text-danger" aria-hidden="true">*</span>
							</label>
							<input
								id="suggest-canonical"
								type="number"
								class="form-control"
								bind:value={canonicalId}
								placeholder={m.lib_merge_canonical_placeholder()}
								required
							/>
							{#if currentId}
								<div class="form-text">
									{m.lib_merge_current_record({ label: currentLabel, id: currentId })}
								</div>
							{/if}
						</div>

						<div class="mb-3">
							<label class="form-label fw-semibold" for="suggest-duplicate">
								{m.lib_merge_duplicate_label()}
								<span class="text-danger">{m.lib_merge_duplicate_hint()}</span>
								<span class="text-danger" aria-hidden="true">*</span>
							</label>
							<input
								id="suggest-duplicate"
								type="number"
								class="form-control"
								bind:value={duplicateId}
								placeholder={m.lib_merge_duplicate_placeholder()}
								required
							/>
						</div>

						<div class="mb-3">
							<label class="form-label fw-semibold" for="suggest-notas"
								>{m.lib_merge_notes_label()}</label
							>
							<textarea
								id="suggest-notas"
								class="form-control"
								rows="2"
								bind:value={notas}
								placeholder={m.lib_merge_notes_placeholder()}
							></textarea>
						</div>

						<div class="d-flex gap-2">
							<button class="btn btn-primary" on:click={submit} disabled={saving}>
								{#if saving}
									<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
								{/if}
								{m.lib_merge_submit()}
							</button>
							<button class="btn btn-outline-secondary" on:click={closeModal}
								>{m.lib_merge_cancel()}</button
							>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
