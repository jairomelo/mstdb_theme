import { browser } from '$app/environment';

export const bootstrapReady = browser
  ? Promise.all([
      import('bootstrap/js/dist/dropdown'),
      import('bootstrap/js/dist/collapse'),
      import('bootstrap/js/dist/tooltip')
    ])
  : Promise.resolve();