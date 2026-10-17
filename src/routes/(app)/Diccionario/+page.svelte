<script>
	import { onMount } from 'svelte';
	import { dataDictionary } from '$lib/api.js';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	let dictionaries = { models: [], vocabularies: [] };
	let loading = true;
	let error = null;
	let query = '';

	onMount(async () => {
		try {
			dictionaries = await dataDictionary();
		} catch (e) {
			error = e.message;
			console.error('Failed to load data dictionary:', e);
		} finally {
			loading = false;
		}
	});
	$: locale = getLocale();
	$: needle = query.trim().toLowerCase();

	function description(item) {
		return (locale === 'en' ? item.descripcion_en : item.descripcion_es) || '';
	}

	function matches(text) {
		return !needle || (text || '').toLowerCase().includes(needle);
	}

	let models = [];
	let vocabularies = [];

	// Reference `needle` and `locale` directly so the reactive recomputes when the
	// query or language changes (they are only used inside the helpers above).
	$: {
		void needle;
		void locale;
		models = (dictionaries.models || [])
			.map((model) => ({
				...model,
				variables: model.variables.filter(
					(variable) =>
						matches(variable.clave) || matches(description(variable)) || matches(variable.tipo)
				)
			}))
			.filter((model) => model.variables.length > 0);

		vocabularies = (dictionaries.vocabularies || [])
			.map((vocab) => ({
				...vocab,
				terms: vocab.terms.filter((term) => matches(term.value) || matches(term.descripcion))
			}))
			.filter((vocab) => vocab.terms.length > 0);
	}

	$: hasResults = models.length > 0 || vocabularies.length > 0;
	function vocabLabel(vocab) {
		return (locale === 'en' ? vocab.label_en : vocab.label_es) || vocab.modelo;
	}
</script>

<svelte:head>
	<title>{m.dict_head_title()}</title>
	<meta name="description" content={m.dict_description()} />
</svelte:head>

<div class="container mt-4">
	<header class="mb-4">
		<h1>{m.dict_title()}</h1>
		<p class="lead">{m.dict_description()}</p>
	</header>

	<div class="row mb-4">
		<div class="col-12 col-md-6 col-lg-5">
			<label class="form-label" for="dict-search">{m.dict_search_label()}</label>
			<input
				id="dict-search"
				class="form-control"
				type="search"
				bind:value={query}
				placeholder={m.dict_search_placeholder()}
			/>
		</div>
	</div>

	{#if error}
		<div class="alert alert-danger" role="alert">
			<i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>{m.dict_error()}
		</div>
	{:else if loading}
		<div class="text-center py-5">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">{m.loading()}</span>
			</div>
		</div>
	{:else if !hasResults}
		<p class="text-muted">{m.dict_empty()}</p>
	{:else}
		<h2 class="h4 mt-5">{m.dict_models()}</h2>
		{#each models as model}
			<section class="mb-4" aria-labelledby={`model-${model.modelo}`}>
				<h3 id={`model-${model.modelo}`} class="h5">{model.modelo}</h3>
				<div class="table-responsive">
					<table class="table table-sm align-middle">
						<caption class="visually-hidden"
							>{m.dict_table_caption({ model: model.modelo })}</caption
						>
						<thead>
							<tr>
								<th scope="col">{m.dict_col_variable()}</th>
								<th scope="col">{m.dict_col_tipo()}</th>
								<th scope="col">{m.dict_col_descripcion()}</th>
							</tr>
						</thead>
						<tbody>
							{#each model.variables as variable}
								<tr>
									<th scope="row"><code>{variable.clave}</code></th>
									<td>{variable.tipo || '—'}</td>
									<td>{description(variable) || '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/each}

		<h2 class="h4 mt-5">{m.dict_vocabularies()}</h2>
		{#each vocabularies as vocab}
			<section class="mb-4" aria-labelledby={`vocab-${vocab.modelo}`}>
				<h3 id={`vocab-${vocab.modelo}`} class="h5">
					{vocabLabel(vocab)}
					<span class="badge bg-secondary ms-2"
						>{m.dict_terms_count({ count: vocab.terms.length })}</span
					>
				</h3>
				<div class="table-responsive">
					<table class="table table-sm align-middle">
						<caption class="visually-hidden">{vocabLabel(vocab)}</caption>
						<thead>
							<tr>
								<th scope="col">{m.dict_col_value()}</th>
								<th scope="col">{m.dict_col_descripcion()}</th>
							</tr>
						</thead>
						<tbody>
							{#each vocab.terms as term}
								<tr>
									<th scope="row">{term.value}</th>
									<td>{term.descripcion || '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/each}
	{/if}
</div>
