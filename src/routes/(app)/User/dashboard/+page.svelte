<script>
    import { onMount } from "svelte";
    import { whoami, logout, fetchWithBaseUrl } from "$lib/api";

    let user = null;
    let error = null;

    // Catalogar section state
    let docQuery = '';
    let docResults = [];
    let docLoading = false;
    let docTimeout;

    async function handleLogout() {
        try {
            await logout();
            localStorage.removeItem('user');
            window.location.href = '/';
        } catch (err) {
            console.error(err);
            error = 'An error occurred during logout';
        }
    }

    async function searchDocumentos() {
        docLoading = true;
        try {
            const qs = docQuery.trim() ? `?search=${encodeURIComponent(docQuery)}&page_size=10` : '?ordering=-updated_at&page_size=10';
            const res = await fetchWithBaseUrl(`documentos/${qs}`);
            docResults = res?.results ?? res ?? [];
        } catch (e) {
            docResults = [];
        } finally {
            docLoading = false;
        }
    }

    function onDocInput() {
        clearTimeout(docTimeout);
        docTimeout = setTimeout(searchDocumentos, 300);
    }

    onMount(async () => {
        try {
            user = await whoami();
            if (user?.is_staff) searchDocumentos();
        } catch (err) {
            console.error(err);
            error = "You are not logged in";
            window.location.href = "/User/login";
        }
    });
</script>

<div class="container mt-4">
{#if user}
    <div class="d-flex align-items-center justify-content-between mb-3">
        <h1 class="h3 mb-0">
            {#if user.is_staff}<i class="bi bi-person-badge me-2"></i>{/if}
            {user.username}
        </h1>
        <button class="btn btn-outline-secondary btn-sm" on:click={handleLogout}>
            <i class="bi bi-box-arrow-right me-1"></i>Cerrar sesión
        </button>
    </div>
    <p class="text-muted small mb-4">{user.email}</p>

    {#if user.is_staff}
    <section class="mb-5">
        <div class="cataloguer-section-header">
            <h2 class="h5 mb-0"><i class="bi bi-pencil-square me-2"></i>Catalogar</h2>
            <a href="/User/catalogar/evento/nuevo" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-lg me-1"></i>Nuevo evento
            </a>
        </div>

        <div class="mb-3">
            <input
                type="search"
                class="form-control"
                placeholder="Buscar documentos por título, descripción…"
                bind:value={docQuery}
                on:input={onDocInput}
            />
        </div>

        {#if docLoading}
            <p class="text-muted small"><span class="spinner-border spinner-border-sm me-1"></span>Buscando…</p>
        {:else if docResults.length === 0}
            <p class="text-muted small">No se encontraron documentos.</p>
        {:else}
            <div class="list-group">
                {#each docResults as doc}
                <a href={`/User/catalogar/evento/${doc.documento_id}`} class="list-group-item list-group-item-action">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>{doc.titulo}</strong>
                            {#if doc.documento_idno}
                                <span class="badge bg-secondary ms-2">{doc.documento_idno}</span>
                            {/if}
                            <div class="text-muted small mt-1">
                                {doc.fecha_inicial_raw ?? doc.fecha_inicial ?? ''}
                                {#if doc.archivo?.nombre_archivo} — {doc.archivo.nombre_archivo}{/if}
                            </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted"></i>
                    </div>
                </a>
                {/each}
            </div>
        {/if}
    </section>
    {/if}

{:else if error}
    <p class="text-danger">{error}</p>
{:else}
    <p class="text-muted">Cargando…</p>
{/if}
</div>