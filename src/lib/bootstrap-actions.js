import { browser } from '$app/environment';

export function dropdown(node) {
	if (!browser) return;

	let dropdownInstance;

	async function initializeDropdown() {
		const bootstrap = await import('bootstrap');
		dropdownInstance = new bootstrap.Dropdown(node);
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
	let destroyed = false;
	let initToken = 0;

	function hideTooltip() {
		if (!tooltipInstance) return;

		try {
			tooltipInstance.hide();
		} catch (error) {
			console.warn('Tooltip hide error (safely handled):', error.message);
		}
	}

	// Bootstrap appends the tooltip element to <body>, so it outlives the trigger
	// node. Always dispose (even if the node is already detached) or the tooltip
	// stays behind, visible, after client-side navigation.
	function disposeTooltip() {
		const instance = tooltipInstance;
		tooltipInstance = null;
		if (!instance) return;

		try {
			instance.dispose();
		} catch (error) {
			console.warn('Tooltip disposal error (safely handled):', error.message);
			try {
				instance.tip?.remove();
			} catch {
				/* ignore */
			}
		}
	}

	function initializeTooltip() {
		const token = ++initToken;

		import('bootstrap').then((bootstrap) => {
			if (destroyed || token !== initToken || !node?.isConnected) {
				return;
			}

			const title =
				options.title || node.getAttribute('title') || node.getAttribute('data-bs-title');

			if (title) {
				tooltipInstance = new bootstrap.Tooltip(node, {
					...options,
					title: title,
					trigger: options.trigger || 'hover focus'
				});
			}
		});
	}

	node.addEventListener('click', hideTooltip);
	initializeTooltip();

	return {
		update(newOptions) {
			if (destroyed) return;

			options = newOptions;
			initToken++;
			disposeTooltip();
			initializeTooltip();
		},
		destroy() {
			destroyed = true;
			initToken++;
			node.removeEventListener('click', hideTooltip);
			disposeTooltip();
		}
	};
}
