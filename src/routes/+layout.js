import '../styles/custom.scss';

export const prerender = false;

// The app's hrefs and shareable URLs are slash-form (/Search/, /Dashboard/).
// With the default 'never', internal navigations to /Search/… triggered a
// client redirect that double-mounted the Search page and aborted its first
// in-flight fetch.
export const trailingSlash = 'always';

// whoami() disabled until user dashboard is implemented.
// Re-enable here when auth-gated routes are added.
export function load() {
	return {};
}
