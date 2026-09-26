import { describe, expect, it } from 'vitest';
import { buildSearchUrl, DEFAULT_PAGE_SIZE } from './searchUrl';

describe('buildSearchUrl', () => {
	it('returns bare /Search with no state', () => {
		expect(buildSearchUrl()).toBe('/Search/');
	});

	it('includes tab, view and filters', () => {
		expect(
			buildSearchUrl({
				tab: 'personaesclavizada',
				view: 'table',
				filters: { lugar_any: '12', fecha_documento__gte: '1805' }
			})
		).toBe('/Search/?tab=personaesclavizada&lugar_any=12&fecha_documento__gte=1805');
	});

	it('emits view only when not the default table view', () => {
		expect(buildSearchUrl({ tab: 'lugar', view: 'card' })).toBe('/Search/?tab=lugar&view=card');
		expect(buildSearchUrl({ tab: 'lugar', view: 'table' })).toBe('/Search/?tab=lugar');
	});

	it('quotes q for exact search', () => {
		expect(buildSearchUrl({ q: 'maria', exactSearch: true })).toBe('/Search/?q=%22maria%22');
		expect(buildSearchUrl({ q: 'maria', exactSearch: false })).toBe('/Search/?q=maria');
	});

	it('maps archivoId to the archivo_id param', () => {
		expect(buildSearchUrl({ archivoId: 3 })).toBe('/Search/?archivo_id=3');
		expect(buildSearchUrl({ archivoId: null })).toBe('/Search/');
	});

	it('omits page 1, default page size and empty ordering', () => {
		expect(
			buildSearchUrl({ tab: 'documento', page: 1, pageSize: DEFAULT_PAGE_SIZE, ordering: '' })
		).toBe('/Search/?tab=documento');
		expect(
			buildSearchUrl({ tab: 'documento', page: 3, pageSize: 90, ordering: '-fecha_inicial' })
		).toBe('/Search/?tab=documento&page=3&page_size=90&ordering=-fecha_inicial');
	});

	it('skips empty filter values', () => {
		expect(buildSearchUrl({ filters: { archivo: '', sexo: 'v', vacio: null } })).toBe(
			'/Search/?sexo=v'
		);
	});
});
