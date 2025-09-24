import { browser } from '$app/environment';

export function dropdown(node) {
    if (!browser) return;

    let dropdownInstance;

    async function initializeDropdown() {
        const bootstrap = await import('bootstrap');
        dropdownInstance = new bootstrap.Dropdown(node);
        
        // Add manual event listeners
        node.addEventListener('click', (e) => {
            e.preventDefault();
            if (dropdownInstance) {
                dropdownInstance.toggle();
            }
        });
    }

    initializeDropdown();

    return {
        destroy() {
            if (dropdownInstance) {
                dropdownInstance.dispose();
            }
        }
    };
}

export function collapse(node) {
    if (!browser) return;

    let collapseInstance;

    function initializeCollapse() {
        import('bootstrap').then((bootstrap) => {
            collapseInstance = new bootstrap.Collapse(node, {
                toggle: false 
            });
        });
    }

    initializeCollapse();

    return {
        destroy() {
            if (collapseInstance) {
                collapseInstance.dispose();
            }
        }
    };
}


export function tooltip(node, options = {}) {
  if (!browser) return;

  let tooltipInstance;

  /* Safely dispose of the tooltip instance */
  function safeDisposeTooltip() {
      if (tooltipInstance) {
          try {
              if (node && node.isConnected && document.contains(node)) {
                  tooltipInstance.dispose();
              } else {
                  tooltipInstance = null;
              }
          } catch (error) {
              console.warn('Tooltip disposal error (safely handled):', error.message);
              tooltipInstance = null;
          }
      }
  }

  function initializeTooltip() {
      import('bootstrap').then((bootstrap) => {
          if (!node || !node.isConnected) {
              return;
          }
          
          const title = options.title || node.getAttribute('title') || node.getAttribute('data-bs-title');
          
          if (title) {
              tooltipInstance = new bootstrap.Tooltip(node, {
                  ...options,
                  title: title,
                  trigger: options.trigger || 'hover focus'
              });

              // Hide tooltip on click
              node.addEventListener('click', () => {
                  if (tooltipInstance) {
                      try {
                          tooltipInstance.hide();
                      } catch (error) {
                          console.warn('Tooltip hide error (safely handled):', error.message);
                      }
                  }
              });
          } else {
              console.warn('Tooltip initialization skipped: No valid title found for', node);
          }
      });
  }

  initializeTooltip();

  return {
      update(newOptions) {
          options = newOptions;
          safeDisposeTooltip();
          initializeTooltip();
      },
      destroy() {
          safeDisposeTooltip();
      }
  };
}