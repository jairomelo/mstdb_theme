import { m } from '$lib/paraglide/messages.js';

export function ageUnitLabel(code) {
	const c = (code || 'a').toLowerCase();
	if (c === 'd') return m.conf_unit_dias();
	if (c === 'm') return m.conf_unit_meses();
	return m.conf_unit_anios();
}
