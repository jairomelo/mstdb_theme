import { whoami } from '$lib/api';
import { user } from '$lib/stores/user';
import '../styles/custom.scss';

export const prerender = false;

export async function load() {
	try {
		const u = await whoami();
		user.set(u);
		return { user: u };
	} catch {
		user.set(null);
		return { user: null };
	}
}
