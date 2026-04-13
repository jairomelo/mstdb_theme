import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = { type: 'tag', values: ['wcag2a', 'wcag2aa'] };

const PAGES = [
	{ name: 'Landing', path: '/' },
	{ name: 'Search', path: '/Search/' },
	{ name: 'Dashboard', path: '/Dashboard/' },
	{ name: 'About', path: '/About/' },
	{ name: 'Archivos', path: '/Archivos/' },
	{ name: 'Login', path: '/User/login' },
];

for (const { name, path } of PAGES) {
	test(`${name} page — WCAG 2.1 AA (axe)`, async ({ page }) => {
		await page.goto(path);
		// Wait for main content to be visible
		await page.waitForLoadState('networkidle');

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa'])
			.analyze();

		const violations = results.violations;
		if (violations.length > 0) {
			const summary = violations
				.map(
					(v) =>
						`[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map((n) => n.target.join(', ')).join(' | ')}`,
				)
				.join('\n\n');
			expect(violations, `WCAG violations on ${name}:\n\n${summary}`).toHaveLength(0);
		}
	});
}
