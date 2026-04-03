<script>
    import { fetchWithBaseUrl } from '$lib/api.js';
    import { createEventDispatcher, onMount } from 'svelte';

    export let values = [];        // [{ value, label }, ...]
    export let endpoint = '';
    export let searchParam = 'search';
    export let placeholder = 'Buscar y añadir…';
    export let id = '';
    export let disabled = false;

    const dispatch = createEventDispatcher();

    let query = '';
    let options = [];
    let loading = false;
    let debounceTimer;
    let container;

    function formatOption(item) {
        const label = item.nombre_lugar ?? item.nombre ?? item.nombre_institucion ??
                      item.nombre_normalizado ?? item.titulo ??
                      item.calidad ?? item.etonimo ?? item.hispanizacion ??
                      item.estado_civil ?? item.actividad ?? item.situacion ??
                      item.rol_evento ?? item.tipo_documental ?? item.tipo ??
                      String(Object.values(item)[1] ?? '');
        const idKey = Object.keys(item).find(k => k.endsWith('_id') || k === 'pk');
        return { value: item[idKey] ?? item.id, label };
    }

    async function search(q) {
        if (!q) { options = []; return; }
        loading = true;
        try {
            const params = new URLSearchParams({ [searchParam]: q, page_size: 30 });
            const data = await fetchWithBaseUrl(`${endpoint}?${params}`);
            const all = (data.results ?? data).map(formatOption);
            // exclude already-selected
            const selected = new Set(values.map(v => v.value));
            options = all.filter(o => !selected.has(o.value));
        } catch { options = []; }
        finally { loading = false; }
    }

    function add(opt) {
        if (!values.find(v => v.value === opt.value)) {
            values = [...values, opt];
            dispatch('change', values);
        }
        query = '';
        options = [];
    }

    function remove(opt) {
        values = values.filter(v => v.value !== opt.value);
        dispatch('change', values);
    }

    function onInput(e) {
        query = e.target.value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => search(query), 300);
    }

    function onWindowClick(e) {
        if (container && !container.contains(e.target)) options = [];
    }
</script>

<svelte:window on:click={onWindowClick} />

<div class="multi-select-wrapper" bind:this={container}>
    <div class="multi-select-tags">
        {#each values as v}
            <span class="badge bg-secondary me-1 mb-1">
                {v.label}
                <button type="button" class="btn-close btn-close-white btn-close-sm ms-1"
                    aria-label="Quitar {v.label}" on:click={() => remove(v)} />
            </span>
        {/each}
    </div>
    <input
        {id}
        type="text"
        class="form-control mt-1"
        {placeholder}
        {disabled}
        bind:value={query}
        on:input={onInput}
        autocomplete="off"
    />
    {#if options.length > 0 || loading}
        <ul class="searchable-select-dropdown list-group">
            {#if loading}
                <li class="list-group-item text-muted small">Buscando…</li>
            {/if}
            {#each options as opt}
                <li class="list-group-item list-group-item-action"
                    role="option"
                    tabindex="0"
                    on:click={() => add(opt)}
                    on:keydown={(e) => e.key === 'Enter' && add(opt)}>
                    {opt.label}
                </li>
            {/each}
        </ul>
    {/if}
</div>
