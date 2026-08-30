/**
 * Vanilla-JS ProseMirror NodeView for figure-based nodes (captioned image + embed).
 * Renders `<figure>…(img|iframe)…<figcaption><input></figcaption></figure>` and lets
 * the caption be edited inline via the input while the node is selected.
 */
export class FigureNodeView {
	constructor(node, view, getPos, buildMedia) {
		this.node = node;
		this.view = view;
		this.getPos = getPos;
		this.buildMedia = buildMedia;

		this.dom = document.createElement('figure');
		this.dom.setAttribute('contenteditable', 'false');
		this.applyClass();

		this.mediaEl = buildMedia(node);
		this.dom.appendChild(this.mediaEl);

		this.captionInput = document.createElement('input');
		this.captionInput.type = 'text';
		this.captionInput.className = 'lesson-figure-caption-input';
		this.captionInput.placeholder = 'Añadir pie de figura…';
		this.captionInput.value = node.attrs.caption || '';
		this.captionInput.setAttribute('aria-label', 'Pie de figura');
		this.captionInput.addEventListener('input', () => this.onCaptionInput());
		this.captionInput.addEventListener('click', (e) => e.stopPropagation());

		this.figcaption = document.createElement('figcaption');
		this.figcaption.className = 'lesson-figure__caption';
		this.figcaption.appendChild(this.captionInput);
		this.dom.appendChild(this.figcaption);
	}

	applyClass() {
		const type = this.node.attrs.embedType;
		if (type) {
			this.dom.className = `lesson-embed lesson-embed--${type}`;
		} else {
			this.dom.className = 'lesson-figure lesson-figure--image';
		}
	}

	onCaptionInput() {
		const pos = typeof this.getPos === 'function' ? this.getPos() : null;
		if (pos == null) return;
		const { state, dispatch } = this.view;
		const tr = state.tr.setNodeMarkup(pos, undefined, {
			...this.node.attrs,
			caption: this.captionInput.value
		});
		dispatch(tr);
	}

	update(node) {
		if (node.type !== this.node.type) return false;
		this.node = node;
		if (this.captionInput.value !== node.attrs.caption) {
			this.captionInput.value = node.attrs.caption || '';
		}
		return true;
	}

	selectNode() {
		this.dom.classList.add('lesson-figure--selected');
	}

	deselectNode() {
		this.dom.classList.remove('lesson-figure--selected');
	}

	stopEvent(event) {
		// Let the caption input handle its own keyboard events.
		return event.target === this.captionInput;
	}

	ignoreMutation(mutation) {
		// Don't let ProseMirror try to sync DOM changes caused by typing in the input.
		if (this.captionInput.contains?.(mutation.target)) return true;
		return true;
	}

	destroy() {
		this.dom = null;
	}
}
