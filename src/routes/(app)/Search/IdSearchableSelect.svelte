<script>
    import { createEventDispatcher } from 'svelte';

    export let options = [];          // [{ id, label|nombre, count }]
    export let value = '';            // comma-separated IDs (string) or single ID
    export let placeholder = 'Buscar...';
    export let multi = false;

    const dispatch = createEventDispatcher();

    let searchText = '';
    let isOpen = false;
    let inputEl;

    // Normalize options to { id, label, count }
    $: normalized = options.map(o => ({
        id: o.id,
        label: o.label || o.nombre || '',
        count: o.count || 0,
    }));

    $: selectedIds = value ? String(value).split(',').map(Number).filter(Boolean) : [];

    $: filtered = searchText
        ? normalized.filter(o => o.label.toLowerCase().includes(searchText.toLowerCase()))
        : normalized;

    $: displayText = multi
        ? selectedIds.map(id => normalized.find(o => o.id === id)?.label).filter(Boolean).join(', ')
        : (normalized.find(o => o.id === selectedIds[0])?.label || '');

    function handleFocus() {
        isOpen = true;
        searchText = '';
    }

    function handleInput(e) {
        searchText = e.target.value;
        isOpen = true;
    }

    function toggle(opt) {
        if (multi) {
            let ids = [...selectedIds];
            const idx = ids.indexOf(opt.id);
            if (idx >= 0) ids.splice(idx, 1);
            else ids.push(opt.id);
            const newVal = ids.join(',');
            value = newVal;
            dispatch('change', newVal);
        } else {
            if (selectedIds[0] === opt.id) {
                value = '';
                dispatch('change', '');
            } else {
                value = String(opt.id);
                dispatch('change', String(opt.id));
            }
            isOpen = false;
            searchText = '';
        }
    }

    function clear() {
        value = '';
        searchText = '';
        isOpen = false;
        dispatch('change', '');
    }

    function handleBlur() {
        setTimeout(() => { isOpen = false; }, 200);
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') {
            isOpen = false;
            inputEl?.blur();
        }
    }
</script>

<div class="searchable-select" on:keydown={handleKeydown}>
    <div class="searchable-select-input-wrap">
        <input
            bind:this={inputEl}
            type="text"
            class="form-control form-control-sm"
            placeholder={value ? '' : placeholder}
            value={isOpen ? searchText : displayText}
            on:focus={handleFocus}
            on:blur={handleBlur}
            on:input={handleInput}
        />
        {#if value}
            <button class="searchable-select-clear" on:mousedown|preventDefault={clear}
                    title="Limpiar" type="button">&times;</button>
        {/if}
    </div>
    {#if isOpen && filtered.length > 0}
        <ul class="searchable-select-dropdown">
            {#each filtered as opt}
                <li class:selected={selectedIds.includes(opt.id)}>
                    <button type="button" on:mousedown|preventDefault={() => toggle(opt)}>
                        {#if multi}
                            <span class="searchable-select-check">{selectedIds.includes(opt.id) ? '☑' : '☐'}</span>
                        {/if}
                        <span class="searchable-select-label">{opt.label}</span>
                        <span class="searchable-select-count">{opt.count}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>
