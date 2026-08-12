// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchFilterControls, useSearch } from '@/components/search/search';
import type { SearchNavigationData } from '@/components/search/query-utils';
import { useSearchNavigation } from '@/components/search/use-search-navigation';
import type { ServerSearchChoiceFilter } from '@/components/types/server-search';
import type {
    RouteDefinition,
    RouteResolver,
} from '@/components/types/wayfinder';

const { page, visits } = vi.hoisted(() => ({
    page: { url: '/things' },
    visits: [] as string[],
}));

vi.mock('@inertiajs/react', async (importOriginal) => {
    const original = await importOriginal<typeof import('@inertiajs/react')>();

    return {
        ...original,
        usePage: () => page,
        router: {
            ...original.router,
            visit: (route: RouteDefinition<'get'>) => {
                visits.push(route.url);
            },
        },
    };
});

vi.mock('@/hooks/use-shared-component-copy', () => ({
    useSharedComponentCopy: () => ({
        searchClearFilter: 'Clear filter',
        searchNoResults: 'No results',
        searchSelectedCount: (count: number) => `${count} selected`,
    }),
}));

const statusFilter: ServerSearchChoiceFilter = {
    key: 'status',
    label: 'Status',
    options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
    ],
};

function serializeQuery(query: SearchNavigationData, prefix = ''): string[] {
    return Object.entries(query).flatMap(([key, value]) => {
        const name = prefix === '' ? key : `${prefix}[${key}]`;

        if (Array.isArray(value)) {
            return value.map(
                (entry) =>
                    `${encodeURIComponent(`${name}[]`)}=${encodeURIComponent(entry)}`,
            );
        }

        if (typeof value === 'object') {
            return serializeQuery(value, name);
        }

        return [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    });
}

const thingsRoute: RouteResolver<'get'> = (
    options = {},
): RouteDefinition<'get'> => {
    const query = options.query ?? {};
    const search = serializeQuery(query as SearchNavigationData).join('&');

    return {
        url: `/things${search === '' ? '' : `?${search}`}`,
        method: 'get',
    };
};

function SearchHarness() {
    const search = useSearch(thingsRoute, {
        filters: [statusFilter],
        only: ['things'],
    });

    return (
        <>
            <SearchFilterControls search={search} />
            <output data-test="selected-values">
                {(search.filterValues.status ?? []).join(',')}
            </output>
        </>
    );
}

function SameTickVisitHarness() {
    const navigation = useSearchNavigation(thingsRoute, {
        only: ['things'],
    });

    return (
        <button
            type="button"
            data-test="compose-visits"
            onClick={() => {
                navigation.visit({ filter: { search: null } });
                navigation.visit({ filter: { status: ['active'] } });
            }}
        />
    );
}

beforeEach(() => {
    page.url = '/things';
    visits.length = 0;
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('useSearch pending filter query', () => {
    it('keeps rapid selections from one multiselect in its URL and controlled state', () => {
        render(<SearchHarness />);

        fireEvent.click(screen.getByTestId('filter-status-trigger'));
        fireEvent.click(screen.getByTestId('filter-status-option-active'));

        expect(screen.getByTestId('selected-values')).toHaveTextContent(
            'active',
        );

        fireEvent.click(screen.getByTestId('filter-status-option-pending'));

        expect(visits).toEqual([
            '/things?filter%5Bstatus%5D%5B%5D=active',
            '/things?filter%5Bstatus%5D%5B%5D=active&filter%5Bstatus%5D%5B%5D=pending',
        ]);
        expect(screen.getByTestId('selected-values')).toHaveTextContent(
            'active,pending',
        );

        expect(
            screen.getByTestId('filter-status-option-active'),
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByTestId('filter-status-option-pending'),
        ).toHaveAttribute('aria-pressed', 'true');
    });

    it('composes visits issued in the same event from the latest pending query', () => {
        page.url = '/things?filter[search]=voyage&filter[status][]=pending';
        render(<SameTickVisitHarness />);

        fireEvent.click(screen.getByTestId('compose-visits'));

        expect(visits).toEqual([
            '/things?filter%5Bstatus%5D%5B%5D=pending',
            '/things?filter%5Bstatus%5D%5B%5D=active',
        ]);
    });
});
