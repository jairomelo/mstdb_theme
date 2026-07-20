<script>
    import { onMount } from "svelte";
    import { whoami, logout, fetchWithBaseUrl, updateProfile, fetchUsersProgress } from "$lib/api";

    let user = null;
    let error = null;

    // Catalogar section state
    let docQuery = '';
    let docResults = [];
    let docLoading = false;
    let docTimeout;

    // Database summary
    let entityCounts = null;

    // Staff user-list
    let usersProgress = null;
    let progressLoading = false;

    // Profile edit form
    let profileForm = { bio: '', institution: '', institution_url: '', role: '' };
    let profileSaving = false;
    let profileSaved = false;
    let profileError = null;

    const isCollector = (u) => u?.groups?.includes('colectores');
    const isReviewer  = (u) => u?.groups?.includes('reviewers');
    const canSeeDbSummary = (u) => u?.is_staff || isCollector(u);
    const canSeeProgress  = (u) => u?.is_staff || isCollector(u) || isReviewer(u);

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

    async function loadEntityCounts() {
        try {
            entityCounts = await fetchWithBaseUrl('counts/');
        } catch (e) {
            entityCounts = null;
        }
    }

    async function loadUsersProgress() {
        progressLoading = true;
        try {
            usersProgress = await fetchUsersProgress();
        } catch (e) {
            usersProgress = null;
        } finally {
            progressLoading = false;
        }
    }

    async function saveProfile() {
        profileSaving = true;
        profileSaved = false;
        profileError = null;
        try {
            const updated = await updateProfile(profileForm);
            user = { ...user, profile: updated.profile };
            profileSaved = true;
            setTimeout(() => { profileSaved = false; }, 3000);
        } catch (e) {
            profileError = 'No se pudo guardar. Intenta nuevamente.';
        } finally {
            profileSaving = false;
        }
    }

    onMount(async () => {
        try {
            user = await whoami();
            if (!user) { window.location.href = "/User/login"; return; }
            profileForm = { ...user.profile };
            if (canSeeDbSummary(user)) loadEntityCounts();
            if (user.is_staff) loadUsersProgress();
            if (user?.is_staff || isCollector(user)) searchDocumentos();
        } catch (err) {
            console.error(err);
            error = "You are not logged in";
            window.location.href = "/User/login";
        }
    });
</script>

