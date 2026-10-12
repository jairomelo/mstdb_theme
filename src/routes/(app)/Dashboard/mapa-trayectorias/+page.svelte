<script>
	import { m } from '$lib/paraglide/messages.js';

	import ArcsMap from '../viz/ArcsMap.svelte';
</script>

<svelte:head>
	<title>{m.viz_map_head_title()}</title>
</svelte:head>

<div class="container-fluid py-4">
	<div class="row mb-3">
		<div class="col">
			<nav aria-label="breadcrumb">
				<ol class="breadcrumb">
					<li class="breadcrumb-item"><a href="/Dashboard">{m.viz_map_title()}</a></li>
					<li class="breadcrumb-item active" aria-current="page">{m.viz_map_breadcrumb()}</li>
				</ol>
			</nav>
		</div>
	</div>

	<div class="row mb-4">
		<div class="col-lg-8">
			<h1 class="display-5">{m.viz_map_breadcrumb()}</h1>
			<p class="lead text-muted">
				{m.viz_map_panel_desc()}
			</p>
			<dl class="row small text-muted mb-0">
				<dt class="col-sm-2">{m.source()}</dt>
				<dd class="col-sm-10">{m.viz_map_panel_source()}</dd>
				<dt class="col-sm-2">{m.data()}</dt>
				<dd class="col-sm-10">{m.viz_map_panel_data()}</dd>
			</dl>
		</div>
	</div>

	<div class="row">
		<div class="col">
			<ArcsMap />
		</div>
	</div>
</div>
