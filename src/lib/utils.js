import { getLocale } from '$lib/paraglide/runtime.js';

export function formatDate(dateString) {
	const date = new Date(dateString);
	try {
		return date.toLocaleDateString(getLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} catch {
		return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
	}
}
