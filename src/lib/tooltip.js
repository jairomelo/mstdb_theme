import { browser } from '$app/environment';

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