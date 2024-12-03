import { browser } from '$app/environment';

export function dropdown(node) {
    if (!browser) return;

    let dropdownInstance;

    function initializeDropdown() {
        import('bootstrap').then((bootstrap) => {
            dropdownInstance = new bootstrap.Dropdown(node);
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

  function initializeTooltip() {
      import('bootstrap').then((bootstrap) => {
          const title = options.title || node.getAttribute('title') || node.getAttribute('data-bs-title');
          
          if (title) {
              tooltipInstance = new bootstrap.Tooltip(node, {
                  ...options,
                  title: title,
                  trigger: options.trigger || 'hover focus'
              });

              // Hide tooltip on click
              node.addEventListener('click', () => {
                  tooltipInstance.hide();
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
          if (tooltipInstance) {
              tooltipInstance.dispose();
          }
          initializeTooltip();
      },
      destroy() {
          if (tooltipInstance) {
              tooltipInstance.dispose();
          }
      }
  };
}