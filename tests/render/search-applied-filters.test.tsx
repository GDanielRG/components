// @vitest-environment jsdom
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchAppliedFilters } from '@/components/search/search-applied-filters';
import type { SearchNavigationPatch } from '@/components/search/query-utils';
import type {
    SearchAppliedFiltersState,
    SearchFilterPopoverState,
} from '@/components/search/types';
import type { ServerSearchChoiceFilter } from '@/components/types/server-search';
import type { RouteDefinition } from '@/components/types/wayfinder';
import type {
    SearchNavigationController,
    SearchVisitOptions,
} from '@/components/search/use-search-navigation';

vi.mock('@/hooks/use-shared-component-copy', () => ({
    useSharedComponentCopy: () => ({
        actionsLabel: 'Actions',
        searchClearFilter: 'Clear filter',
        searchClearFilters: 'Clear filters',
        searchClearSearch: 'Clear search',
        searchClearing: 'Clearing',
        searchNoResults: 'No results',
        searchSelectedCount: (count: number) => `${count} selected`,
    }),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const statusFilter: ServerSearchChoiceFilter = {
    key: 'status',
    label: 'Status',
    options: [{ label: 'Active', value: 'active' }],
};

function buildHarness({
    searchValue = '',
    activeStatus = false,
}: {
    searchValue?: string;
    activeStatus?: boolean;
} = {}) {
    const visits: Array<{
        patch: SearchNavigationPatch;
        options: SearchVisitOptions;
    }> = [];
    const navigation: SearchNavigationController = {
        only: ['things'],
        buildRoute: (): RouteDefinition<'get'> => ({
            url: '/things?cleared=1',
            method: 'get',
        }),
        visit: (patch, options = {}) => visits.push({ patch, options }),
    };
    const appliedFilters: SearchAppliedFiltersState = {
        filters: activeStatus ? [statusFilter] : [],
        filterValues: activeStatus ? { status: ['active'] } : {},
        selectValues: {},
        rangeValues: {},
        navigation,
        searchValue,
        clearAllPatch: {
            filter: {
                search: null,
                status: null,
            },
        },
    };
    const popoverState: SearchFilterPopoverState = {
        openFilterKey: activeStatus ? 'status' : null,
        setOpenFilterKey: vi.fn(),
    };

    render(
        <SearchAppliedFilters
            appliedFilters={appliedFilters}
            popoverState={popoverState}
        />,
    );

    return { visits, popoverState };
}

describe('SearchAppliedFilters clear actions', () => {
    it('uses the injected navigation and reflects its loading lifecycle when clearing search', () => {
        const { visits } = buildHarness({ searchValue: 'voyage' });
        const action = screen.getByTestId('clear-search-action');

        expect(action).toHaveAttribute('href', '/things?cleared=1');
        expect(action).toHaveTextContent('Clear search');

        fireEvent.click(action);

        expect(visits).toHaveLength(1);
        expect(visits[0]?.patch).toEqual({
            filter: { search: null },
        });
        expect(action).toHaveTextContent('Clearing');

        act(() => visits[0]?.options.onFinish?.({} as never));

        expect(action).toHaveTextContent('Clear search');
    });

    it('closes the active filter and clears through the injected navigation', () => {
        const { visits, popoverState } = buildHarness({ activeStatus: true });

        fireEvent.click(screen.getByTestId('clear-filters-action'));

        expect(popoverState.setOpenFilterKey).toHaveBeenCalledWith(null);
        expect(visits).toHaveLength(1);
        expect(visits[0]?.patch).toEqual({
            filter: {
                search: null,
                status: null,
            },
        });
        expect(screen.getByTestId('clear-filters-action')).toHaveTextContent(
            'Clearing',
        );
    });

    it('leaves modified link clicks to the browser', () => {
        const { visits } = buildHarness({ searchValue: 'voyage' });

        // React handles the click before it bubbles to document. Prevent the
        // final jsdom navigation there without making `shouldIntercept` see an
        // already-prevented event.
        document.addEventListener('click', (event) => event.preventDefault(), {
            once: true,
        });

        fireEvent.click(screen.getByTestId('clear-search-action'), {
            metaKey: true,
        });

        expect(visits).toEqual([]);
        expect(screen.getByTestId('clear-search-action')).toHaveTextContent(
            'Clear search',
        );
    });
});
