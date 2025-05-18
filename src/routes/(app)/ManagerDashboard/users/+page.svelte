<script>
    import { onMount } from "svelte";
    import { whoami } from "$lib/api";

    let user = null;
    let error = null;

    onMount(async () => {
	try {
		user = await whoami();
	} catch (err) {
		console.error(err);
		error = "You are not logged in";
        window.location.href = "/ManagerDashboard/login";
	}
});


</script>

<div class="container mt-4">
{#if user}
	<h1>Welcome to the Dashboard</h1>
	<p>{#if user.is_staff}<i class="bi bi-person-square"></i>{/if} <strong>Username:</strong> {user.username}</p>
	<p><strong>Email:</strong> {user.email}</p>
{:else if error}
	<p style="color: red;">{error}</p>
{:else}
	<p>Loading...</p>
{/if}
</div>