<script>
  export let item;
</script>

<div class="card mb-3">
  <div class="row g-0">
    <!-- Icon Section -->
    <div class="col-auto icon-section d-flex align-items-center justify-content-center">
      <slot name="icon">
        <!-- Default Icon Placeholder -->
        <i class="bi bi-file-text fs-1 text-muted"></i>
      </slot>
    </div>
    <!-- Content Section -->
    <div class="col">
      <div class="card-body">
        <!-- Title and Header Info -->
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <!-- Title Link -->
            <a href="/Detail/{item.type}/{item.id}" class="text-decoration-none">
              <h5 class="card-title mb-1">
                <slot name="title">
                  {item.source.titulo || item.source.nombre_normalizado || 'N/A'}
                </slot>
              </h5>
            </a>
          </div>
          <!-- Optional Header Info (e.g., dates) -->
          <div>
            <small class="text-muted">
              <slot name="header-info"></slot>
            </small>
          </div>
        </div>
        <!-- Custom Content -->
        <div class="card-text">
          <slot></slot>
        </div>
        <!-- Highlights -->
        {#if item.highlight}
          <div class="highlights mt-2">
            {#each Object.values(item.highlight).flat() as highlightText}
              <div class="highlight-text">
                {@html highlightText}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

