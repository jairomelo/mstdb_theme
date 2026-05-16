<script>
    import { createLugar } from '$lib/api.js';
    import FormField from '$lib/components/forms/FormField.svelte';
    import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';

    let nombre_lugar = '';
    let otros_nombres = '';
    let es_parte_de = null;
    let lat = '';
    let lon = '';
    let tipo = null;

    let submitting = false;
    let created = null;
    let errors = {};

    function fieldError(field) {
        const e = errors[field];
        return Array.isArray(e) ? e.join(' ') : (e ?? null);
    }

    function coordError() {
        const latN = lat !== '' ? Number(lat) : null;
        const lonN = lon !== '' ? Number(lon) : null;
        if ((latN === null) !== (lonN === null)) return 'Latitud y longitud deben proporcionarse juntas.';
        return null;
    }

    async function handleSubmit() {
        const coordErr = coordError();
        if (coordErr) { errors = { lat: [coordErr] }; return; }
        submitting = true;
        errors = {};
        created = null;
        try {
            const payload = {
                nombre_lugar,
                otros_nombres: otros_nombres || null,
                es_parte_de: es_parte_de?.value ?? null,
                lat: lat !== '' ? Number(lat) : null,
                lon: lon !== '' ? Number(lon) : null,
                tipo: tipo?.value ?? null,
            };
            created = await createLugar(payload);
        } catch (e) {
            errors = e.data ?? { __all__: [e.message] };
        } finally {
            submitting = false;
        }
    }

    function reset() {
        nombre_lugar = ''; otros_nombres = ''; es_parte_de = null;
        lat = ''; lon = ''; tipo = null; created = null; errors = {};
    }
</script>

<svelte:head><title>Nuevo Lugar</title></svelte:head>

<div class="container mt-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/User/dashboard">Dashboard</a></li>
            <li class="breadcrumb-item active" aria-current="page">Nuevo Lugar</li>
        </ol>
    </nav>

    <h1 class="h3 mb-4">Nuevo Lugar</h1>

    {#if created}
        <div class="alert alert-success d-flex align-items-center justify-content-between" role="alert">
            <span>Lugar creado: <strong>{created.short_id}</strong> — {created.nombre_lugar ?? nombre_lugar}</span>
            <button class="btn btn-sm btn-outline-success" on:click={reset}>Crear otro</button>
        </div>
    {/if}

    {#if errors.__all__}
        <div class="alert alert-danger" role="alert">{errors.__all__.join(' ')}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} novalidate>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Identificación</div>
            <div class="card-body row g-3">
                <div class="col-md-6">
                    <FormField label="Nombre del lugar" id="nombre" required error={fieldError('nombre_lugar')}>
                        <input id="nombre" class="form-control" class:is-invalid={fieldError('nombre_lugar')} bind:value={nombre_lugar} required />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Tipo de lugar" id="tipo" error={fieldError('tipo')}>
                        <SearchableSelect id="tipo" bind:value={tipo} endpoint="vocabularios/tipos-lugar/" placeholder="Buscar tipo…" />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Otros nombres" id="otros" error={fieldError('otros_nombres')} hint="Nombres alternativos o variantes">
                        <textarea id="otros" class="form-control" rows="2" bind:value={otros_nombres}></textarea>
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Es parte de" id="parte-de" error={fieldError('es_parte_de')} hint="Lugar que lo contiene">
                        <SearchableSelect id="parte-de" bind:value={es_parte_de} endpoint="lugares/" placeholder="Buscar lugar…" />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Coordenadas</div>
            <div class="card-body row g-3">
                <div class="col-md-6">
                    <FormField label="Latitud" id="lat" error={fieldError('lat')} hint="Decimal, ej. 4.710989">
                        <input id="lat" type="number" step="any" min="-90" max="90" class="form-control" class:is-invalid={fieldError('lat')} bind:value={lat} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Longitud" id="lon" error={fieldError('lon')} hint="Decimal, ej. -74.072090">
                        <input id="lon" type="number" step="any" min="-180" max="180" class="form-control" class:is-invalid={fieldError('lon')} bind:value={lon} />
                    </FormField>
                </div>
            </div>
        </section>

        <div class="d-flex gap-2 mb-5">
            <button type="submit" class="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar lugar'}
            </button>
            <button type="button" class="btn btn-outline-secondary" on:click={reset}>Limpiar</button>
        </div>

    </form>
</div>
