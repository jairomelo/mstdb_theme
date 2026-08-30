import { Node, mergeAttributes } from '@tiptap/core';
import { FigureNodeView } from './figure-node-view.js';

function buildEmbedMedia(node) {
	const wrap = document.createElement('div');
	wrap.className = 'lesson-embed__frame';
	const iframe = document.createElement('iframe');
	iframe.src = node.attrs.src;
	iframe.title = node.attrs.title || 'Contenido incrustado';
	iframe.setAttribute('allowfullscreen', 'true');
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('loading', 'lazy');
	wrap.appendChild(iframe);
	// Click shield so the node is selectable while unfocused.
	const shield = document.createElement('div');
	shield.className = 'lesson-embed__shield';
	wrap.appendChild(shield);
	return wrap;
}

/**
 * Custom block node for rich-media embeds (YouTube, PDF, IIIF, generic iframe).
 * Stores only `src` (+ optional caption/title) in the document; renders as
 * `<figure class="lesson-embed lesson-embed--{type}">…</figure>`.
 */
export const Embed = Node.create({
	name: 'embed',
	group: 'block',
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			src: { default: null },
			// youtube | pdf | iframe (generic, incl. IIIF)
			embedType: { default: 'iframe' },
			title: { default: '' },
			caption: { default: '' }
		};
	},

	parseHTML() {
		return [
			{
				selector: 'figure.lesson-embed',
				getAttrs: (dom) => {
					const iframe = dom.querySelector('iframe');
					const figcaption = dom.querySelector('figcaption');
					const typeClass = [...dom.classList].find((c) => c.startsWith('lesson-embed--'));
					return {
						src: iframe?.getAttribute('src') || null,
						embedType: typeClass ? typeClass.replace('lesson-embed--', '') : 'iframe',
						title: iframe?.getAttribute('title') || '',
						caption: figcaption?.textContent?.trim() || ''
					};
				}
			}
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		const { src, embedType, title, caption } = node.attrs;
		return [
			'figure',
			mergeAttributes(HTMLAttributes, { class: `lesson-embed lesson-embed--${embedType}` }),
			[
				'div',
				{ class: 'lesson-embed__frame' },
				[
					'iframe',
					{
						src,
						title: title || 'Contenido incrustado',
						allowfullscreen: 'true',
						frameborder: '0',
						loading: 'lazy'
					}
				]
			],
			['figcaption', { class: 'lesson-embed__caption' }, caption || '']
		];
	},

	addNodeView() {
		return ({ node, editor, getPos }) =>
			new FigureNodeView(node, editor.view, getPos, buildEmbedMedia);
	},

	addCommands() {
		return {
			setEmbed:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({ type: this.name, attrs })
		};
	}
});

export default Embed;
