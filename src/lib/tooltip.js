import { browser } from '$app/environment';

export function tooltip(node, options = {}) {
    if (browser) {
        import('bootstrap').then((bootstrap) => {
            const tooltip = new bootstrap.Tooltip(node, options);
            return {
                destroy() {
                    tooltip.dispose();
                }
            };
        });
    }
}
