export function tooltip(node, options = {}) {
    if (typeof bootstrap !== 'undefined') {
        const tooltip = new bootstrap.Tooltip(node, options);

        return {
            destroy() {
                tooltip.dispose();
            }
        };
    }
}
