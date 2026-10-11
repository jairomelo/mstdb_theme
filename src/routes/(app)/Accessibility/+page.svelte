<script>
	import { m } from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.accessibility_declaration()}</title>
</svelte:head>

<div class="container mt-4">
	<div class="about-hero mb-5 text-center" data-aos="fade-up">
		<h1 class="display-4 mb-4">{m.accessibility_declaration_title()}</h1>
		<div class="divider mx-auto"></div>
	</div>

	<div class="row justify-content-center" data-aos="fade-up" data-aos-delay="100">
		<div class="col-lg-9">
			<!-- About this statement -->
			<section class="description-section mb-5" aria-labelledby="commitment-heading">
				<h2 id="commitment-heading" class="section-title">
					<i class="bi bi-universal-access me-2" aria-hidden="true"></i>{m.mean_dry_leopard_file()}
				</h2>
				<p class="lead">
					{m.major_bald_fish_sail()}<strong>{m.left_curly_jan_care()}</strong>{m.glad_happy_newt_enrich()}
				</p>
			</section>

			<!-- Conformance Status -->
			<section class="mb-5" aria-labelledby="conformance-heading">
				<h2 id="conformance-heading" class="section-title">
					<i class="bi bi-patch-check me-2" aria-hidden="true"></i>{m.mellow_suave_ladybug_soar()}
				</h2>
				<p>
					{m.sound_hour_shrimp_quiz()}
					<a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener">
						{m.east_silly_ant_leap()}
					</a>
					{m.nice_sour_jackal_favor()}
					<a
						href="https://www.ada.gov/resources/2024-03-08-web-rule/"
						target="_blank"
						rel="noopener">{m.many_top_puma_succeed()}</a
					>
					{m.wide_alive_sawfish_treat()}
				</p>
				<p>
					{m.odd_spicy_ostrich_link()}
					<a
						href="https://www.ucop.edu/electronic-accessibility/index.html"
						target="_blank"
						rel="noopener"
					>
						{m.super_pretty_buzzard_work()}
					</a>.
				</p>

				<div class="contributor-card mt-4">
					<div class="card-body">
						<h3 class="contributor-name fs-5">{m.honest_ok_sheep_trim()}</h3>
						<p class="mb-0">
							<strong>{m.neat_tense_marten_pet()}</strong> {m.ornate_super_hawk_drop()}
						</p>
					</div>
				</div>
			</section>

			<!-- Measures Taken -->
			<section class="mb-5" aria-labelledby="measures-heading">
				<h2 id="measures-heading" class="section-title">
					<i class="bi bi-list-check me-2" aria-hidden="true"></i>{m.ok_jolly_shrimp_snap()}
				</h2>
				<p>{m.home_blue_mammoth_adore()}</p>
				<ul>
					<li>{m.weird_vexed_mule_conquer()}<code>lang="es"</code>.</li>
					<li>
						{m.whole_blue_tuna_trip()}
					</li>
					<li>{m.close_quiet_sparrow_cook()}</li>
					<li>{m.grand_warm_hare_dine()}</li>
					<li>
						{m.ideal_heavy_cougar_renew()}<code
							>aria-describedby</code
						>.
					</li>
					<li>
						{m.late_red_hedgehog_talk()}(<em>focus trapping</em>).
					</li>
					<li>{m.icy_trite_canary_twirl()}</li>
					<li>
						{m.east_fine_wolf_approve()}<code
							>aria-hidden="true"</code
						>.
					</li>
					<li>{m.next_east_cockroach_tickle()}</li>
					<li>{m.drab_dirty_herring_heal()}</li>
					<li>{m.less_white_vulture_savor()}<code>prefers-reduced-motion</code>.</li>
					<li>
						{m.livid_weary_hornet_mop()}<a
							href="https://www.deque.com/axe/"
							target="_blank"
							rel="noopener">axe-core</a
						>{m.spicy_icy_cockroach_thrive()}
					</li>
				</ul>
			</section>

			<!-- Known Limitations -->
			<section class="mb-5" aria-labelledby="limitations-heading">
				<h2 id="limitations-heading" class="section-title">
					<i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>{m.known_limitations()}
				</h2>
				<p>
					{m.stout_any_samuel_borrow()}
				</p>
				<div class="contributor-card">
					<div class="card-body">
						<ul class="mb-0">
							<li>
								<strong>{m.routes_map()}</strong> — {m.late_polite_hound_achieve()}
							</li>
							<li>
								<strong>{m.people_network()}</strong> — {m.real_plain_termite_rush()}
							</li>
							<li>
								<strong>{m.people_by_place()}</strong> — {m.this_many_piranha_strive()}
							</li>
						</ul>
					</div>
				</div>
				<p class="mt-3">
					{m.glad_gross_crab_amaze()}
				</p>
			</section>

			<!-- Feedback & Contact -->
			<section class="mb-5" aria-labelledby="feedback-heading">
				<h2 id="feedback-heading" class="section-title">
					<i class="bi bi-envelope me-2" aria-hidden="true"></i>{m.feedback()}
				</h2>
				<p>
					{m.few_lost_fish_harbor()}
				</p>
				<ul>
					<li>
						<a
							href="https://github.com/TrayectoriasAfro/trayectoriasAfro/issues/new?template=accessibility-issue.md"
							>{m.accessibility_report()}</a
						>
					</li>
				</ul>
				<p>
					{m.sad_grand_cobra_support()}
				</p>
			</section>

			<!-- Technical Specification -->
			<section class="mb-5" aria-labelledby="tech-heading">
				<h2 id="tech-heading" class="section-title">
					<i class="bi bi-code-slash me-2" aria-hidden="true"></i>{m.technical_specification()}
				</h2>
				<p>
					{m.sad_clean_lynx_offer()}
					<a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noopener">axe-core</a
					>, {m.dry_seemly_halibut_heart()}
				</p>
				<p>{m.inner_front_buzzard_express()}</p>
				<ul>
					<li>Safari + VoiceOver (macOS)</li>
					<li>{m.simple_candid_sloth_type()}</li>
					<li>{m.green_dizzy_osprey_push()}</li>
				</ul>
			</section>
		</div>
	</div>
</div>
