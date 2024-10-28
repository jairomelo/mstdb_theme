<script>
  export let currentPage;
  export let totalPages;
  export let loadNextPage;
  export let loadPreviousPage;
  export let previousPage;
  export let nextPage;
</script>

<nav aria-label="Navegación de página" class="pagination-container">
  <div class="pagination-wrapper">
      <button 
          class="pagination-button" 
          disabled={!previousPage}
          on:click={loadPreviousPage}
      >
          <i class="bi bi-chevron-left"></i>
      </button>

      <div class="pagination-info">
          <span class="current-page">{currentPage}</span>
          <span class="page-divider">de</span>
          <span class="total-pages">{totalPages}</span>
      </div>

      <button 
          class="pagination-button"
          disabled={!nextPage}
          on:click={loadNextPage}
      >
          <i class="bi bi-chevron-right"></i>
      </button>
  </div>
</nav>