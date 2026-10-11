<script>
	import { contributors } from '$conf/contributors';
	import { m } from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.about_ta()}</title>
</svelte:head>

<div class="container mt-4">
	<!-- Hero Section for About Page -->
	<div class="about-hero mb-5 text-center" data-aos="fade-up">
		<h1 class="display-4 mb-4">{m.about_project()}</h1>
		<div class="divider mx-auto"></div>
	</div>

	<!-- Main Content -->
	<div class="row justify-content-center" data-aos="fade-up" data-aos-delay="100">
		<div class="col-lg-10">
			<!-- Main Description -->
			<div class="description-section mb-5">
				<p class="lead">
					{m.such_aware_flea_glow()}
				</p>
				<p>
					{m.slimy_calm_ladybug_coax()}
				</p>
				<div class="collaboration-invite mt-4">
					<p class="text-primary d-flex align-items-center">
						<i class="bi bi-info-circle me-2"></i>
						{m.kind_salty_toucan_enjoy()}
					</p>
				</div>
			</div>

			<!-- Coordinators Section -->
			<div class="team-section mb-5" data-aos="fade-up">
				<h2 class="section-title">
					<i class="bi bi-people-fill me-2"></i>{m.coordinators()}
				</h2>
				<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-3">
					{#each contributors.coordinators as coordinator}
						<div class="col">
							<div class="team-card">
								<div class="card-content">
									<h3 class="member-name">{coordinator.name}</h3>
									<a href={coordinator.institutionurl} target="_blank" class="institution-link">
										{coordinator.institution}
									</a>
									{#if coordinator.additionalInfo}
										<p class="additional-info">{@html coordinator.additionalInfo}</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Contributors Section -->
			<div class="contributors-section mb-5" data-aos="fade-up">
				<h2 class="section-title">
					<i class="bi bi-people me-2"></i>{m.participants()}
				</h2>
				<p class="section-subtitle mb-4">
					{m.sharp_kind_dragonfly_jest()}
				</p>

				<div class="contributors-grid">
					{#each contributors.collaborators as collaborator}
						<div class="contributor-card" data-aos="fade-up">
							<div class="card-body">
								<div class="contributor-info">
									<h3 class="contributor-name">{collaborator.name}</h3>
									<h4 class="contributor-institution">{collaborator.institution}</h4>
								</div>
								<div class="contributor-bio">
									<p>{@html collaborator.bio}</p>
									{#if collaborator.additionalInfo}
										<p class="additional-info">{@html collaborator.additionalInfo}</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Research Assistant Section -->
			{#if contributors.researchAssistants.length > 0}
				<div class="research-section mb-5" data-aos="fade-up">
					<h2 class="section-title">
						<i class="bi bi-person-badge me-2"></i>Ayudante de Investigación
					</h2>
					<div class="assistant-cards mt-3">
						{#each contributors.researchAssistants as assistant}
							<div class="assistant-card">
								<p class="mb-0">
									<strong>{assistant.name}</strong>
									<a href={assistant.institutionurl} target="_blank" class="institution-link">
										{assistant.institution}
									</a>
								</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Developers Section -->
			{#if contributors.developers.length > 0}
				<div class="developers-section mb-5" data-aos="fade-up">
					<h2 class="section-title">
						<i class="bi bi-code-slash me-2"></i>{m.few_neat_goose_ascend()}
					</h2>
					<div class="developer-cards mt-3">
						{#each contributors.developers as developer}
							<div class="developer-card">
								<p class="mb-0">
									<strong>{developer.name}</strong>
									<a href={developer.institutionurl} target="_blank" class="institution-link">
										{developer.institution}
									</a>
								</p>
								<p class="developer-role">{developer.role}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Footer Sections -->
			<div class="footer-sections" data-aos="fade-up">
				<!-- Funding -->
				<div class="funding-section mb-4">
					<h2 class="section-title">{m.financing()}</h2>
					<p>
						{m.funding_parts()}
						<a href="https://www.humanities.uci.edu/routes-enslavement-americas" target="_blank">
							{m.routes_of_enslavement()}
						</a>
						{m.university_of_california()}
						<a
							href="https://alianzamx.universityofcalifornia.edu/research-and-innovation/latino-studies-projects/"
							target="_blank"
						>
							{m.alianza_mx()}
						</a>
					</p>
				</div>

				<!-- Acknowledgments -->
				<div class="acknowledgments-section">
					<h2 class="section-title">{m.acknowledgements()}</h2>
					<p>
						{m.tangy_merry_camel_rush()}
						<a href="https://neogranadina.org/" target="_blank">{m.weird_nimble_hedgehog_grow()}</a>{m.low_patient_baboon_enrich()}
						<a href="https://www.history.ucsb.edu/faculty/juan-cobo/" target="_blank">
							{m.bland_misty_lobster_spur()}
						</a>.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.about-hero {
		padding: 4rem 0;
		background-image: url('/media/rutas_project1.webp');
		background-size: cover;
		background-position: center;
		color: white;
		border-radius: 8px;
		margin-bottom: 3rem;
		position: relative;
		overflow: hidden;
	}

	.about-hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.55);
		border-radius: 8px;
	}

	.about-hero > * {
		position: relative;
		z-index: 1;
	}

	.divider {
		width: 60px;
		height: 3px;
		background-color: white;
		margin: 2rem auto;
	}

	.section-title {
		color: var(--text-primary);
		font-family: 'eb-garamond';
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--text-primary);
	}

	.section-subtitle {
		color: #666;
		font-style: italic;
	}

	.team-card,
	.contributor-card,
	.assistant-card,
	.developer-card {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.team-card:hover,
	.contributor-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.member-name,
	.contributor-name {
		color: var(--text-primary);
		font-family: 'eb-garamond';
		margin-bottom: 0.5rem;
	}

	.institution-link {
		color: #666;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.institution-link:hover {
		color: var(--text-primary);
	}

	.additional-info {
		font-size: 0.9rem;
		color: #666;
		margin-top: 1rem;
	}

	.contributors-grid {
		display: grid;
		gap: 2rem;
	}

	.contributor-bio {
		margin-top: 1rem;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.developer-role {
		font-size: 0.9rem;
		color: #666;
		margin-top: 0.5rem;
	}

	.collaboration-invite {
		background-color: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid var(--text-primary);
	}

	@media (max-width: 768px) {
		.about-hero {
			padding: 2rem 0;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.contributors-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
