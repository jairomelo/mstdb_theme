import { test, expect } from '@playwright/test';

// Regression guard for the production bundle: d3's "sideEffects": false lets
// Rolldown (Vite 8) drop the d3-transition re-export, so selection.transition is
// missing and ArcsMap 500s on first render. The arc's stroke-width is only set
// by that transition, so it never appears in the broken bundle.
const FIXTURE = {
	routes: [
		{
			from_lugar_id: 1,
			from_nombre: 'Cartagena',
			from_lat: 10.39,
			from_lon: -75.51,
			to_lugar_id: 2,
			to_nombre: 'Santa Marta',
			to_lat: 11.24,
			to_lon: -74.2,
			count: 2,
			years: { 1601: 1, 1605: 1 },
			min_year: 1601,
			max_year: 1605,
			undated: 0
		}
	],
	places: [
		{
			lugar_id: 1,
			nombre: 'Cartagena',
			lat: 10.39,
			lon: -75.51,
			incoming: 0,
			outgoing: 1,
			persona_count: 2
		},
		{
			lugar_id: 2,
			nombre: 'Santa Marta',
			lat: 11.24,
			lon: -74.2,
			incoming: 1,
			outgoing: 0,
			persona_count: 2
		}
	],
	total_routes: 1,
	total_places: 2,
	truncated: false,
	limit_rutas: 10,
	min_count: 1,
	min_year: 1601,
	max_year: 1605,
	undated_count: 0
};

test('trajectory map renders arcs (d3-transition present in bundle)', async ({ page }) => {
	const failures = [];
	page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
	page.on('console', (msg) => {
		if (msg.type() === 'error') failures.push(`console: ${msg.text()}`);
	});

	await page.route(/\/api\/v2\/travel-trajectories\/aggregated\//, (route) =>
		route.fulfill({ json: FIXTURE })
	);
	// Anonymous user: whoami() maps a 403 to null.
	await page.route(/\/api\/v2\/whoami\//, (route) =>
		route.fulfill({
			status: 403,
			json: { detail: 'Authentication credentials were not provided.' }
		})
	);
	await page.route(/\/api\/v2\/config\//, (route) =>
		route.fulfill({ json: { turnstile_site_key: '', contact_email: '' } })
	);

	await page.goto('/Dashboard/mapa-trayectorias/');
	await expect(page.locator('path.map-arc').first()).toHaveAttribute('stroke-width', /./);

	// SvelteKit's handleError logs the throw, so give the console a beat to flush.
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(250);

	expect(failures.filter((text) => text.includes('is not a function'))).toEqual([]);
});
