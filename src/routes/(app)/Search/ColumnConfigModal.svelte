<script>
	import { createEventDispatcher } from 'svelte';
	import { unifiedStore, toggleColumn } from '$lib/unified-store';
	import { columnsConfig } from '$conf/columns';
	import { m } from '$lib/paraglide/messages.js';

	export let entityType;

	const dispatch = createEventDispatcher();

	$: allColumns = (columnsConfig[entityType] || []).map((c) => ({ ...c, label: m[c.labelKey]() }));
	$: visibleColumnKeys = $unifiedStore.tabs[entityType]?.visibleColumns || [];

	function handleToggle(key) {
		toggleColumn(entityType, key);
	}

	function handleClose() {
		dispatch('close');
	}
</script>

<div class="browse-column-modal">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-backdrop show" on:click={handleClose}></div>
	<div class="modal d-block" tabindex="-1" on:click={handleClose}>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="modal-dialog modal-sm" on:click|stopPropagation>
			<div class="modal-content">
				<div class="modal-header py-2">
					<h6 class="modal-title">
						<i class="bi bi-columns me-1"></i>{m.conf_columns_modal_title()}
					</h6>
					<button type="button" class="btn-close btn-close-sm" on:click={handleClose}></button>
				</div>
				<div class="modal-body py-2">
					<div class="list-group list-group-flush">
						{#each allColumns as col}
							<label
								class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-1 px-2"
							>
								<input
									type="checkbox"
									class="form-check-input mt-0"
									checked={visibleColumnKeys.includes(col.key)}
									on:change={() => handleToggle(col.key)}
								/>
								<span class="small">{col.label}</span>
							</label>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
