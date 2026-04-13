<svelte:head>
  <title>Accesibilidad — Trayectorias Afro</title>
</svelte:head>

<div class="container mt-4">
  <div class="about-hero mb-5 text-center" data-aos="fade-up">
    <h1 class="display-4 mb-4">Declaración de Accesibilidad</h1>
    <div class="divider mx-auto"></div>
  </div>

  <div class="row justify-content-center" data-aos="fade-up" data-aos-delay="100">
    <div class="col-lg-9">

      <!-- About this statement -->
      <section class="description-section mb-5" aria-labelledby="commitment-heading">
        <h2 id="commitment-heading" class="section-title">
          <i class="bi bi-universal-access me-2" aria-hidden="true"></i>Sobre esta declaración
        </h2>
        <p class="lead">
          Esta declaración fue elaborada el <strong>13 de abril de 2026</strong> y refleja el estado 
          de accesibilidad del sitio en esa fecha.
        </p>
      </section>

      <!-- Conformance Status -->
      <section class="mb-5" aria-labelledby="conformance-heading">
        <h2 id="conformance-heading" class="section-title">
          <i class="bi bi-patch-check me-2" aria-hidden="true"></i>Estado de Conformidad
        </h2>
        <p>
          Este sitio web busca cumplir con las 
          <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener">
            Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1, Nivel AA
          </a> 
          del World Wide Web Consortium (W3C), así como con los requisitos de accesibilidad establecidos 
          por el <a href="https://www.ada.gov/resources/2024-03-08-web-rule/" target="_blank" rel="noopener">Departamento de Justicia de los Estados Unidos (DOJ)</a> 
          bajo el Título II de la Ley para Americanos con Discapacidades (ADA), aplicables a instituciones de educación superior que 
          reciben fondos federales.
        </p>
        <p>
          El sitio también sigue los lineamientos de la 
          <a href="https://www.ucop.edu/electronic-accessibility/index.html" target="_blank" rel="noopener">
            Política de Accesibilidad de Tecnologías de la Información de la Universidad de California
          </a>.
        </p>

        <div class="contributor-card mt-4">
          <div class="card-body">
            <h3 class="contributor-name fs-5">Nivel de conformidad alcanzado</h3>
            <p class="mb-0">
              <strong>WCAG 2.1 Nivel AA — Conforme</strong> para las páginas de contenido principal 
              (inicio, búsqueda, acerca del proyecto, archivos y detalle de registros). Las secciones 
              de visualización interactiva (mapa de trayectorias, red de personas y personas por lugar) 
              aún no alcanzan ese nivel en esta versión.
            </p>
          </div>
        </div>
      </section>

      <!-- Measures Taken -->
      <section class="mb-5" aria-labelledby="measures-heading">
        <h2 id="measures-heading" class="section-title">
          <i class="bi bi-list-check me-2" aria-hidden="true"></i>Medidas Adoptadas
        </h2>
        <p>Para cumplir con estas normas, el equipo de desarrollo ha implementado:</p>
        <ul>
          <li>Identificación del idioma de la página con el atributo <code>lang="es"</code>.</li>
          <li>Enlace de salto al contenido principal para usuarios de teclado y lectores de pantalla.</li>
          <li>Títulos de página únicos y descriptivos en todas las rutas.</li>
          <li>Etiquetas visibles o accesibles en todos los controles de formulario.</li>
          <li>Mensajes de error vinculados programáticamente a los campos correspondientes mediante <code>aria-describedby</code>.</li>
          <li>Gestión del foco en ventanas modales y paneles deslizantes (<em>focus trapping</em>).</li>
          <li>Indicador de foco visible en todos los elementos interactivos.</li>
          <li>Textos alternativos en imágenes informativas; imágenes decorativas marcadas con <code>aria-hidden="true"</code>.</li>
          <li>Contraste de color mínimo de 4.5:1 para texto normal y 3:1 para texto grande.</li>
          <li>Operabilidad completa mediante teclado.</li>
          <li>Soporte para la preferencia de usuario <code>prefers-reduced-motion</code>.</li>
          <li>Evaluación automatizada continua con <a href="https://www.deque.com/axe/" target="_blank" rel="noopener">axe-core</a> mediante pruebas de regresión con Playwright.</li>
        </ul>
      </section>

      <!-- Known Limitations -->
      <section class="mb-5" aria-labelledby="limitations-heading">
        <h2 id="limitations-heading" class="section-title">
          <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>Limitaciones Conocidas
        </h2>
        <p>
          Las siguientes secciones presentan limitaciones de accesibilidad que no han sido resueltas 
          en esta versión:
        </p>
        <div class="contributor-card">
          <div class="card-body">
            <ul class="mb-0">
              <li>
                <strong>Mapa de Trayectorias</strong> — visualización geográfica interactiva; 
                no cuenta actualmente con una alternativa textual completa para los datos representados.
              </li>
              <li>
                <strong>Red de Personas</strong> — grafo de relaciones interactivo; 
                los nodos y aristas no disponen de descripciones accesibles individuales.
              </li>
              <li>
                <strong>Personas por Lugar</strong> — visualización estadística interactiva; 
                la información no está disponible en formato tabular alternativo.
              </li>
            </ul>
          </div>
        </div>
        <p class="mt-3">
          En versiones futuras se buscará incluir descripciones textuales alternativas, 
          tablas de datos descargables y controles accesibles para estas visualizaciones.
        </p>
      </section>

      <!-- Feedback & Contact -->
      <section class="mb-5" aria-labelledby="feedback-heading">
        <h2 id="feedback-heading" class="section-title">
          <i class="bi bi-envelope me-2" aria-hidden="true"></i>Retroalimentación
        </h2>
        <p>
          La accesibilidad es un reto que no siempre se alcanza a superar con las herramientas actuales.
          Si encuentra alguna barrera de accesibilidad que considere que debe atenderse, puede
          abrir un reporte en el repositorio del proyecto con el siguiente enlace:
        </p>
        <ul>
          <li>
            <a href="https://github.com/TrayectoriasAfro/trayectoriasAfro/issues/new?template=accessibility-issue.md">Reporte de accesibilidad</a>
          </li>
        </ul>
        <p>
          Trayectorias Afro es un proyecto de investigación con recursos limitados; no siempre es posible
          atender los reportes de forma inmediata. Las mejoras de accesibilidad se incorporarán en la próxima versión.
        </p>
      </section>

      <!-- Technical Specification -->
      <section class="mb-5" aria-labelledby="tech-heading">
        <h2 id="tech-heading" class="section-title">
          <i class="bi bi-code-slash me-2" aria-hidden="true"></i>Especificación Técnica
        </h2>
        <p>
          Este sitio web fue desarrollado con SvelteKit y Bootstrap. La conformidad 
          se verifica mediante herramientas automatizadas basadas en el motor 
          <a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noopener">axe-core</a>, 
          integradas en una batería de pruebas Playwright ejecutada contra las páginas principales del sitio.
        </p>
        <p>
          Los navegadores y tecnologías de apoyo con los que se ha validado el sitio incluyen:
        </p>
        <ul>
          <li>Safari + VoiceOver (macOS)</li>
          <li>Chrome (pruebas automatizadas con axe-core)</li>
          <li>Firefox (navegación por teclado)</li>
        </ul>
      </section>

    </div>
  </div>
</div>
