import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build' // Output directory for the Node.js server
    }),
    // Add other necessary configurations
  }
};
