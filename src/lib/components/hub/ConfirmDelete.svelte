<script>
	import { createEventDispatcher } from 'svelte';
	import { focusTrap } from '$lib/actions/focusTrap.js';
	import { m } from '$lib/paraglide/messages.js';

	export let open = false;
	export let message = '';
	export let confirmLabel = '';
	export let loading = false;

	const dispatch = createEventDispatcher();
</script>

{#if open}
	<div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content" use:focusTrap>
				<div class="modal-header">
					<h5 class="modal-title">{m.lib_confirm_delete_title()}</h5>
					<button
						type="button"
						class="btn-close"
						aria-label={m.lib_confirm_delete_cancel()}
						on:click={() => dispatch('cancel')}
					/>
				</div>
				<div class="modal-body">{message || m.lib_confirm_delete_message()}</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" on:click={() => dispatch('cancel')}
						>{m.lib_confirm_delete_cancel()}</button
					>
					<button
						type="button"
						class="btn btn-danger"
						disabled={loading}
						on:click={() => dispatch('confirm')}
					>
						{#if loading}
							<span class="spinner-border spinner-border-sm me-1" />
						{/if}
						{confirmLabel || m.lib_confirm_delete_confirm()}
					</button>
				</div>
			</div>
		</div>
	</div>
	<div class="modal-backdrop fade show" />
{/if}
