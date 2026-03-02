<script>
    import { searchResultsStore, activeFilters } from '$lib/searchFull-store';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    // Collapsed/expanded state per section
    let sections = {
        tipos: true,
        lugares: false,
        fechas: false,
        archivos: false,
        calidades: false,
        etnonimos: false,
        hispanizaciones: false,
        ocupaciones: false,
    };

    // Collapsed state for date sub-levels
    let expandedCenturies = {};
    let expandedDecades = {};

    $: facets = $searchResultsStore.facets || {};
    $: typeCounts = $searchResultsStore.typesCounts || {};

    // ── Type filter labels ──────────────────────────────────────────
    const typeLabels = {
        personaesclavizada: { label: 'Personas esclavizadas', icon: 'bi-person-lock' },
        personanoesclavizada: { label: 'Personas no esclavizadas', icon: 'bi-person' },
        corporacion: { label: 'Corporaciones', icon: 'bi-building' },
        lugar: { label: 'Lugares', icon: 'bi-geo-alt' },
        documento: { label: 'Documentos', icon: 'bi-file-text' },
    };

    function toggle(section) {
        sections[section] = !sections[section];
    }

    // ── Generic toggle for multi-select filters ─────────────────────
    function toggleFilter(key, value) {
        activeFilters.update(f => {
            const arr = f[key];
            const idx = arr.indexOf(value);
            if (idx === -1) {
                return { ...f, [key]: [...arr, value] };
            } else {
                return { ...f, [key]: arr.filter(v => v !== value) };
            }
        });
        dispatch('change');
    }

    function toggleType(typeKey) {
        activeFilters.update(f => {
            const arr = f.types;
            const idx = arr.indexOf(typeKey);
            if (idx === -1) {
                return { ...f, types: [...arr, typeKey] };
            } else {
                return { ...f, types: arr.filter(v => v !== typeKey) };
            }
        });
        dispatch('change');
    }

    function toggleYear(year) {
        toggleFilter('year', year);
    }

    // Toggle all years within a decade
    function toggleDecade(decade, yearsInDecade) {
        activeFilters.update(f => {
            const allSelected = yearsInDecade.every(y => f.year.includes(y));
            if (allSelected) {
                return { ...f, year: f.year.filter(y => !yearsInDecade.includes(y)) };
            } else {
                const merged = [...new Set([...f.year, ...yearsInDecade])];
                return { ...f, year: merged };
            }
        });
        dispatch('change');
    }

    // Toggle all years within a century
    function toggleCentury(centuryKey, decadesObj) {
        const allYears = Object.values(decadesObj).flat();
        activeFilters.update(f => {
            const allSelected = allYears.every(y => f.year.includes(y));
            if (allSelected) {
                return { ...f, year: f.year.filter(y => !allYears.includes(y)) };
            } else {
                const merged = [...new Set([...f.year, ...allYears])];
                return { ...f, year: merged };
            }
        });
        dispatch('change');
    }

    // Helper: check if all years in a group are selected
    function allSelected(yearsArr, activeYears) {
        return yearsArr.length > 0 && yearsArr.every(y => activeYears.includes(y));
    }
    function someSelected(yearsArr, activeYears) {
        return yearsArr.some(y => activeYears.includes(y)) && !allSelected(yearsArr, activeYears);
    }

    // Max items shown before "show more"
    const INITIAL_SHOW = 5;
    let showAllLugares = false;
    let showAllArchivos = false;
    let showAllCalidades = false;
    let showAllEtnonimos = false;
    let showAllHispanizaciones = false;
    let showAllOcupaciones = false;

    $: totalActive = $activeFilters.types.length +
        $activeFilters.lugar_id.length +
        $activeFilters.archivo_id.length +
        $activeFilters.year.length +
        $activeFilters.etnonimo.length +
        $activeFilters.calidad.length +
        $activeFilters.hispanizacion.length +
        $activeFilters.ocupacion.length;

    function clearAll() {
        activeFilters.update(() => ({
            types: [],
            lugar_id: [],
            archivo_id: [],
            year: [],
            etnonimo: [],
            calidad: [],
            hispanizacion: [],
            ocupacion: [],
        }));
        dispatch('change');
    }
