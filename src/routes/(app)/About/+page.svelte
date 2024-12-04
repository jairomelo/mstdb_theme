<script>
  import { contributors } from '$conf/contributors';
</script>

<div class="container mt-4">
  <div class="card shadow">
    <div class="card-header bg-primary text-white">
      <h1 class="card-title mb-0">Sobre el Proyecto</h1>
    </div>
    
    <div class="card-body">
      <!-- Main Description -->
      <div class="mb-4">
        <p class="lead">
          El sitio web Trayectorias Afro es el resultado de colaboración entre investigadores de varias instituciones de México y Estados Unidos desde 2022, para la construcción de una base de datos de personas esclavizadas en la Nueva España en la que, a través del análisis pormenorizado de fuentes documentales se dé cuenta de su movilidad geográfica en el territorio novohispano.
        </p>
        <p>
          Este proyecto también busca democratizar la información poniendo la documentación histórica al alcance de amplios sectores de la sociedad mexicana y del mundo académico.
        </p>
        <p class="text-primary">
          <i class="bi bi-info-circle me-2"></i>
          Invitamos a otros investigadores a colaborar con esta iniciativa.
        </p>
      </div>

      <!-- Coordinators Section -->
      <div class="mb-4">
        <h2 class="h4 text-primary mb-3">
          <i class="bi bi-people-fill me-2"></i>Coordinadores:
        </h2>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {#each contributors.coordinators as coordinator}
            <div class="col">
              <div class="card h-100">
                <div class="card-body">
                  <h5 class="card-title">{coordinator.name}</h5>
                  <h6 class="card-subtitle mb-2 text-muted"><a href={coordinator.institutionurl} target="_blank">{coordinator.institution}</a></h6>
                  {#if coordinator.additionalInfo}
                    <p class="card-text small">{@html coordinator.additionalInfo}</p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Contributors Section -->
      <div class="mb-4">
        <h2 class="h4 text-primary mb-3">
          <i class="bi bi-people me-2"></i>Participantes que han colaborado con sus bases de datos, o las de sus instituciones:
        </h2>
        
        <div class="row g-4">
          {#each contributors.collaborators as collaborator}
            <div class="col-12">
              <div class="card">
                <div class="row g-0">
                  <div class="col-md-4">
                    <div class="card-body">
                      <h5 class="card-title">{collaborator.name}</h5>
                      <h6 class="card-subtitle mb-2 text-muted">{collaborator.institution}</h6>
                    </div>
                  </div>
                  <div class="col-md-8">
                    <div class="card-body">
                      <p class="card-text">{@html collaborator.bio}</p>
                      {#if collaborator.additionalInfo}
                        <p class="card-text"><small class="text-muted">{@html collaborator.additionalInfo}</small></p>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Research Assistant -->
      {#if contributors.researchAssistants.length > 0}
        <div class="mb-4">
          <h2 class="h4 text-primary mb-3">
            <i class="bi bi-person-badge me-2"></i>Ayudante de Investigación:
          </h2>
          {#each contributors.researchAssistants as assistant}
            <p>{assistant.name}, <a href={assistant.institutionurl} target="_blank">{assistant.institution}</a></p>
          {/each}
        </div>
      {/if}

      <!-- DEvelopers -->
      {#if contributors.developers.length > 0}
      <div class="mb-4">
        <h2 class="h4 text-primary mb-3">
          <i class="bi bi-code-slash me-2"></i>Desarrollo Técnico:
        </h2>
        {#each contributors.developers as developer}
          <p>
            {developer.name}, 
            <a href={developer.institutionurl} target="_blank">{developer.institution}</a>
            <br>
            <small class="text-muted">{developer.role}</small>
          </p>
        {/each}
        </div>
      {/if}


      <!-- Funding -->
      <div class="mb-4">
        <h2 class="h4 text-primary mb-3">
          Financiamiento:
        </h2>
        <p>Partes de este proyecto han sido financiadas por el University of California MRPI <a href="https://www.humanities.uci.edu/routes-enslavement-americas" target="_blank">Routes of Enslavement in the Americas</a></p>
      </div>

      <!-- Acknowledgments -->
      <div>
        <h2 class="h4 text-primary mb-3">
          Agradecimientos:
        </h2>
        <p>Agradecemos el hospedaje web de este proyecto a la <a href="https://neogranadina.org/" target="_blank">Fundación Neogranadina</a>, y el asesoramiento para esto de Juan Cobo de la <a href="https://www.history.ucsb.edu/faculty/juan-cobo/" target="_blank">Universidad de California, Santa Bárbara</a>.</p>
      </div>
    </div>
  </div>
</div>
