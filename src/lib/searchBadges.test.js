import { describe, expect, it } from 'vitest';
import { tabBadge } from './searchBadges';

describe('tabBadge', () => {
	it('returns the count for the requested type', () => {
		expect(tabBadge({ personaesclavizada: 5510 }, 'personaesclavizada')).toBe(5510);
	});

	it('preserves a known zero instead of hiding it', () => {
		expect(tabBadge({ personaesclavizada: 0 }, 'personaesclavizada')).toBe(0);
	});

	it('returns empty string when the count is unknown', () => {
		expect(tabBadge({}, 'lugar')).toBe('');
		expect(tabBadge(undefined, 'lugar')).toBe('');
		expect(tabBadge({ lugar: null }, 'lugar')).toBe('');
	});

	it('does not leak counts across types', () => {
		const counts = { personaesclavizada: 12 };
		expect(tabBadge(counts, 'personaesclavizada')).toBe(12);
		expect(tabBadge(counts, 'documento')).toBe('');
	});
});
