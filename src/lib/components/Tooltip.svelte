<script>
	/**
	 * Tooltip.svelte
	 * Renders an (i) icon button that shows a Bootstrap tooltip on hover/focus.
	 * Usage: <Tooltip text="Explicación de este campo" />
	 */
	import { tooltip } from '$lib/bootstrap-actions.js';
	export let text = '';
	export let placement = 'top';
</script>

<button
	type="button"
	class="btn btn-link btn-sm p-0 ms-1 text-muted"
	aria-label="Información: {text}"
	use:tooltip={{ title: text, placement }}
	tabindex="0"
	style="line-height:1; vertical-align: middle;"
>
	<i class="bi bi-info-circle-fill" aria-hidden="true" style="font-size:0.85rem;"></i>
</button>
