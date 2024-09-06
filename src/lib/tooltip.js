import { browser } from '$app/environment';

export function tooltip(node, options = {}) {
    if (browser) {
        import('bootstrap').then((bootstrap) => {
            const title = node.getAttribute('title') || node.getAttribute('data-bs-title');
            
            if (title) {
                const tooltip = new bootstrap.Tooltip(node, {
                    ...options,
                    title: title
                });
                
                return {
                    destroy() {
                        tooltip.dispose();
                    }
                };
            } else {
                console.warn('Tooltip initialization skipped: No valid title found for', node);
            }
        });
    }
}
