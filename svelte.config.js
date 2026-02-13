import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import path from 'path';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA fallback for client-side routing
      precompress: false,
      strict: true
    }),
    alias: {
      $conf: path.resolve('src/conf'),
    },
    paths: {
      base: process.env.NODE_ENV === 'production' ? '' : ''
    },
    // Add other necessary configurations
  },
  preprocess: vitePreprocess()
};
