import { Node, mergeAttributes } from '@tiptap/core';
import { FigureNodeView } from './figure-node-view.js';

function buildImageMedia(node) {
	const img = document.createElement('img');
	img.src = node.attrs.src;
	img.alt = node.attrs.alt || '';
	if (node.attrs.title) img.title = node.attrs.title;
	return img;
}

/**
 * Drop-in replacement for @tiptap/extension-image that renders
 * `<figure class="lesson-figure--image"><img><figcaption>…</figcaption></figure>`
 * so uploaded images can carry a caption. Parses legacy bare `<img>` content.
 */
export const CaptionedImage = Node.create({
	name: 'image',
	group: 'block',
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			src: { default: null },
			alt: { default: '' },
			title: { default: '' },
			caption: { default: '' }
		};
	},

	parseHTML() {
		return [
			{
				tag: 'img[src]',
				getAttrs: (dom) => ({
					src: dom.getAttribute('src'),
					alt: dom.getAttribute('alt') || '',
					title: dom.getAttribute('title') || '',
					caption: dom.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || ''
				})
			},
			// The caption text lives in the `caption` attribute; don't let it leak
			// into the document as plain text while parsing figure markup.
			{ tag: 'figcaption', skip: true }
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			'figure',
			mergeAttributes(HTMLAttributes, { class: 'lesson-figure lesson-figure--image' }),
			['img', { src: node.attrs.src, alt: node.attrs.alt, title: node.attrs.title || null }],
			['figcaption', { class: 'lesson-figure__caption' }, node.attrs.caption || '']
		];
	},

	addNodeView() {
		return ({ node, editor, getPos }) =>
			new FigureNodeView(node, editor.view, getPos, buildImageMedia);
	},

	addCommands() {
		return {
			setImage:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({ type: this.name, attrs })
		};
	}
});

export default CaptionedImage;
