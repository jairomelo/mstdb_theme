<script>
    import { onMount } from 'svelte';
    import { whoami } from '$lib/api';
    import { user } from '$lib/stores/user';

    onMount(async () => {
        try {
            const me = await whoami();
            user.set(me);
            if (!me?.is_staff) window.location.href = '/User/login';
        } catch {
            window.location.href = '/User/login';
        }
    });
</script>

<slot />
