<style>
  .navbar {
    position: absolute;
    width: 100%;
    top: 0;
    z-index: 10;
  }

  .navbar-toggler {
    margin-left: 1rem;
    margin-top: 1rem;
  }

  .dropdown-menu {
    border: none;
  }
  .dropdown-item {
    border: none;
    color:rgba(255,255,255,.55);
    background-color: none;
  }

  .dropdown-item:hover {
    color: rgba(255,255,255,.75);
    background-color: transparent;
  }

  .dropdown-item:focus {
    background-color: transparent;
    border: 1px solid rgba(255,255,255,.75);
  }

</style>

<nav class="navbar navbar-dark bg-transparent navbar-collapse">
    <div class="container-fluid">
      <button class="navbar-toggler me-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Navegar
            </a>
            <ul class="dropdown-menu bg-transparent" aria-labelledby="navbarDropdown">
              <li><a class="dropdown-item" href="/Browse/documentos/">Documentos</a></li>
              <li><a class="dropdown-item" href="/Browse/personasesclavizadas/">Personas Esclavizadas</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  

<slot />

