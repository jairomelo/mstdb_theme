<script>
    let query = '';

    function handleHeroSearch() {
        if (query) {
            window.location.href = `/Search/?q=${encodeURIComponent(query)}`;
        }
    }
</script>


<h1>Welcome to SvelteKit!</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to <span class="testing">read</span> the documentation</p>
<section class="hero-section d-flex align-items-center justify-content-center bg-primary text-white" style="height: 100vh;">
    <div class="text-center">
        <h1 class="display-4">Welcome to Our Archive</h1>
        <p class="lead">Search through thousands of documents, people, and institutions.</p>

        <form on:submit|preventDefault={handleHeroSearch} class="form-inline justify-content-center mt-4">
            <input type="text" bind:value={query} class="form-control form-control-lg mr-2" placeholder="Search...">
            <button type="submit" class="btn btn-lg btn-light">Search</button>
        </form>
    </div>
</section>
