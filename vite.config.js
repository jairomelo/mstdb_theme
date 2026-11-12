import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import path from 'path';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	plugins: [
		sveltekit({
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html',
				precompress: false,
				strict: true
			}),
			alias: {
				$conf: path.resolve('src/conf'),
				$lib: path.resolve('src/lib')
			},
			paths: {
				base: process.env.NODE_ENV === 'production' ? '' : ''
			},
			preprocess: vitePreprocess()
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['cookie', 'baseLocale']
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
		exclude: ['js-big-decimal']
	},
	build: {
		target: 'es2015',
		// Ensure assets are properly hashed for cache busting
		rollupOptions: {
			output: {
				manualChunks: undefined
			}
		}
	},
	server: {
		proxy: {
			// Proxy API calls to Django during development
			'/api': {
				target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
				changeOrigin: true
			}
		}
	}
});