<div class="container mt-4">
{#if user}
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-1">
        <h1 class="h3 mb-0">
            {#if user.is_staff}<i class="bi bi-person-badge me-2" aria-hidden="true"></i>{/if}
            {user.username} <a href='/User/profile' class="btn btn-link btn-sm ps-0 text-secondary" role="button"><i class="bi bi-person-fill-gear me-1" aria-hidden="true"></i>[perfil]</a>

        </h1>
        <button class="btn btn-outline-secondary btn-sm" on:click={handleLogout}>
            <i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Cerrar sesión
        </button>
    </div>
    <p class="text-muted small mb-4">
        {user.email}
        {#if user.profile?.institution}
            · {user.profile.institution}
        {/if}
    </p>

    <!-- Database summary (staff + colectores) -->
    {#if canSeeDbSummary(user)}
    <section class="mb-5" aria-labelledby="db-summary-heading">
        <div class="cataloguer-section-header">
            <h2 class="h5 mb-0" id="db-summary-heading">
                <i class="bi bi-database me-2" aria-hidden="true"></i>Resumen de la base de datos
            </h2>
        </div>
        {#if entityCounts}
        <div class="row g-2">
            {#each [
                { label: 'Personas esclavizadas', key: 'personaesclavizada', icon: 'bi-people' },
                { label: 'Personas no esclavizadas', key: 'personanoesclavizada', icon: 'bi-person' },
                { label: 'Documentos', key: 'documento', icon: 'bi-file-earmark-text' },
                { label: 'Lugares', key: 'lugar', icon: 'bi-geo-alt' },
                { label: 'Corporaciones', key: 'corporacion', icon: 'bi-building' },
            ] as item}
            <div class="col-6 col-md-4 col-lg-2">
                <div class="card h-100 text-center border-0 bg-light">
                    <div class="card-body py-3">
                        <i class="bi {item.icon} fs-4 text-secondary" aria-hidden="true"></i>
                        <div class="fw-bold fs-5 mt-1">{entityCounts[item.key]?.toLocaleString() ?? '–'}</div>
                        <div class="text-muted small">{item.label}</div>
                    </div>
                </div>
            </div>
            {/each}
        </div>
        {:else}
        <p class="text-muted small"><span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Cargando conteos…</p>
        {/if}
    </section>
    {/if}

    <!-- Catalogar section (staff + colectores) -->
    {#if user.is_staff || isCollector(user)}
    <section class="mb-5" aria-labelledby="catalogar-heading">
        <div class="cataloguer-section-header">
            <h2 class="h5 mb-0" id="catalogar-heading">
                <i class="bi bi-pencil-square me-2" aria-hidden="true"></i>Catalogar
            </h2>
            <div class="d-flex gap-2">
                <a href="/User/catalogar/documento" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Nuevo evento
                </a>
                <a href="/User/catalogar/leccion" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-mortarboard me-1" aria-hidden="true"></i>Nueva lección
                </a>
                <a href="/User/trayectoria" class="btn btn-outline-danger btn-sm">
                    <i class="bi bi-map me-1" aria-hidden="true"></i>Editar trayectorias
                </a>
            </div>
        </div>

        <div class="mb-3">
            <label for="doc-search" class="visually-hidden">Buscar documentos</label>
            <input
                id="doc-search"
                type="search"
                class="form-control"
                placeholder="Buscar documentos por título, descripción…"
                bind:value={docQuery}
                on:input={onDocInput}
            />
        </div>

        {#if docLoading}
            <p class="text-muted small"><span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Buscando…</p>
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
                        <i class="bi bi-chevron-right text-muted" aria-hidden="true"></i>
                    </div>
                </a>
                {/each}
            </div>
        {/if}
    </section>
    {/if}

    <!-- Personal progress (staff + colectores + reviewers) -->
    {#if canSeeProgress(user)}
    <section class="mb-5" aria-labelledby="progress-heading">
        <div class="cataloguer-section-header">
            <h2 class="h5 mb-0" id="progress-heading">
                <i class="bi bi-bar-chart-line me-2" aria-hidden="true"></i>Mi progreso
            </h2>
        </div>
        {#if user.contributions}
        <div class="row g-2">
            {#each [
                { label: 'Personas esclavizadas', value: user.contributions.personas_esclavizadas },
                { label: 'Personas no esclavizadas', value: user.contributions.personas_no_esclavizadas },
                { label: 'Documentos', value: user.contributions.documentos },
                { label: 'Total registros', value: user.contributions.total },
            ] as item}
            <div class="col-6 col-md-3">
                <div class="card h-100 text-center border-0 bg-light">
                    <div class="card-body py-3">
                        <div class="fw-bold fs-5">{item.value.toLocaleString()}</div>
                        <div class="text-muted small">{item.label}</div>
                    </div>
                </div>
            </div>
            {/each}
        </div>
        {:else}
        <p class="text-muted small">No hay datos de progreso disponibles.</p>
        {/if}
    </section>
    {/if}

    <!-- Staff user-list -->
    {#if user.is_staff}
    <section class="mb-5" aria-labelledby="users-heading">
        <div class="cataloguer-section-header">
            <h2 class="h5 mb-0" id="users-heading">
                <i class="bi bi-people me-2" aria-hidden="true"></i>Contribuciones por usuario
            </h2>
        </div>
        {#if progressLoading}
            <p class="text-muted small"><span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Cargando…</p>
        {:else if usersProgress}
        <div class="table-responsive">
            <table class="table table-sm table-hover align-middle">
                <caption class="visually-hidden">Tabla de contribuciones por usuario</caption>
                <thead class="table-light">
                    <tr>
                        <th scope="col">Usuario</th>
                        <th scope="col">Institución</th>
                        <th scope="col" class="text-end">P. esclavizadas</th>
                        <th scope="col" class="text-end">P. no esclavizadas</th>
                        <th scope="col" class="text-end">Documentos</th>
                        <th scope="col" class="text-end fw-bold">Total</th>
                    </tr>
                </thead>
                <tbody>
                {#each usersProgress as u}
                    <tr>
                        <td>
                            <strong>{u.username}</strong>
                            {#if u.is_staff}<span class="badge bg-dark ms-1">staff</span>{/if}
                            {#each u.groups as g}<span class="badge bg-secondary ms-1">{g}</span>{/each}
                        </td>
                        <td class="text-muted small">{u.profile.institution || '—'}</td>
                        <td class="text-end">{u.contributions.personas_esclavizadas}</td>
                        <td class="text-end">{u.contributions.personas_no_esclavizadas}</td>
                        <td class="text-end">{u.contributions.documentos}</td>
                        <td class="text-end fw-bold">{u.contributions.total}</td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
        {:else}
        <p class="text-muted small">No se pudo cargar la información de usuarios.</p>
        {/if}
    </section>
    {/if}


{:else if error}
    <p class="text-danger" role="alert">{error}</p>
{:else}
    <p class="text-muted" aria-live="polite">Cargando…</p>
{/if}
</div>