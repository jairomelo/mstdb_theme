<script>
  import { contributors } from '$conf/contributors';
</script>

<div class="container mt-4">
  <!-- Hero Section for About Page -->
  <div class="about-hero mb-5 text-center" data-aos="fade-up">
    <h1 class="display-4 mb-4">Sobre el Proyecto</h1>
    <div class="divider mx-auto"></div>
  </div>

  <!-- Main Content -->
  <div class="row justify-content-center" data-aos="fade-up" data-aos-delay="100">
    <div class="col-lg-10">
      <!-- Main Description -->
      <div class="description-section mb-5">
        <p class="lead">
          El sitio web Trayectorias Afro es el resultado de colaboración entre investigadores de varias instituciones de México y Estados Unidos desde 2022, para la construcción de una base de datos de personas esclavizadas en la Nueva España en la que, a través del análisis pormenorizado de fuentes documentales se dé cuenta de su movilidad geográfica en el territorio novohispano.
        </p>
        <p>
          Este proyecto también busca democratizar la información poniendo la documentación histórica al alcance de amplios sectores de la sociedad mexicana y del mundo académico.
        </p>
        <div class="collaboration-invite mt-4">
          <p class="text-primary d-flex align-items-center">
            <i class="bi bi-info-circle me-2"></i>
            Invitamos a otros investigadores a colaborar con esta iniciativa.
          </p>
        </div>
      </div>

      <!-- Coordinators Section -->
      <div class="team-section mb-5" data-aos="fade-up">
        <h2 class="section-title">
          <i class="bi bi-people-fill me-2"></i>Coordinadores
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
          <i class="bi bi-people me-2"></i>Participantes
        </h2>
        <p class="section-subtitle mb-4">
          Han colaborado con sus bases de datos, o las de sus instituciones:
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
            <i class="bi bi-code-slash me-2"></i>Desarrollo Técnico
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
          <h2 class="section-title">Financiamiento</h2>
          <p>
            Partes de este proyecto han sido financiadas por el University of California MRPI 
            <a href="https://www.humanities.uci.edu/routes-enslavement-americas" target="_blank">
              Routes of Enslavement in the Americas
            </a>
          </p>
        </div>

        <!-- Acknowledgments -->
        <div class="acknowledgments-section">
          <h2 class="section-title">Agradecimientos</h2>
          <p>
            Agradecemos el hospedaje web de este proyecto a la 
            <a href="https://neogranadina.org/" target="_blank">Fundación Neogranadina</a>, 
            y el asesoramiento para esto de Juan Cobo de la 
            <a href="https://www.history.ucsb.edu/faculty/juan-cobo/" target="_blank">
              Universidad de California, Santa Bárbara
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
    background-color: var(--text-primary);
    color: white;
    border-radius: 8px;
    margin-bottom: 3rem;
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

  .team-card, .contributor-card, .assistant-card, .developer-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .team-card:hover, .contributor-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .member-name, .contributor-name {
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
