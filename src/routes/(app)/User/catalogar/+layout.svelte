<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { whoami } from '$lib/api';
    import { user } from '$lib/stores/user';
    import { loginUrl } from '$lib/auth';

    onMount(async () => {
        try {
            const me = await whoami();
            user.set(me);
            // Lesson routes are open to any authenticated user (owners/collaborators
            // may not belong to the `colectores` group); other catalogar routes are not.
            const isLessonRoute = $page.url.pathname.startsWith('/User/catalogar/leccion');
            const allowed = isLessonRoute || me?.is_staff || (me?.groups ?? []).includes('colectores');
            if (!allowed) window.location.href = '/User/';
        } catch {
            window.location.href = loginUrl();
        }
    });
</script>

<slot />
