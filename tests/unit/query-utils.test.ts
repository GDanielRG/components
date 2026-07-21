import { describe, expect, it } from 'vitest';
import {
    buildClearAllPatch,
    buildPathPatch,
    clearedFilterValues,
    getQueryValue,
    getQueryValues,
    parseCurrentQuery,
    resolveCurrentSearch,
    splitPageUrl,
} from '../../components/search/query-utils';

describe('parseCurrentQuery', () => {
    it('parses scalar params', () => {
        expect(parseCurrentQuery('sort=-name')).toEqual({ sort: '-name' });
    });

    it('parses nested scalar filters', () => {
        expect(parseCurrentQuery('filter[search]=foo')).toEqual({
            filter: { search: 'foo' },
        });
    });

    it('treats empty-bracket and numeric-index notation identically as arrays', () => {
        const empty = parseCurrentQuery('filter[role][]=1&filter[role][]=2');
        const indexed = parseCurrentQuery(
            'filter[role][0]=1&filter[role][1]=2',
        );

        expect(empty).toEqual({ filter: { role: ['1', '2'] } });
        expect(indexed).toEqual(empty);
    });

    it('dedupes repeated array values', () => {
        expect(parseCurrentQuery('filter[role][]=1&filter[role][]=1')).toEqual({
            filter: { role: ['1'] },
        });
    });

    it('drops empty values', () => {
        expect(parseCurrentQuery('filter[search]=')).toEqual({});
    });
});

describe('getQueryValue / getQueryValues', () => {
    const data = parseCurrentQuery(
        'sort=-name&filter[role][]=1&filter[role][]=2',
    );

    it('reads a scalar by dot path', () => {
        expect(getQueryValue(data, 'sort')).toBe('-name');
        expect(getQueryValue(data, 'missing')).toBeNull();
    });

    it('returns the first element for an array value', () => {
        expect(getQueryValue(data, 'filter.role')).toBe('1');
    });

    it('reads array values', () => {
        expect(getQueryValues(data, ['filter', 'role'])).toEqual(['1', '2']);
        expect(getQueryValues(data, 'sort')).toEqual(['-name']);
        expect(getQueryValues(data, 'missing')).toEqual([]);
    });
});

describe('buildPathPatch', () => {
    it('builds a single-segment patch', () => {
        expect(buildPathPatch('sort', '-name')).toEqual({ sort: '-name' });
    });

    it('builds a nested patch from a dot path', () => {
        expect(buildPathPatch('filter.role', ['1'])).toEqual({
            filter: { role: ['1'] },
        });
    });

    it('returns empty for an empty path', () => {
        expect(buildPathPatch('', 'x')).toEqual({});
    });
});

describe('splitPageUrl / resolveCurrentSearch', () => {
    it('splits a url with a query', () => {
        expect(splitPageUrl('/employees?filter[search]=foo')).toEqual({
            basePath: '/employees',
            currentSearch: 'filter[search]=foo',
        });
    });

    it('handles a url with no query', () => {
        expect(splitPageUrl('/employees')).toEqual({
            basePath: '/employees',
            currentSearch: '',
        });
    });

    it('resolveCurrentSearch returns just the query', () => {
        expect(resolveCurrentSearch('/x?a=1')).toBe('a=1');
    });
});

describe('clearedFilterValues', () => {
    it('nulls a filter key', () => {
        expect(clearedFilterValues({ key: 'role' } as never)).toEqual({
            role: null,
        });
    });

    it('nulls both query keys for a paired range', () => {
        expect(
            clearedFilterValues({
                key: 'price',
                label: 'Price',
                type: 'range',
                fromKey: 'price_min',
                toKey: 'price_max',
                fromLabel: 'Minimum price',
                toLabel: 'Maximum price',
                inputType: 'number',
                applyLabel: 'Apply',
                clearLabel: 'Clear',
            }),
        ).toEqual({
            price_min: null,
            price_max: null,
        });
    });
});

describe('buildClearAllPatch', () => {
    it('clears filter-scoped ranges and top-level controls together', () => {
        expect(
            buildClearAllPatch([
                {
                    key: 'price',
                    label: 'Price',
                    type: 'range',
                    fromKey: 'price_min',
                    toKey: 'price_max',
                    fromLabel: 'Minimum price',
                    toLabel: 'Maximum price',
                    inputType: 'number',
                    applyLabel: 'Apply',
                    clearLabel: 'Clear',
                },
                {
                    key: 'sort',
                    label: 'Sort',
                    type: 'select',
                    scope: 'query',
                    options: [{ label: 'Recommended', value: 'recommended' }],
                },
            ]),
        ).toEqual({
            sort: null,
            filter: {
                search: null,
                price_min: null,
                price_max: null,
            },
        });
    });
});
