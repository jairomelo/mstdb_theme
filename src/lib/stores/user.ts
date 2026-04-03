import { writable, derived } from 'svelte/store';

interface User {
    username: string;
    email: string;
    is_staff: boolean;
    groups: string[];
    permissions: string[];
}

export const user = writable<User | null>(null);

/** Mirror of Django's `{% if perms.app.codename %}` — e.g. hasPerm('dbgestor.add_documento') */
export const hasPerm = derived(user, ($user) => (perm: string): boolean => {
    return $user?.permissions?.includes(perm) ?? false;
});
