import { describe, expect, it } from 'vitest';
import { columnsConfig, filtersDefinition } from './columns.js';
import es from '../../messages/es.json';
import en from '../../messages/en.json';

const locales = { es, en };

function helpKeysOf(messages) {
	return Object.keys(messages).filter((key) => key.startsWith('help_'));
}

describe('Search help copy', () => {
	it('gives every column and filter a non-empty helpKey', () => {
		for (const [entityType, columns] of Object.entries(columnsConfig)) {
			for (const column of columns) {
				expect(column.helpKey, `${entityType}.${column.key}`).toMatch(/^help_/);
			}
		}
		for (const [entityType, filters] of Object.entries(filtersDefinition)) {
			for (const filter of filters) {
				expect(filter.helpKey, `${entityType}.${filter.key}`).toMatch(/^help_/);
			}
		}
	});

	it('resolves every referenced helpKey in both locales', () => {
		const referenced = new Set();
		for (const columns of Object.values(columnsConfig)) {
			for (const column of columns) referenced.add(column.helpKey);
		}
		for (const filters of Object.values(filtersDefinition)) {
			for (const filter of filters) referenced.add(filter.helpKey);
		}

		for (const [locale, messages] of Object.entries(locales)) {
			for (const key of referenced) {
				expect(messages[key], `${locale}:${key}`).toBeTypeOf('string');
				expect(messages[key].trim(), `${locale}:${key}`).not.toBe('');
			}
		}
	});

	it('keeps the help_* key set identical across locales', () => {
		expect(helpKeysOf(en).sort()).toEqual(helpKeysOf(es).sort());
	});
});
