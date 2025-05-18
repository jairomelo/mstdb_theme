<script>
    import { login } from "$lib/api";
	
    let username = "";
    let password = "";
    let error = null;

    async function handleLogin() {
        error = null;

        try {
            await login(username, password);
            window.location.href = "/ManagerDashboard/users";
            
        } catch (err) {
            console.error(err);
            error = "An error occurred during login";
        }
    }

</script>


<h1>Log in to TrayectoriasAfro</h1>
<form on:submit|preventDefault={handleLogin}>
	<label>Username: <input bind:value={username} /></label><br />
	<label>Password: <input type="password" bind:value={password} /></label><br />
	<button type="submit">Log In</button>
</form>

{#if error}
	<p style="color: red;">{error}</p>
{/if}