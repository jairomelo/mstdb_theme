const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Svelte action: traps keyboard focus inside `node` while active.
 * Moves focus to the first focusable child on mount.
 * Restores focus to `returnTo` (defaults to document.activeElement at mount time) on destroy.
 *
 * Usage:
 *   <div use:focusTrap>…</div>
 *   <div use:focusTrap={{ returnTo: triggerEl }}>…</div>
 */
export function focusTrap(node, options = {}) {
	const returnTo = options.returnTo ?? document.activeElement;

	function getFocusable() {
		return Array.from(node.querySelectorAll(FOCUSABLE)).filter(
			(el) => !el.closest('[hidden]') && el.offsetParent !== null,
		);
	}

	function handleKeydown(e) {
		if (e.key !== 'Tab') return;
		const focusable = getFocusable();
		if (focusable.length === 0) {
			e.preventDefault();
			return;
		}
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	// Move focus into the trap
	const focusable = getFocusable();
	if (focusable.length > 0) {
		focusable[0].focus();
	} else {
		node.focus();
	}

	node.addEventListener('keydown', handleKeydown);

	return {
		update(newOptions) {
			// Allow callers to update returnTo after mount
			if (newOptions?.returnTo !== undefined) {
				// Can't reassign const — handled via closure capture; caller should recreate if needed
			}
		},
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			if (returnTo && typeof returnTo.focus === 'function') {
				returnTo.focus();
			}
		},
	};
}
