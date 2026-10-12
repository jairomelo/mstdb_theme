import { writable } from 'svelte/store';
import { fetchPublicConfig } from '$lib/api';

/** Runtime config exposed by `GET /api/v2/config/` (safe for the browser). */
export const publicConfig = writable({ turnstile_site_key: '', contact_email: '' });

let loadPromise = null;

/**
 * Fetch the public runtime config once per page load.
 * Safe to call from multiple components; later calls reuse the first request.
 */
export function loadPublicConfig() {
	if (!loadPromise) {
		loadPromise = fetchPublicConfig()
			.then((cfg) => {
				if (cfg) publicConfig.set(cfg);
			})
			.catch(() => {
				// Keep defaults (empty) so the contact link stays hidden.
			});
	}
	return loadPromise;
}
