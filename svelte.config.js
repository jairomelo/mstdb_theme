import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import path from 'path';

export default {
  kit: {
    adapter: adapter({
      out: 'build' // Output directory for the Node.js server
    }),
    alias: {
      $conf: path.resolve('src/conf'),
    },
    // Add other necessary configurations
  },
  preprocess: vitePreprocess()
};
