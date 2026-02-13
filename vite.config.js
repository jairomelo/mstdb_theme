import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
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
