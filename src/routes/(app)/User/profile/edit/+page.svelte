<script>
    import { onMount } from "svelte";
    import { whoami, logout, fetchWithBaseUrl, updateProfile, fetchUsersProgress } from "$lib/api";

    let user = null;
    let error = null;

    // Profile edit form
    let profileForm = { bio: '', institution: '', institution_url: '', role: '' };
    let profileSaving = false;
    let profileSaved = false;
    let profileError = null;

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
<!-- Edit personal information (all authenticated users) -->
    <section class="mb-5" aria-labelledby="profile-heading">
        <div class="cataloguer-section-header">
            <h2 class="h5 mb-0" id="profile-heading">
                <i class="bi bi-person-gear me-2" aria-hidden="true"></i>Información personal
            </h2>
        </div>
        <form on:submit|preventDefault={saveProfile} novalidate>
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="profile-institution" class="form-label">Institución</label>
                    <input
                        id="profile-institution"
                        type="text"
                        class="form-control"
                        bind:value={profileForm.institution}
                        maxlength="255"
                    />
                </div>
                <div class="col-md-6">
                    <label for="profile-institution-url" class="form-label">URL de la institución</label>
                    <input
                        id="profile-institution-url"
                        type="url"
                        class="form-control"
                        bind:value={profileForm.institution_url}
                        placeholder="https://"
                    />
                </div>
                <div class="col-12">
                    <label for="profile-bio" class="form-label">Semblanza</label>
                    <textarea
                        id="profile-bio"
                        class="form-control"
                        rows="4"
                        bind:value={profileForm.bio}
                    ></textarea>
                </div>
            </div>

            <div class="mt-3 d-flex align-items-center gap-2">
                <button type="submit" class="btn btn-primary btn-sm" disabled={profileSaving}>
                    {#if profileSaving}
                        <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                    {/if}
                    Guardar
                </button>
                {#if profileSaved}
                    <span class="text-success small" role="status">
                        <i class="bi bi-check-circle me-1" aria-hidden="true"></i>Guardado
                    </span>
                {/if}
                {#if profileError}
                    <span class="text-danger small" role="alert">{profileError}</span>
                {/if}
            </div>
        </form>
    </section>

{:else if error}
    <p class="text-danger" role="alert">{error}</p>
{:else}
    <p class="text-muted" aria-live="polite">Cargando…</p>
{/if}
</div>