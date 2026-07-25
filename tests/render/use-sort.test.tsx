// @vitest-environment jsdom
//
// Regression gate for the filter-loss race. `useSort` used to rebuild its query
// from `usePage().url` and call `router.visit` itself. A user who clicked a
// filter chip (a non-blocking `replace: true` visit) and then a sort header
// before that visit returned got a sort URL rebuilt from the PRE-FILTER url,
// which superseded the filter visit and silently dropped the selection.
//
// `useSort` now writes through the SAME `useSearchNavigation` controller the
// page's search already owns — the one that reports the pending query until the
// url catches up. Sharing the instance is the whole fix: a second controller
// created inside `useSort` would not see search's in-flight visit.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SearchNavigationData } from '@/components/search/query-utils';
import { useSearchNavigation } from '@/components/search/use-search-navigation';
import { useSort } from '@/components/table/use-sort';
import type {
    RouteDefinition,
    RouteQueryOptions,
    RouteResolver,
} from '@/components/types/wayfinder';

const { page, visitedUrls } = vi.hoisted(() => ({
    page: { url: '/things' },
    visitedUrls: [] as string[],
}));

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({ url: page.url }),
    router: {
        // A visit that never finishes: `onFinish` is deliberately never called
        // and `page.url` is left alone, which is exactly the window the race
        // lives in — the request is in flight and the url has not caught up.
        visit: (url: string) => {
            visitedUrls.push(url);
        },
    },
}));

function serializeQuery(query: SearchNavigationData, prefix = ''): string[] {
    return Object.entries(query).flatMap(([key, value]) => {
        const name = prefix === '' ? key : `${prefix}[${key}]`;

        if (Array.isArray(value)) {
            return value.map((entry) => `${name}[]=${entry}`);
        }

        if (typeof value === 'object') {
            return serializeQuery(value, name);
        }

        return [`${name}=${value}`];
    });
}

function thingsUrl(options?: RouteQueryOptions): string {
    const parts = serializeQuery(
        (options?.query ?? {}) as SearchNavigationData,
    );

    return parts.length > 0 ? `/things?${parts.join('&')}` : '/things';
}

const thingsRoute: RouteResolver<'get'> = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: thingsUrl(options),
    method: 'get',
});

function IndexHarness() {
    const navigation = useSearchNavigation(thingsRoute);
    const { handleSort } = useSort({ navigation });

    return (
        <>
            <button
                type="button"
                data-test="apply-filter"
                onClick={() =>
                    navigation.visit({ filter: { status: 'active' } })
                }
            />
            <button
                type="button"
                data-test="sort-name-asc"
                onClick={() => handleSort('name', 'asc')}
            />
        </>
    );
}

function NestedTableHarness() {
    const navigation = useSearchNavigation(thingsRoute);
    const { sort, order, handleSort } = useSort({
        sortPath: ['members', 'sort'],
        pageParam: 'members_page',
        navigation,
    });

    return (
        <>
            <output data-test="sort-state">{`${sort ?? ''}:${order ?? ''}`}</output>
            <button
                type="button"
                data-test="sort-name-asc"
                onClick={() => handleSort('name', 'asc')}
            />
            <button
                type="button"
                data-test="sort-name-desc"
                onClick={() => handleSort('name', 'desc')}
            />
        </>
    );
}

beforeEach(() => {
    page.url = '/things';
    visitedUrls.length = 0;
});

afterEach(cleanup);

describe('useSort — shared navigation controller', () => {
    it('keeps an in-flight filter when a sort is issued before the filter visit returns', () => {
        render(<IndexHarness />);

        fireEvent.click(screen.getByTestId('apply-filter'));

        expect(visitedUrls).toEqual(['/things?filter[status]=active']);

        // The filter visit has not returned: `usePage().url` is still
        // pre-filter. Sorting now must build on the PENDING query.
        fireEvent.click(screen.getByTestId('sort-name-asc'));

        expect(visitedUrls).toHaveLength(2);
        expect(visitedUrls[1]).toBe('/things?filter[status]=active&sort=name');
    });

    it('builds from the page url when no visit is pending', () => {
        page.url = '/things?filter[status]=active';
        render(<IndexHarness />);

        fireEvent.click(screen.getByTestId('sort-name-asc'));

        expect(visitedUrls).toEqual([
            '/things?filter[status]=active&sort=name',
        ]);
    });
});

describe('useSort — sortPath and pageParam', () => {
    it('reads and writes the nested sort key and drops its own page param', () => {
        page.url = '/things?members[sort]=name&members_page=3';
        render(<NestedTableHarness />);

        expect(screen.getByTestId('sort-state')).toHaveTextContent('name:asc');

        fireEvent.click(screen.getByTestId('sort-name-desc'));

        expect(visitedUrls).toEqual(['/things?members[sort]=-name']);
    });

    it('clears the nested sort key when the active direction is re-selected', () => {
        page.url = '/things?members[sort]=name&members_page=3';
        render(<NestedTableHarness />);

        fireEvent.click(screen.getByTestId('sort-name-asc'));

        expect(visitedUrls).toEqual(['/things']);
    });
});
