<script>
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';

	// Best available "where the user came from": the last Search/Dashboard URL
	// recorded by the store (accurate across SPA navigations), else a
	// same-origin referrer, else the default Search browse view.
	let backHref = '/Search/';

	onMount(() => {
		try {
			const last = sessionStorage.getItem('ta_last_search_url');
			if (last && last.startsWith('/Search')) {
				backHref = last;
				return;
			}
			const ref = document.referrer ? new URL(document.referrer) : null;
			if (
				ref &&
				ref.origin === window.location.origin &&
				(ref.pathname.startsWith('/Search') || ref.pathname.startsWith('/Dashboard'))
			) {
				backHref = `${ref.pathname}${ref.search}`;
			}
		} catch {
			// Keep default
		}
	});
</script>

<a class="btn btn-sm btn-outline-secondary mb-3" href={backHref}>
	<i class="bi bi-arrow-left me-1" aria-hidden="true"></i>{m.back_to_results()}
</a>
