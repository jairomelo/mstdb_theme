<script>
    import { onMount } from 'svelte';
    import { whoami, mergeCandidates, mergeExecute } from '$lib/api';

    let me = null;
    let isStaff = false;

    const ENTITY_OPTIONS = [
        { value: 'pe',  label: 'Persona Esclavizada' },
        { value: 'pn',  label: 'Persona No Esclavizada' },
        { value: 'lug', label: 'Lugar' },
    ];

    let entity = 'pe';
    let query = '';
    let queryTimer = null;
    let candidates = [];
    let searching = false;

    // Selection step
    let canonicalRecord = null;
    let duplicateRecord = null;
    let step = 'search'; // 'search' | 'confirm'

    let merging = false;
    let mergeError = null;
    let mergeSuccess = null;

    onMount(async () => {
        try {
            me = await whoami();
            isStaff = me?.is_staff ?? false;
            if (!isStaff) { window.location.href = '/User/dashboard'; }
        } catch {
            window.location.href = '/User/login';
        }
    });

    function onQueryInput() {
        clearTimeout(queryTimer);
        mergeError = null;
        candidates = [];
        if (query.trim().length < 2) return;
        queryTimer = setTimeout(async () => {
            searching = true;
            try {
                candidates = await mergeCandidates(entity, query);
            } catch (e) {
                mergeError = 'Error buscando candidatos.';
            } finally {
                searching = false;
            }
        }, 400);
    }

    function selectCanonical(c) {
        if (duplicateRecord && duplicateRecord.id === c.id) return;
        canonicalRecord = c;
    }

    function selectDuplicate(c) {
        if (canonicalRecord && canonicalRecord.id === c.id) return;
        duplicateRecord = c;
    }

    function goConfirm() {
        if (!canonicalRecord || !duplicateRecord) {
            mergeError = 'Selecciona el registro canónico y el duplicado.';
            return;
        }
        mergeError = null;
        step = 'confirm';
    }

    function goBack() {
        step = 'search';
        mergeError = null;
    }

    async function executeMerge() {
        merging = true;
        mergeError = null;
        try {
            await mergeExecute({
                entity,
                canonical_id: canonicalRecord.id,
                duplicate_id: duplicateRecord.id,
            });
            mergeSuccess = `Merge completado: ID ${duplicateRecord.id} fusionado en ID ${canonicalRecord.id}.`;
            step = 'search';
            canonicalRecord = null;
            duplicateRecord = null;
            candidates = [];
            query = '';
        } catch (e) {
            mergeError = e.data?.error ?? 'Error ejecutando el merge.';
        } finally {
            merging = false;
        }
    }

    function resetAll() {
        step = 'search';
        canonicalRecord = null;
        duplicateRecord = null;
        candidates = [];
        query = '';
        mergeError = null;
        mergeSuccess = null;
    }

    $: if (entity) {
        candidates = [];
        canonicalRecord = null;
        duplicateRecord = null;
        query = '';
    }
</script>

<svelte:head>
    <title>Fusionar registros — Trayectorias Afro</title>
</svelte:head>

