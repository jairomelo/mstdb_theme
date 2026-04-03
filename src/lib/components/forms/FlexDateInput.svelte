<script>
    import { createEventDispatcher } from 'svelte';

    export let value = '';      // raw string the user types (e.g. "1650" or "03-1690")
    export let id = '';
    export let required = false;
    export let disabled = false;

    const dispatch = createEventDispatcher();
    const HINT = 'DD-MM-AAAA, MM-AAAA, o AAAA';
    const PATTERN = /^(\d{4}|\d{2}-\d{4}|\d{2}-\d{2}-\d{4})$/;

    let touched = false;
    $: isValid = !touched || PATTERN.test((value ?? '').trim().replace(/\//g, '-'));

    function onInput(e) {
        value = e.target.value;
        touched = true;
        dispatch('change', value);
    }
</script>

<input
    {id}
    type="text"
    class="form-control"
    class:is-invalid={!isValid}
    placeholder={HINT}
    {required}
    {disabled}
    bind:value
    on:input={onInput}
    on:blur={() => (touched = true)}
    autocomplete="off"
/>
{#if !isValid}
    <div class="invalid-feedback">{HINT}</div>
{/if}
