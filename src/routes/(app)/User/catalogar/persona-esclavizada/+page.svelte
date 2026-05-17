<script>
    import { createPersonaEsclavizada } from '$lib/api.js';
    import FormField from '$lib/components/forms/FormField.svelte';
    import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';
    import MultiSelect from '$lib/components/forms/MultiSelect.svelte';
    import FlexDateInput from '$lib/components/forms/FlexDateInput.svelte';

    const SEXOS = [{ value: 'v', label: 'Varón' }, { value: 'm', label: 'Mujer' }, { value: 'i', label: 'Desconocido' }];
    const UNIDADES = [{ value: 'd', label: 'Días' }, { value: 'm', label: 'Meses' }, { value: 'a', label: 'Años' }];

    let nombres = '';
    let apellidos = '';
    let sexo = '';
    let documentos = [];
    let calidades = [];
    let edad = '';
    let unidad_temporal_edad = '';
    let altura = '';
    let cabello = '';
    let ojos = '';
    let hispanizacion = [];
    let etnonimos = [];
    let procedencia = null;
    let procedencia_adicional = '';
    let lugar_nacimiento = null;
    let fecha_nacimiento_raw = '';
    let fecha_nacimiento_factual = false;
    let lugar_defuncion = null;
    let fecha_defuncion_raw = '';
    let fecha_defuncion_factual = false;
    let estado_civil = [];
    let ocupaciones = [];
    let ocupacion_categoria = '';
    let marcas_corporales = '';
    let conducta = '';
    let salud = '';
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
                nombres,
                apellidos: apellidos || '',
                sexo,
                documentos: documentos.map(d => d.value),
                calidades: calidades.map(c => c.value),
                ...(edad !== '' && { edad: Number(edad) }),
                ...(unidad_temporal_edad && { unidad_temporal_edad }),
                ...(altura && { altura }),
                ...(cabello && { cabello }),
                ...(ojos && { ojos }),
                hispanizacion: hispanizacion.map(h => h.value),
                etnonimos: etnonimos.map(e => e.value),
                ...(procedencia && { procedencia: procedencia.value }),
                ...(procedencia_adicional && { procedencia_adicional }),
                ...(lugar_nacimiento && { lugar_nacimiento: lugar_nacimiento.value }),
                fecha_nacimiento_raw: fecha_nacimiento_raw || null,
                fecha_nacimiento_factual: fecha_nacimiento_factual || null,
                ...(lugar_defuncion && { lugar_defuncion: lugar_defuncion.value }),
                fecha_defuncion_raw: fecha_defuncion_raw || null,
                fecha_defuncion_factual: fecha_defuncion_factual || null,
                estado_civil: estado_civil.map(e => e.value),
                ocupaciones: ocupaciones.map(o => o.value),
                ...(ocupacion_categoria && { ocupacion_categoria }),
                ...(marcas_corporales && { marcas_corporales }),
                ...(conducta && { conducta }),
                ...(salud && { salud }),
                ...(notas && { notas }),
            };
            created = await createPersonaEsclavizada(payload);
        } catch (e) {
            errors = e.data ?? { __all__: [e.message] };
        } finally {
            submitting = false;
        }
    }

    function reset() {
        nombres = ''; apellidos = ''; sexo = ''; documentos = []; calidades = [];
        edad = ''; unidad_temporal_edad = ''; altura = ''; cabello = ''; ojos = '';
        hispanizacion = []; etnonimos = []; procedencia = null; procedencia_adicional = '';
        lugar_nacimiento = null; fecha_nacimiento_raw = ''; fecha_nacimiento_factual = false;
        lugar_defuncion = null; fecha_defuncion_raw = ''; fecha_defuncion_factual = false;
        estado_civil = []; ocupaciones = []; ocupacion_categoria = '';
        marcas_corporales = ''; conducta = ''; salud = ''; notas = '';
        created = null; errors = {};
    }
</script>

<svelte:head><title>Nueva Persona Esclavizada</title></svelte:head>

