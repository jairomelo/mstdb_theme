<script>
	import { getLocale } from '$lib/paraglide/runtime.js';

	// Assembled from parts so the literal address is absent from the source and
	// most static HTML scrapers; the mailbox is still a plain, clickable link.
	const DOMAIN = 'trayectoriasafro.org';
	const address = `${getLocale() === 'es' ? 'soporte' : 'support'}@${DOMAIN}`;
</script>

<a href="mailto:{address}">{address}</a>
