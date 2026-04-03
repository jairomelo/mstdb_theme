<script>
    import { fetchWithBaseUrl } from '$lib/api.js';
    import { createEventDispatcher, onMount } from 'svelte';

    export let value = null;       // { value, label } or null
    export let endpoint = '';      // e.g. 'lugares/' or 'vocabularios/calidades/'
    export let searchParam = 'search'; // query param name
    export let placeholder = 'Buscar…';
    export let id = '';
    export let disabled = false;

    const dispatch = createEventDispatcher();

    let query = '';
    let options = [];
    let open = false;
    let loading = false;
    let debounceTimer;
    let container;

    $: displayValue = value ? value.label : '';

    async function search(q) {
        if (!q) { options = []; return; }
        loading = true;
        try {
            const params = new URLSearchParams({ [searchParam]: q, page_size: 20 });
            const data = await fetchWithBaseUrl(`${endpoint}?${params}`);
            // Support both paginated { results: [] } and plain array responses
            options = (data.results ?? data).map(item => formatOption(item));
        } catch (e) {
            options = [];
        } finally {
            loading = false;
        }
    }

    function formatOption(item) {
        // Heuristic: find the first useful label field
        const label = item.nombre_lugar ?? item.nombre ?? item.nombre_institucion ??
                      item.nombre_normalizado ?? item.titulo ??
                      item.calidad ?? item.etonimo ?? item.hispanizacion ??
                      item.estado_civil ?? item.actividad ?? item.situacion ??
                      item.rol_evento ?? item.tipo_documental ?? item.tipo ??
                      String(Object.values(item)[1] ?? '');
        const idKey = Object.keys(item).find(k => k.endsWith('_id') || k === 'pk');
        return { value: item[idKey] ?? item.id, label };
    }

    function onInput(e) {
        query = e.target.value;
        open = true;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => search(query), 300);
    }

    function select(opt) {
        value = opt;
        query = opt.label;
        open = false;
        dispatch('change', opt);
    }

    function clear() {
        value = null;
        query = '';
        options = [];
        dispatch('change', null);
    }

    function onFocus() { if (query) open = true; }

    function onKeydown(e) {
        if (e.key === 'Escape') { open = false; }
    }

    // Close on outside click
    function onWindowClick(e) {
        if (container && !container.contains(e.target)) open = false;
    }

    onMount(() => {
        if (value) query = value.label;
    });
</script>

<svelte:window on:click={onWindowClick} />

<div class="searchable-select-wrapper" bind:this={container}>
    <div class="input-group">
        <input
            {id}
            type="text"
            class="form-control"
            {placeholder}
            {disabled}
            bind:value={query}
            on:input={onInput}
            on:focus={onFocus}
            on:keydown={onKeydown}
            autocomplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
        />
        {#if value}
            <button type="button" class="btn btn-outline-secondary" on:click={clear} aria-label="Limpiar">
                &times;
            </button>
        {/if}
    </div>

    {#if open && (options.length > 0 || loading)}
        <ul class="searchable-select-dropdown list-group">
            {#if loading}
                <li class="list-group-item text-muted small">Buscando…</li>
            {/if}
            {#each options as opt}
                <li class="list-group-item list-group-item-action"
                    role="option"
                    aria-selected={value?.value === opt.value}
                    on:click={() => select(opt)}
                    on:keydown={(e) => e.key === 'Enter' && select(opt)}
                    tabindex="0">
                    {opt.label}
                </li>
            {/each}
        </ul>
    {/if}
</div>
