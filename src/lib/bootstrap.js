import { browser } from '$app/environment';

if (browser) {
  import('bootstrap/js/dist/dropdown');
  import('bootstrap/js/dist/collapse');
  import('bootstrap/js/dist/tooltip');
  // Add other Bootstrap components as needed
}