<div class="container mt-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
            <li class="breadcrumb-item active" aria-current="page">Nueva Persona Esclavizada</li>
        </ol>
    </nav>

    <h1 class="h3 mb-4">Nueva Persona Esclavizada</h1>

    {#if created}
        <div class="alert alert-success" role="alert">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span>Persona creada: <strong>{created.short_id ?? created.persona_idno}</strong> — {created.nombre_normalizado ?? nombres}</span>
                <div class="d-flex gap-2 flex-wrap">
                    <a href="/User/trayectoria?persona_id={created.persona_id}" class="btn btn-sm btn-outline-success">
                        <i class="bi bi-map me-1"></i>Editar trayectoria
                    </a>
                    <a href="/User/catalogar/relaciones?persona_id={created.persona_id}" class="btn btn-sm btn-outline-success">
                        <i class="bi bi-people me-1"></i>Editar relaciones
                    </a>
                    <button class="btn btn-sm btn-outline-success" on:click={reset}>Crear otra</button>
                </div>
            </div>
        </div>
    {/if}

    {#if errors.__all__}
        <div class="alert alert-danger" role="alert">{errors.__all__.join(' ')}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} novalidate>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Identidad</div>
            <div class="card-body row g-3">
                <div class="col-md-6">
                    <FormField label="Nombres" id="nombres" required error={fieldError('nombres')}>
                        <input id="nombres" class="form-control" class:is-invalid={fieldError('nombres')} bind:value={nombres} required />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Apellidos" id="apellidos" error={fieldError('apellidos')}>
                        <input id="apellidos" class="form-control" bind:value={apellidos} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Sexo" id="sexo" required error={fieldError('sexo')}>
                        <select id="sexo" class="form-select" class:is-invalid={fieldError('sexo')} bind:value={sexo} required>
                            <option value="">— Seleccione —</option>
                            {#each SEXOS as s}<option value={s.value}>{s.label}</option>{/each}
                        </select>
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Calidades" id="calidades" error={fieldError('calidades')}>
                        <MultiSelect id="calidades" bind:values={calidades} endpoint="vocabularios/calidades/" />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Documentos" id="documentos" required hint="Al menos un documento fuente" error={fieldError('documentos')}>
                        <MultiSelect id="documentos" bind:values={documentos} endpoint="documentos/" placeholder="Buscar documento…" />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Datos físicos</div>
            <div class="card-body row g-3">
                <div class="col-md-4">
                    <FormField label="Edad" id="edad" error={fieldError('edad')}>
                        <input id="edad" type="number" min="0" class="form-control" bind:value={edad} />
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Unidad temporal" id="ute" error={fieldError('unidad_temporal_edad')}>
                        <select id="ute" class="form-select" bind:value={unidad_temporal_edad}>
                            <option value="">—</option>
                            {#each UNIDADES as u}<option value={u.value}>{u.label}</option>{/each}
                        </select>
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Altura" id="altura" error={fieldError('altura')}>
                        <input id="altura" class="form-control" bind:value={altura} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Cabello" id="cabello" error={fieldError('cabello')}>
                        <input id="cabello" class="form-control" bind:value={cabello} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Ojos" id="ojos" error={fieldError('ojos')}>
                        <input id="ojos" class="form-control" bind:value={ojos} />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Origen</div>
            <div class="card-body row g-3">
                <div class="col-md-6">
                    <FormField label="Hispanizaciones" id="hisp" error={fieldError('hispanizacion')}>
                        <MultiSelect id="hisp" bind:values={hispanizacion} endpoint="vocabularios/hispanizaciones/" />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Etnonimos" id="etno" error={fieldError('etnonimos')}>
                        <MultiSelect id="etno" bind:values={etnonimos} endpoint="vocabularios/etnonimos/" />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Procedencia (lugar)" id="procedencia" error={fieldError('procedencia')}>
                        <SearchableSelect id="procedencia" bind:value={procedencia} endpoint="lugares/" placeholder="Buscar lugar…" />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Procedencia adicional" id="proc-add" error={fieldError('procedencia_adicional')}>
                        <input id="proc-add" class="form-control" bind:value={procedencia_adicional} />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Fechas de existencia</div>
            <div class="card-body row g-3">
                <div class="col-md-5">
                    <FormField label="Fecha de nacimiento" id="fn-raw" error={fieldError('fecha_nacimiento_raw')}>
                        <FlexDateInput id="fn-raw" bind:value={fecha_nacimiento_raw} />
                    </FormField>
                </div>
                <div class="col-md-2 d-flex align-items-end pb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="fn-fact" bind:checked={fecha_nacimiento_factual} />
                        <label class="form-check-label" for="fn-fact">Factual</label>
                    </div>
                </div>
                <div class="col-md-5">
                    <FormField label="Lugar de nacimiento" id="ln" error={fieldError('lugar_nacimiento')}>
                        <SearchableSelect id="ln" bind:value={lugar_nacimiento} endpoint="lugares/" placeholder="Buscar lugar…" />
                    </FormField>
                </div>
                <div class="col-md-5">
                    <FormField label="Fecha de defunción" id="fd-raw" error={fieldError('fecha_defuncion_raw')}>
                        <FlexDateInput id="fd-raw" bind:value={fecha_defuncion_raw} />
                    </FormField>
                </div>
                <div class="col-md-2 d-flex align-items-end pb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="fd-fact" bind:checked={fecha_defuncion_factual} />
                        <label class="form-check-label" for="fd-fact">Factual</label>
                    </div>
                </div>
                <div class="col-md-5">
                    <FormField label="Lugar de defunción" id="ld" error={fieldError('lugar_defuncion')}>
                        <SearchableSelect id="ld" bind:value={lugar_defuncion} endpoint="lugares/" placeholder="Buscar lugar…" />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Estado civil y ocupaciones</div>
            <div class="card-body row g-3">
                <div class="col-md-6">
                    <FormField label="Estado civil" id="ec" error={fieldError('estado_civil')}>
                        <MultiSelect id="ec" bind:values={estado_civil} endpoint="vocabularios/estado-civil/" />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Ocupaciones" id="ocu" error={fieldError('ocupaciones')}>
                        <MultiSelect id="ocu" bind:values={ocupaciones} endpoint="vocabularios/actividades/" />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Categoría de ocupación" id="ocu-cat" error={fieldError('ocupacion_categoria')}>
                        <input id="ocu-cat" class="form-control" bind:value={ocupacion_categoria} />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Observaciones</div>
            <div class="card-body row g-3">
                <div class="col-md-6">
                    <FormField label="Marcas corporales" id="marcas" error={fieldError('marcas_corporales')}>
                        <textarea id="marcas" class="form-control" rows="3" bind:value={marcas_corporales}></textarea>
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Conducta" id="conducta" error={fieldError('conducta')}>
                        <textarea id="conducta" class="form-control" rows="3" bind:value={conducta}></textarea>
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Salud" id="salud" error={fieldError('salud')}>
                        <textarea id="salud" class="form-control" rows="3" bind:value={salud}></textarea>
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Notas" id="notas" error={fieldError('notas')}>
                        <textarea id="notas" class="form-control" rows="3" bind:value={notas}></textarea>
                    </FormField>
                </div>
            </div>
        </section>

        <div class="d-flex gap-2 mb-5">
            <button type="submit" class="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar persona'}
            </button>
            <button type="button" class="btn btn-outline-secondary" on:click={reset}>Limpiar</button>
        </div>

    </form>
</div>
