<script>
    export let label = '';
    export let error = null;
    export let required = false;
    export let hint = '';
    export let id = '';
</script>

<div class="mb-3">
    {#if label}
        <label class="form-label" for={id}>
            {label}{#if required}<span class="text-danger ms-1" aria-hidden="true">*</span>{/if}
        </label>
    {/if}
    <slot />
    {#if hint && !error}
        <div id="{id ? `${id}-hint` : undefined}" class="form-text">{hint}</div>
    {/if}
    {#if error}
        <div id="{id ? `${id}-error` : undefined}" class="invalid-feedback d-block">{error}</div>
    {/if}
</div>
