<script>
    import { createDocumento, createArchivo } from '$lib/api.js';
    import { goto } from '$app/navigation';
    import FormField from '$lib/components/forms/FormField.svelte';
    import SearchableSelect from '$lib/components/forms/SearchableSelect.svelte';
    import FlexDateInput from '$lib/components/forms/FlexDateInput.svelte';

    const TIPOS_UDC = [
        { value: 'exp', label: 'Expediente' }, { value: 'caj', label: 'Caja' },
        { value: 'vol', label: 'Volumen' },    { value: 'lib', label: 'Libro' },
        { value: 'leg', label: 'Legajo' },
    ];

    let archivo = null;

    // New-archivo mini-form
    let showNewArchivo = false;
    let newArchivo = { nombre: '', nombre_abreviado: '', ubicacion_archivo: null };
    let newArchivoSaving = false;
    let newArchivoErrors = {};

    async function saveNewArchivo() {
        newArchivoErrors = {};
        if (!newArchivo.nombre.trim()) {
            newArchivoErrors.nombre = 'El nombre es obligatorio.';
            return;
        }
        newArchivoSaving = true;
        try {
            const payload = {
                nombre: newArchivo.nombre.trim(),
                ...(newArchivo.nombre_abreviado.trim() && { nombre_abreviado: newArchivo.nombre_abreviado.trim() }),
                ...(newArchivo.ubicacion_archivo && { ubicacion_archivo: newArchivo.ubicacion_archivo.value }),
            };
            const result = await createArchivo(payload);
            archivo = { value: result.archivo_id, label: `[${result.nombre_abreviado}] ${result.nombre}` };
            newArchivo = { nombre: '', nombre_abreviado: '', ubicacion_archivo: null };
            showNewArchivo = false;
        } catch (e) {
            newArchivoErrors = e?.data ?? { nombre: e.message };
        } finally {
            newArchivoSaving = false;
        }
    }
    let fondo = '';
    let subfondo = '';
    let serie = '';
    let subserie = '';
    let tipo_udc = 'lib';
    let unidad_documental_compuesta = '';
    let tipo_documento = null;
    let sigla_documento = '';
    let titulo = '';
    let descripcion = '';
    let deteriorado = false;
    let fecha_inicial = '';
    let fecha_inicial_aproximada = false;
    let fecha_final = '';
    let fecha_final_aproximada = false;
    let lugar_de_produccion = null;
    let folio_inicial = '';
    let folio_final = '';
    let evento_valor_sp = '';
    let evento_forma_de_pago = '';
    let evento_total = '';
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
                archivo: archivo?.value,
                fondo,
                ...(subfondo && { subfondo }),
                ...(serie && { serie }),
                ...(subserie && { subserie }),
                tipo_udc,
                unidad_documental_compuesta,
                ...(tipo_documento && { tipo_documento: tipo_documento.value }),
                ...(sigla_documento && { sigla_documento }),
                titulo,
                descripcion: descripcion || '',
                deteriorado,
                fecha_inicial,
                fecha_inicial_aproximada: fecha_inicial_aproximada || null,
                fecha_final: fecha_final || '',
                fecha_final_aproximada: fecha_final_aproximada || null,
                ...(lugar_de_produccion && { lugar_de_produccion: lugar_de_produccion.value }),
                folio_inicial,
                folio_final: folio_final || '',
                ...(evento_valor_sp && { evento_valor_sp }),
                ...(evento_forma_de_pago && { evento_forma_de_pago }),
                ...(evento_total && { evento_total }),
                ...(notas && { notas }),
            };
            const doc = await createDocumento(payload);
            goto(`/User/catalogar/evento/${doc.documento_id}`);
        } catch (e) {
            errors = e.data ?? { __all__: [e.message] };
        } finally {
            submitting = false;
        }
    }

    function reset() {
        archivo = null; fondo = ''; subfondo = ''; serie = ''; subserie = '';
        tipo_udc = 'lib'; unidad_documental_compuesta = ''; tipo_documento = null;
        sigla_documento = ''; titulo = ''; descripcion = ''; deteriorado = false;
        fecha_inicial = ''; fecha_inicial_aproximada = false;
        fecha_final = ''; fecha_final_aproximada = false;
        lugar_de_produccion = null; folio_inicial = ''; folio_final = '';
        evento_valor_sp = ''; evento_forma_de_pago = ''; evento_total = '';
        notas = ''; created = null; errors = {};
    }
