<script>

    import { tooltip } from '$lib/tooltip.js';

	export let corp;
</script>

<div class="list-group-item list-group-item-action">
    <div class="d-flex w-100 justify-content-between">
        <a href="/Detail/corporaciones/{corp.corporacion_id}"> <!-- TODO: Corporación detail view -->
        <h5 class="mb-1">{corp.nombre_institucion}</h5>
		</a>
		<small>{corp.fecha_fundacion || 'N/A'}</small>
	</div>
	<p class="mb-1">Tipo: {corp.tipo_institucion || 'Desconocido'}</p>
	<small>Ubicación: {corp.ubicacion || 'N/A'}</small>
</div>