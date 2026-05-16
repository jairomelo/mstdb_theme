<script>
    import { onMount } from 'svelte';
    import { whoami } from '$lib/api';
    import { user } from '$lib/stores/user';

    onMount(async () => {
        try {
            const me = await whoami();
            user.set(me);
            const groups = me?.groups ?? [];
            const allowed = me?.is_staff || groups.includes('colectores');
            if (!allowed) window.location.href = '/User/login';
        } catch {
            window.location.href = '/User/login';
        }
    });
</script>

<slot />
