<script>
    import { createCorporacion } from '$lib/api.js';
    import FormField from '$lib/components/forms/FormField.svelte';
    import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';
    import MultiSelect from '$lib/components/forms/MultiSelect.svelte';

    let nombre_institucion = '';
    let nombres_alternativos = '';
    let tipo_institucion = null;
    let documentos = [];
    let personas_asociadas = [];
    let lugar_corporacion = null;
    let notas = '';

    let submitting = false;
    let created = null;
    let errors = {};

    function fieldError(field) {
        const e = errors[field];
        return Array.isArray(e) ? e.join(' ') : (e ?? null);
    }

    async function handleSubmit() {
        submitting = true;
        errors = {};
        created = null;
        try {
            const payload = {
                nombre_institucion,
                nombres_alternativos: nombres_alternativos || null,
                tipo_institucion: tipo_institucion?.value,
                documentos: documentos.map(d => d.value),
                personas_asociadas: personas_asociadas.map(p => p.value),
                lugar_corporacion: lugar_corporacion?.value ?? null,
                notas: notas || null,
            };
            created = await createCorporacion(payload);
        } catch (e) {
            errors = e.data ?? { __all__: [e.message] };
        } finally {
            submitting = false;
        }
    }

    function reset() {
        nombre_institucion = ''; nombres_alternativos = ''; tipo_institucion = null;
        documentos = []; personas_asociadas = []; lugar_corporacion = null;
        notas = ''; created = null; errors = {};
    }
</script>

<svelte:head><title>Nueva Corporación</title></svelte:head>

<div class="container mt-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/User/dashboard">Dashboard</a></li>
            <li class="breadcrumb-item active" aria-current="page">Nueva Corporación / Institución</li>
        </ol>
    </nav>

    <h1 class="h3 mb-4">Nueva Corporación / Institución</h1>

    {#if created}
        <div class="alert alert-success d-flex align-items-center justify-content-between" role="alert">
            <span>Corporación creada: <strong>{created.short_id ?? created.corporacion_idno}</strong> — {created.nombre_institucion ?? nombre_institucion}</span>
            <button class="btn btn-sm btn-outline-success" on:click={reset}>Crear otra</button>
        </div>
    {/if}

    {#if errors.__all__}
        <div class="alert alert-danger" role="alert">{errors.__all__.join(' ')}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} novalidate>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Identificación</div>
            <div class="card-body row g-3">
                <div class="col-md-8">
                    <FormField label="Nombre de la institución" id="nombre" required error={fieldError('nombre_institucion')}>
                        <input id="nombre" class="form-control" class:is-invalid={fieldError('nombre_institucion')} bind:value={nombre_institucion} required />
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Tipo de institución" id="tipo" required error={fieldError('tipo_institucion')}>
                        <SearchableSelect id="tipo" bind:value={tipo_institucion} endpoint="vocabularios/tipos-institucion/" placeholder="Buscar tipo…" />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Nombres alternativos" id="alt" error={fieldError('nombres_alternativos')}>
                        <textarea id="alt" class="form-control" rows="2" bind:value={nombres_alternativos}></textarea>
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Lugar" id="lugar" error={fieldError('lugar_corporacion')}>
                        <SearchableSelect id="lugar" bind:value={lugar_corporacion} endpoint="lugares/" placeholder="Buscar lugar…" />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Vínculos</div>
            <div class="card-body row g-3">
                <div class="col-12">
                    <FormField label="Documentos" id="docs" error={fieldError('documentos')}>
                        <MultiSelect id="docs" bind:values={documentos} endpoint="documentos/" placeholder="Buscar documento…" />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Personas asociadas" id="personas" error={fieldError('personas_asociadas')}>
                        <MultiSelect id="personas" bind:values={personas_asociadas} endpoint="personas-esclavizadas/" placeholder="Buscar persona…" />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Notas" id="notas" error={fieldError('notas')}>
                        <textarea id="notas" class="form-control" rows="3" bind:value={notas}></textarea>
                    </FormField>
                </div>
            </div>
        </section>

        <div class="d-flex gap-2 mb-5">
            <button type="submit" class="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar corporación'}
            </button>
            <button type="button" class="btn btn-outline-secondary" on:click={reset}>Limpiar</button>
        </div>

    </form>
</div>
