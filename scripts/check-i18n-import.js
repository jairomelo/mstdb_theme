/*
Durable guard for the Paraglide message function `m`.

`m` (imported from '$lib/paraglide/messages.js') is not a compiler-known global, so a
component that calls `m.foo()` without importing it is only caught at runtime, and only
when that branch renders. SvelteKit/the Svelte compiler do not flag it because the theme
has no static analysis (prettier only). This scan flags any `.svelte`/`.js`/`.ts` source
under `src/` that references `m.<identifier>` without importing `m` from a paraglide
messages module.

Usage:
  node scripts/check-i18n-import.js

Exit code is non-zero when a missing import is found, so it can gate CI/local checks.
The generated `src/lib/paraglide/**` output is excluded.
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../src');
const EXCLUDE_DIR = path.resolve(SRC_DIR, 'lib/paraglide');
const EXTENSIONS = new Set(['.svelte', '.js', '.ts', '.mjs']);

const MESSAGE_USAGE = /\bm\.[A-Za-z_$][\w$]*/;
const MESSAGE_IMPORT = /import\s*\{[^}]*\bm\b[^}]*\}\s*from\s*['"][^'"]*paraglide\/messages(?:\.js)?['"]/;

async function walk(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (full === EXCLUDE_DIR) continue;
			files.push(...(await walk(full)));
		} else if (EXTENSIONS.has(path.extname(entry.name))) {
			files.push(full);
		}
	}
	return files;
}

// Strip comments only (keep strings/template literals so `${m.x()}` is detected).
function stripComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

async function main() {
	const files = await walk(SRC_DIR);
	const violations = [];

	for (const file of files) {
		const source = await fs.readFile(file, 'utf-8');
		const code = stripComments(source);
		if (!MESSAGE_USAGE.test(code)) continue;
		if (MESSAGE_IMPORT.test(code)) continue;
		violations.push(path.relative(process.cwd(), file));
	}

	if (violations.length === 0) {
		console.log('✅ check-i18n-import: no unimported `m.*` usages found in src/.');
		return;
	}

	console.error('❌ check-i18n-import: `m.*` used without a paraglide import:\n');
	for (const file of violations) {
		console.error(`   - ${file}`);
	}
	console.error(
		"\n   Add: import { m } from '$lib/paraglide/messages.js';\n"
	);
	process.exit(1);
}

main().catch((err) => {
	console.error('❌ check-i18n-import scan failed:', err);
	process.exit(1);
});
