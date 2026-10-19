<script>
	import { createEventDispatcher } from 'svelte';
	import { getLocale } from '$lib/paraglide/runtime.js';

	export let options = []; // [{ label, label_en?, count }]
	export let value = ''; // currently selected value (always the Spanish label)
	export let placeholder = 'Buscar...';

	const dispatch = createEventDispatcher();

	let searchText = '';
	let isOpen = false;
	let inputEl;

	$: showEn = getLocale().startsWith('en');
	$: displayOf = (opt) => (showEn && opt.label_en ? opt.label_en : opt.label);

	$: filtered = searchText
		? options.filter((o) => displayOf(o).toLowerCase().includes(searchText.toLowerCase()))
		: options;

	$: displayText = (() => {
		const match = options.find((o) => o.label === value);
		if (match) return displayOf(match);
		return value || '';
	})();

	function handleFocus() {
		isOpen = true;
		searchText = '';
	}

	function handleInput(e) {
		searchText = e.target.value;
		isOpen = true;
	}

	function select(opt) {
		if (value === opt.label) {
			value = '';
			dispatch('change', '');
		} else {
			value = opt.label;
			dispatch('change', opt.label);
		}
		isOpen = false;
		searchText = '';
	}

	function clear() {
		value = '';
		searchText = '';
		isOpen = false;
		dispatch('change', '');
	}

	function handleBlur() {
		// Delay to allow click on option to register
		setTimeout(() => {
			isOpen = false;
		}, 200);
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			isOpen = false;
			inputEl?.blur();
		}
	}
</script>

<div class="searchable-select" on:keydown={handleKeydown}>
	<div class="searchable-select-input-wrap">
		<input
			bind:this={inputEl}
			type="text"
			class="form-control form-control-sm"
			placeholder={value ? '' : placeholder}
			value={isOpen ? searchText : displayText}
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:input={handleInput}
		/>
		{#if value}
			<button
				class="searchable-select-clear"
				on:mousedown|preventDefault={clear}
				title="Limpiar"
				type="button">&times;</button
			>
		{/if}
	</div>
	{#if isOpen && filtered.length > 0}
		<ul class="searchable-select-dropdown">
			{#each filtered as opt}
				<li class:selected={value === opt.label}>
					<button type="button" on:mousedown|preventDefault={() => select(opt)}>
						<span class="searchable-select-label">{displayOf(opt)}</span>
						<span class="searchable-select-count">{opt.count}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
