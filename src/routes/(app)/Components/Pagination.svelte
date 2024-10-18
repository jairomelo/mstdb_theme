<script>
    export let currentPage;
    export let totalPages;
    export let loadNextPage;
    export let loadPreviousPage;
    export let previousPage;
    export let nextPage;
  </script>
  
  <nav aria-label="Navegación de página" class="my-4">
    <ul class="pagination justify-content-center">
      {#if previousPage}
        <li class="page-item">
          <button class="page-link" on:click={loadPreviousPage}>
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
      {/if}
      <li class="page-item disabled">
        <span class="page-link">Página {currentPage} de {totalPages}</span>
      </li>
      {#if nextPage}
        <li class="page-item">
          <button class="page-link" on:click={loadNextPage}>
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      {/if}
    </ul>
  </nav>
  