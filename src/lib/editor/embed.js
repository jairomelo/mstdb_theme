const YOUTUBE_PATTERNS = [
	/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#\s]*&)?v=([\w-]{6,})/i,
	/(?:https?:\/\/)?youtu\.be\/([\w-]{6,})/i,
	/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([\w-]{6,})/i,
	/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{6,})/i
];

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg)(?:[?#].*)?$/i;

/**
 * Detects how a URL should be embedded. Pure function.
 * Returns { kind: 'youtube'|'pdf'|'image'|'iframe', src } or null if not embeddable.
 */
export function detectEmbed(rawUrl) {
	let url = (rawUrl || '').trim();
	if (!url) return null;
	if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}
	if (!/^https?:$/.test(parsed.protocol)) return null;

	for (const pattern of YOUTUBE_PATTERNS) {
		const match = url.match(pattern);
		if (match) {
			return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${match[1]}` };
		}
	}

	if (/\.pdf(?:[?#].*)?$/i.test(parsed.pathname)) {
		return { kind: 'pdf', src: url };
	}

	if (IMAGE_EXT_RE.test(parsed.pathname)) {
		return { kind: 'image', src: url };
	}

	return { kind: 'iframe', src: url };
}

export const EMBED_KIND_LABELS = {
	youtube: 'Vídeo de YouTube',
	pdf: 'Documento PDF',
	image: 'Imagen',
	iframe: 'Página o visor incrustado (iframe)'
};