<div class="container-fluid mt-3" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-3">
        <h1 class="h4 mb-0"><i class="bi bi-git me-2"></i>Fusionar registros duplicados</h1>
        <a href="/User/dashboard" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i>Dashboard
        </a>
    </div>

    <div class="alert alert-warning" role="note">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Operación destructiva.</strong> El registro duplicado se eliminará permanentemente y todos sus vínculos se transferirán al registro canónico.
    </div>

    {#if mergeSuccess}
        <div class="alert alert-success alert-dismissible" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{mergeSuccess}
            <button type="button" class="btn-close" on:click={() => mergeSuccess = null}></button>
        </div>
    {/if}

    {#if mergeError}
        <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{mergeError}
        </div>
    {/if}

    {#if step === 'search'}
        <!-- Entity selector -->
        <div class="card mb-3">
            <div class="card-body">
                <fieldset>
                    <legend class="form-label fw-semibold mb-2">Tipo de entidad</legend>
                    <div class="d-flex gap-3 flex-wrap">
                        {#each ENTITY_OPTIONS as opt}
                            <div class="form-check">
                                <input class="form-check-input" type="radio" id="entity-{opt.value}"
                                       bind:group={entity} value={opt.value} />
                                <label class="form-check-label" for="entity-{opt.value}">{opt.label}</label>
                            </div>
                        {/each}
                    </div>
                </fieldset>
            </div>
        </div>

        <!-- Search -->
        <div class="card mb-3">
            <div class="card-body">
                <label class="form-label fw-semibold" for="merge-query">Buscar por nombre</label>
                <div class="input-group">
                    <input id="merge-query" type="search" class="form-control"
                           placeholder="Mínimo 2 caracteres…"
                           bind:value={query}
                           on:input={onQueryInput}
                           autocomplete="off" />
                    {#if searching}
                        <span class="input-group-text">
                            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        </span>
                    {/if}
                </div>
                <small class="text-muted">Los resultados se ordenan por similitud con la búsqueda.</small>
            </div>
        </div>

        <!-- Candidates table -->
        {#if candidates.length}
            <div class="card mb-3">
                <div class="card-header fw-semibold">
                    Candidatos ({candidates.length})
                    — <small class="text-muted">Selecciona el registro canónico (verde) y el duplicado (rojo)</small>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Similitud</th>
                                <th scope="col" class="text-center">Canónico</th>
                                <th scope="col" class="text-center">Duplicado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each candidates as c}
                                {@const isCanon = canonicalRecord?.id === c.id}
                                {@const isDup   = duplicateRecord?.id === c.id}
                                <tr class:table-success={isCanon} class:table-danger={isDup}>
                                    <td><code>{c.id}</code></td>
                                    <td>{c.label}</td>
                                    <td>
                                        <div class="progress" style="width:80px; height:6px;" title="{c.score}%">
                                            <div class="progress-bar bg-primary" style="width:{c.score}%"></div>
                                        </div>
                                        <small class="text-muted">{c.score}%</small>
                                    </td>
                                    <td class="text-center">
                                        <button class="btn btn-sm {isCanon ? 'btn-success' : 'btn-outline-success'}"
                                                aria-pressed={isCanon}
                                                on:click={() => selectCanonical(c)}>
                                            {isCanon ? '✓ Canónico' : 'Elegir'}
                                        </button>
                                    </td>
                                    <td class="text-center">
                                        <button class="btn btn-sm {isDup ? 'btn-danger' : 'btn-outline-danger'}"
                                                aria-pressed={isDup}
                                                on:click={() => selectDuplicate(c)}>
                                            {isDup ? '✓ Duplicado' : 'Elegir'}
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="d-flex gap-2 mb-4">
                <button class="btn btn-primary" on:click={goConfirm} disabled={!canonicalRecord || !duplicateRecord}>
                    <i class="bi bi-arrow-right me-1"></i>Continuar
                </button>
                <button class="btn btn-outline-secondary" on:click={resetAll}>Limpiar</button>
            </div>
        {/if}

    {:else if step === 'confirm'}
        <!-- Confirmation step -->
        <div class="card mb-3 border-danger">
            <div class="card-header bg-danger text-white fw-semibold">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar fusión
            </div>
            <div class="card-body">
                <dl class="row mb-3">
                    <dt class="col-sm-4">Tipo</dt>
                    <dd class="col-sm-8">{ENTITY_OPTIONS.find(o => o.value === entity)?.label}</dd>

                    <dt class="col-sm-4 text-success">Registro canónico</dt>
                    <dd class="col-sm-8">
                        <strong>{canonicalRecord.label}</strong>
                        <code class="ms-2">ID {canonicalRecord.id}</code>
                        <small class="text-muted ms-2">(se conserva)</small>
                    </dd>

                    <dt class="col-sm-4 text-danger">Registro duplicado</dt>
                    <dd class="col-sm-8">
                        <strong>{duplicateRecord.label}</strong>
                        <code class="ms-2">ID {duplicateRecord.id}</code>
                        <small class="text-muted ms-2">(se eliminará)</small>
                    </dd>
                </dl>

                <p class="text-danger fw-semibold mb-3">
                    <i class="bi bi-trash-fill me-1"></i>
                    El registro ID {duplicateRecord.id} se eliminará. Todos sus vínculos (documentos, relaciones, trayectorias) se transferirán a ID {canonicalRecord.id}.
                </p>

                <div class="d-flex gap-2">
                    <button class="btn btn-danger" on:click={executeMerge} disabled={merging}>
                        {#if merging}
                            <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                        {/if}
                        Fusionar definitivamente
                    </button>
                    <button class="btn btn-outline-secondary" on:click={goBack} disabled={merging}>
                        <i class="bi bi-arrow-left me-1"></i>Volver
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
