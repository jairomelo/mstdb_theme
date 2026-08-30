/** Builds a login URL that returns to `path` after authenticating (?next=). */
export function loginUrl(path?: string): string {
	const current =
		path ??
		(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
	return `/User/login?next=${encodeURIComponent(current)}`;
}

/** Validates a ?next= value to prevent open redirects. */
export function safeNext(next: string | null): string {
	if (next && next.startsWith('/') && !next.startsWith('//')) return next;
	return '/User';
}