</script>

<aside class="facet-sidebar">
    <!-- Header -->
    <div class="sidebar-header d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 fw-bold"><i class="bi bi-funnel me-1"></i> Filtros</h6>
        {#if totalActive > 0}
            <button class="btn btn-sm btn-link text-decoration-none p-0" on:click={clearAll}>
                Limpiar ({totalActive})
            </button>
        {/if}
    </div>

    <!-- ═══ Tipo de registro ═══ -->
    <div class="facet-section">
        <button class="facet-section-header" on:click={() => toggle('tipos')}>
            <i class="bi {sections.tipos ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
            <span>Tipo de registro</span>
        </button>
        {#if sections.tipos}
            <div class="facet-options">
                {#each Object.entries(typeLabels) as [key, meta]}
                    {#if (typeCounts[key] || 0) > 0}
                        <label class="facet-option">
                            <input type="checkbox"
                                checked={$activeFilters.types.includes(key)}
                                on:change={() => toggleType(key)} />
                            <i class="bi {meta.icon} me-1"></i>
                            <span class="facet-label">{meta.label}</span>
                            <span class="facet-count">{typeCounts[key]}</span>
                        </label>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>

    <!-- ═══ Lugares ═══ -->
    {#if facets.lugares && facets.lugares.length > 0}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggle('lugares')}>
                <i class="bi {sections.lugares ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>Lugar</span>
            </button>
            {#if sections.lugares}
                <div class="facet-options">
                    {#each (showAllLugares ? facets.lugares : facets.lugares.slice(0, INITIAL_SHOW)) as lugar}
                        <label class="facet-option">
                            <input type="checkbox"
                                checked={$activeFilters.lugar_id.includes(lugar.id)}
                                on:change={() => toggleFilter('lugar_id', lugar.id)} />
                            <span class="facet-label">{lugar.nombre}</span>
                            <span class="facet-count">{lugar.count}</span>
                        </label>
                    {/each}
                    {#if facets.lugares.length > INITIAL_SHOW}
                        <button class="btn btn-sm btn-link p-0 mt-1" on:click={() => showAllLugares = !showAllLugares}>
                            {showAllLugares ? 'Ver menos' : `Ver todos (${facets.lugares.length})`}
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- ═══ Fechas (hierarchical) ═══ -->
    {#if facets.fechas && Object.keys(facets.fechas).length > 0}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggle('fechas')}>
                <i class="bi {sections.fechas ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>Fecha</span>
            </button>
            {#if sections.fechas}
                <div class="facet-options date-tree">
                    {#each Object.entries(facets.fechas) as [century, decades]}
                        {@const allCenturyYears = Object.values(decades).flat()}
                        <div class="tree-century">
                            <label class="facet-option fw-semibold">
                                <input type="checkbox"
                                    checked={allSelected(allCenturyYears, $activeFilters.year)}
                                    indeterminate={someSelected(allCenturyYears, $activeFilters.year)}
                                    on:change={() => toggleCentury(century, decades)} />
                                <button class="btn btn-sm p-0 border-0 me-1"
                                    on:click|stopPropagation={() => expandedCenturies[century] = !expandedCenturies[century]}>
                                    <i class="bi {expandedCenturies[century] ? 'bi-chevron-down' : 'bi-chevron-right'}"></i>
                                </button>
                                <span class="facet-label">{century}</span>
                            </label>
                            {#if expandedCenturies[century]}
                                {#each Object.entries(decades) as [decade, years]}
                                    <div class="tree-decade ms-3">
                                        <label class="facet-option">
                                            <input type="checkbox"
                                                checked={allSelected(years, $activeFilters.year)}
                                                indeterminate={someSelected(years, $activeFilters.year)}
                                                on:change={() => toggleDecade(decade, years)} />
                                            <button class="btn btn-sm p-0 border-0 me-1"
                                                on:click|stopPropagation={() => expandedDecades[decade] = !expandedDecades[decade]}>
                                                <i class="bi {expandedDecades[decade] ? 'bi-chevron-down' : 'bi-chevron-right'}"></i>
                                            </button>
                                            <span class="facet-label">{decade}s</span>
                                        </label>
                                        {#if expandedDecades[decade]}
                                            {#each years as year}
                                                <label class="facet-option ms-3">
                                                    <input type="checkbox"
                                                        checked={$activeFilters.year.includes(year)}
                                                        on:change={() => toggleYear(year)} />
                                                    <span class="facet-label">{year}</span>
                                                </label>
                                            {/each}
                                        {/if}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}

    <!-- ═══ Archivos ═══ -->
    {#if facets.archivos && facets.archivos.length > 0}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggle('archivos')}>
                <i class="bi {sections.archivos ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>Archivo</span>
            </button>
            {#if sections.archivos}
                <div class="facet-options">
                    {#each (showAllArchivos ? facets.archivos : facets.archivos.slice(0, INITIAL_SHOW)) as archivo}
                        <label class="facet-option">
                            <input type="checkbox"
                                checked={$activeFilters.archivo_id.includes(archivo.id)}
                                on:change={() => toggleFilter('archivo_id', archivo.id)} />
                            <span class="facet-label">{archivo.nombre}</span>
                            <span class="facet-count">{archivo.count}</span>
                        </label>
                    {/each}
                    {#if facets.archivos.length > INITIAL_SHOW}
                        <button class="btn btn-sm btn-link p-0 mt-1" on:click={() => showAllArchivos = !showAllArchivos}>
                            {showAllArchivos ? 'Ver menos' : `Ver todos (${facets.archivos.length})`}
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- ═══ Calidades ═══ -->
    {#if facets.calidades && facets.calidades.length > 0}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggle('calidades')}>
                <i class="bi {sections.calidades ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>Calidad</span>
            </button>
            {#if sections.calidades}
                <div class="facet-options">
                    {#each (showAllCalidades ? facets.calidades : facets.calidades.slice(0, INITIAL_SHOW)) as item}
                        <label class="facet-option">
                            <input type="checkbox"
                                checked={$activeFilters.calidad.includes(item.label)}
                                on:change={() => toggleFilter('calidad', item.label)} />
                            <span class="facet-label">{item.label}</span>
                            <span class="facet-count">{item.count}</span>
                        </label>
                    {/each}
                    {#if facets.calidades.length > INITIAL_SHOW}
                        <button class="btn btn-sm btn-link p-0 mt-1" on:click={() => showAllCalidades = !showAllCalidades}>
                            {showAllCalidades ? 'Ver menos' : `Ver todos (${facets.calidades.length})`}
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- ═══ Etnónimos ═══ -->
    {#if facets.etnonimos && facets.etnonimos.length > 0}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggle('etnonimos')}>
                <i class="bi {sections.etnonimos ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>Etnónimo</span>
            </button>
            {#if sections.etnonimos}
                <div class="facet-options">
                    {#each (showAllEtnonimos ? facets.etnonimos : facets.etnonimos.slice(0, INITIAL_SHOW)) as item}
                        <label class="facet-option">
                            <input type="checkbox"
                                checked={$activeFilters.etnonimo.includes(item.label)}
                                on:change={() => toggleFilter('etnonimo', item.label)} />
                            <span class="facet-label">{item.label}</span>
                            <span class="facet-count">{item.count}</span>
                        </label>
                    {/each}
                    {#if facets.etnonimos.length > INITIAL_SHOW}
                        <button class="btn btn-sm btn-link p-0 mt-1" on:click={() => showAllEtnonimos = !showAllEtnonimos}>
                            {showAllEtnonimos ? 'Ver menos' : `Ver todos (${facets.etnonimos.length})`}
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- ═══ Hispanizaciones ═══ -->
    {#if facets.hispanizaciones && facets.hispanizaciones.length > 0}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggle('hispanizaciones')}>
                <i class="bi {sections.hispanizaciones ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>Hispanización</span>
            </button>
            {#if sections.hispanizaciones}
                <div class="facet-options">
                    {#each (showAllHispanizaciones ? facets.hispanizaciones : facets.hispanizaciones.slice(0, INITIAL_SHOW)) as item}
                        <label class="facet-option">
                            <input type="checkbox"
                                checked={$activeFilters.hispanizacion.includes(item.label)}
                                on:change={() => toggleFilter('hispanizacion', item.label)} />
                            <span class="facet-label">{item.label}</span>
                            <span class="facet-count">{item.count}</span>
                        </label>
                    {/each}
                    {#if facets.hispanizaciones.length > INITIAL_SHOW}
                        <button class="btn btn-sm btn-link p-0 mt-1" on:click={() => showAllHispanizaciones = !showAllHispanizaciones}>
                            {showAllHispanizaciones ? 'Ver menos' : `Ver todos (${facets.hispanizaciones.length})`}
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- ═══ Ocupaciones ═══ -->
    {#if facets.ocupaciones && facets.ocupaciones.length > 0}
        <div class="facet-section">
            <button class="facet-section-header" on:click={() => toggle('ocupaciones')}>
                <i class="bi {sections.ocupaciones ? 'bi-chevron-down' : 'bi-chevron-right'} me-1"></i>
                <span>Ocupación</span>
            </button>
            {#if sections.ocupaciones}
                <div class="facet-options">
                    {#each (showAllOcupaciones ? facets.ocupaciones : facets.ocupaciones.slice(0, INITIAL_SHOW)) as item}
                        <label class="facet-option">
                            <input type="checkbox"
                                checked={$activeFilters.ocupacion.includes(item.label)}
                                on:change={() => toggleFilter('ocupacion', item.label)} />
                            <span class="facet-label">{item.label}</span>
                            <span class="facet-count">{item.count}</span>
                        </label>
                    {/each}
                    {#if facets.ocupaciones.length > INITIAL_SHOW}
                        <button class="btn btn-sm btn-link p-0 mt-1" on:click={() => showAllOcupaciones = !showAllOcupaciones}>
                            {showAllOcupaciones ? 'Ver menos' : `Ver todos (${facets.ocupaciones.length})`}
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</aside>

<style>
    .facet-sidebar {
        font-size: 0.875rem;
        border-right: 1px solid #dee2e6;
        padding-right: 1rem;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        position: sticky;
        top: 100px;
    }

    .facet-section {
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .facet-section-header {
        display: flex;
        align-items: center;
        width: 100%;
        background: none;
        border: none;
        padding: 0.4rem 0;
        font-weight: 600;
        font-size: 0.85rem;
        color: #333;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        cursor: pointer;
    }
    .facet-section-header:hover {
        color: var(--bs-primary, #0d6efd);
    }

    .facet-options {
        padding-left: 0.25rem;
    }

    .facet-option {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.15rem 0;
        cursor: pointer;
        font-size: 0.82rem;
        color: #444;
    }
    .facet-option:hover {
        color: #000;
    }
    .facet-option input[type="checkbox"] {
        flex-shrink: 0;
        margin: 0;
    }

    .facet-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .facet-count {
        flex-shrink: 0;
        color: #888;
        font-size: 0.75rem;
    }

    .date-tree .tree-decade {
        border-left: 1px solid #ddd;
        padding-left: 0.5rem;
    }
</style>