</script>

<svelte:head><title>Nuevo Documento</title></svelte:head>

<div class="container mt-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/User/">Dashboard</a></li>
            <li class="breadcrumb-item active" aria-current="page">Nuevo Documento</li>
        </ol>
    </nav>

    <h1 class="h3 mb-4">Nuevo Documento</h1>

    {#if created}
        <div class="alert alert-success d-flex align-items-center justify-content-between" role="alert">
            <span>Documento creado: <strong>{created.short_id ?? created.documento_idno}</strong> — {created.titulo ?? titulo}</span>
            <button class="btn btn-sm btn-outline-success" on:click={reset}>Crear otro</button>
        </div>
    {/if}

    {#if errors.__all__}
        <div class="alert alert-danger" role="alert">{errors.__all__.join(' ')}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} novalidate>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Archivo y ubicación documental</div>
            <div class="card-body row g-3">
                <div class="col-12">
                    <FormField label="Archivo" id="archivo" required error={fieldError('archivo')}>
                        <SearchableSelect id="archivo" bind:value={archivo} endpoint="archivos/" placeholder="Buscar archivo…" />
                    </FormField>
                    <div class="mt-1">
                        <button type="button" class="btn btn-link btn-sm ps-0 text-secondary"
                            on:click={() => { showNewArchivo = !showNewArchivo; newArchivoErrors = {}; }}>
                            <i class="bi bi-plus-circle me-1" aria-hidden="true"></i>
                            {showNewArchivo ? 'Cancelar' : 'Crear nuevo archivo'}
                        </button>
                    </div>

                    {#if showNewArchivo}
                        <div class="border rounded p-3 mt-2 bg-light">
                            <p class="fw-semibold small mb-3">Nuevo archivo</p>
                            <div class="row g-2">
                                <div class="col-12">
                                    <label for="na-nombre" class="form-label form-label-sm">Nombre <span aria-hidden="true">*</span></label>
                                    <input id="na-nombre" type="text" class="form-control form-control-sm"
                                        class:is-invalid={newArchivoErrors.nombre}
                                        bind:value={newArchivo.nombre}
                                        placeholder="Nombre completo del archivo" />
                                    {#if newArchivoErrors.nombre}
                                        <div class="invalid-feedback">{newArchivoErrors.nombre}</div>
                                    {/if}
                                </div>
                                <div class="col-md-4">
                                    <label for="na-abrev" class="form-label form-label-sm">Abreviatura</label>
                                    <input id="na-abrev" type="text" class="form-control form-control-sm"
                                        bind:value={newArchivo.nombre_abreviado}
                                        placeholder="Se genera automáticamente" maxlength="50" />
                                </div>
                                <div class="col-md-8">
                                    <label for="na-lugar" class="form-label form-label-sm">Ciudad / Ubicación</label>
                                    <SearchableSelect id="na-lugar" bind:value={newArchivo.ubicacion_archivo}
                                        endpoint="lugares/" placeholder="Buscar lugar…" />
                                </div>
                            </div>
                            {#if newArchivoErrors.non_field_errors}
                                <p class="text-danger small mt-2">{newArchivoErrors.non_field_errors}</p>
                            {/if}
                            <div class="mt-3">
                                <button type="button" class="btn btn-primary btn-sm" on:click={saveNewArchivo} disabled={newArchivoSaving}>
                                    {#if newArchivoSaving}<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>{/if}
                                    Guardar archivo
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
                <div class="col-md-6">
                    <FormField label="Fondo" id="fondo" required error={fieldError('fondo')}>
                        <input id="fondo" class="form-control" class:is-invalid={fieldError('fondo')} bind:value={fondo} required />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Subfondo" id="subfondo" error={fieldError('subfondo')}>
                        <input id="subfondo" class="form-control" bind:value={subfondo} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Serie" id="serie" error={fieldError('serie')}>
                        <input id="serie" class="form-control" bind:value={serie} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Subserie" id="subserie" error={fieldError('subserie')}>
                        <input id="subserie" class="form-control" bind:value={subserie} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Tipo UDC" id="tipo-udc" required error={fieldError('tipo_udc')}>
                        <select id="tipo-udc" class="form-select" bind:value={tipo_udc} required>
                            {#each TIPOS_UDC as t}<option value={t.value}>{t.label}</option>{/each}
                        </select>
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Unidad documental compuesta" id="udc" required error={fieldError('unidad_documental_compuesta')}>
                        <input id="udc" class="form-control" class:is-invalid={fieldError('unidad_documental_compuesta')} bind:value={unidad_documental_compuesta} required />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Descripción del documento</div>
            <div class="card-body row g-3">
                <div class="col-md-6">
                    <FormField label="Tipo de documento" id="tipo-doc" error={fieldError('tipo_documento')}>
                        <SearchableSelect id="tipo-doc" bind:value={tipo_documento} endpoint="vocabularios/tipos-documentales/" placeholder="Buscar tipo…" />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Sigla del documento" id="sigla" error={fieldError('sigla_documento')}>
                        <input id="sigla" class="form-control" bind:value={sigla_documento} />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Título" id="titulo" required error={fieldError('titulo')}>
                        <input id="titulo" class="form-control" class:is-invalid={fieldError('titulo')} bind:value={titulo} required />
                    </FormField>
                </div>
                <div class="col-12">
                    <FormField label="Descripción" id="descripcion" error={fieldError('descripcion')}>
                        <textarea id="descripcion" class="form-control" rows="3" bind:value={descripcion}></textarea>
                    </FormField>
                </div>
                <div class="col-12">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="deteriorado" bind:checked={deteriorado} />
                        <label class="form-check-label" for="deteriorado">Deteriorado</label>
                    </div>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Fechas y lugar de producción</div>
            <div class="card-body row g-3">
                <div class="col-md-5">
                    <FormField label="Fecha inicial" id="fi" required error={fieldError('fecha_inicial')}>
                        <FlexDateInput id="fi" bind:value={fecha_inicial} required />
                    </FormField>
                </div>
                <div class="col-md-2 d-flex align-items-end pb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="fi-aprox" bind:checked={fecha_inicial_aproximada} />
                        <label class="form-check-label" for="fi-aprox">Aprox.</label>
                    </div>
                </div>
                <div class="col-md-5">
                    <FormField label="Fecha final" id="ff" error={fieldError('fecha_final')}>
                        <FlexDateInput id="ff" bind:value={fecha_final} />
                    </FormField>
                </div>
                <div class="col-md-2 d-flex align-items-end pb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="ff-aprox" bind:checked={fecha_final_aproximada} />
                        <label class="form-check-label" for="ff-aprox">Aprox.</label>
                    </div>
                </div>
                <div class="col-md-10">
                    <FormField label="Lugar de producción" id="ldp" error={fieldError('lugar_de_produccion')}>
                        <SearchableSelect id="ldp" bind:value={lugar_de_produccion} endpoint="lugares/" placeholder="Buscar lugar…" />
                    </FormField>
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-header fw-semibold">Folios y datos del evento</div>
            <div class="card-body row g-3">
                <div class="col-md-4">
                    <FormField label="Folio inicial" id="folio-ini" required error={fieldError('folio_inicial')}>
                        <input id="folio-ini" class="form-control" class:is-invalid={fieldError('folio_inicial')} bind:value={folio_inicial} required />
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Folio final" id="folio-fin" error={fieldError('folio_final')}>
                        <input id="folio-fin" class="form-control" bind:value={folio_final} />
                    </FormField>
                </div>
                <div class="col-md-4">
                    <FormField label="Valor sp" id="valor-sp" error={fieldError('evento_valor_sp')}>
                        <input id="valor-sp" class="form-control" bind:value={evento_valor_sp} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Forma de pago" id="pago" error={fieldError('evento_forma_de_pago')}>
                        <input id="pago" class="form-control" bind:value={evento_forma_de_pago} />
                    </FormField>
                </div>
                <div class="col-md-6">
                    <FormField label="Total" id="total" error={fieldError('evento_total')}>
                        <input id="total" class="form-control" bind:value={evento_total} />
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
                {submitting ? 'Guardando…' : 'Guardar documento'}
            </button>
            <button type="button" class="btn btn-outline-secondary" on:click={reset}>Limpiar</button>
        </div>

    </form>
</div>
