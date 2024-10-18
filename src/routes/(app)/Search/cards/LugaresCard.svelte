<script>

    import { tooltip } from '$lib/tooltip.js';

	export let lugar;
</script>

<div class="list-group-item list-group-item-action">
    <div class="d-flex w-100 justify-content-between">
        <a href="/Detail/lugares/{lugar.lugar_id}">
        <h5 class="mb-1">{lugar.nombre_lugar} {#if lugar.tipo_lugar}({lugar.tipo_lugar}){/if}</h5>
    </a>
    </div>
    <p class="mb-1">Personas relacionadas:</p>
    {#if lugar.personas_relacionadas.length > 0}
        {#each lugar.personas_relacionadas.slice(0, 5) as relaciones, index}
            {#each relaciones.personas as per}
            <a class="{per.polymorphic_ctype?.includes('persona esclavizada') ? 'text-primary' : 'text-secondary'}" 
            href="/Detail/{per.polymorphic_ctype?.includes('persona esclavizada') ? 'personaEsclavizada' : 'personaNoEsclavizada'}/{per.persona_id}">
                    {per.nombre_normalizado}
                </a>
                {#if index < 4 && index < lugar.personas_relacionadas.length - 1} | {/if}
            {/each}
        {/each}
        {#if lugar.personas_relacionadas.length > 5}
            <a href="/Detail/lugares/{lugar.lugar_id}" class="ms-2" use:tooltip={{ title: 'Ver todas las personas relacionadas', trigger: 'hover' }}>
                <i class="bi bi-plus-circle"></i>
            </a>
        {/if}
    {:else}
        <span>No hay personas relacionadas</span>
    {/if}
</div>