// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Filters } from '@/components/search/filters';
import { SelectFilter } from '@/components/search/select-filter';
import type {
    ServerSearchFilter,
    ServerSearchRangeFilter,
} from '@/components/types/server-search';
import type { RouteDefinition } from '@/components/types/wayfinder';
import type { SearchNavigationController } from '@/components/search/use-search-navigation';

afterEach(cleanup);

const archivedFilter: ServerSearchFilter = {
    key: 'resource_status',
    label: 'Archivados',
    type: 'select',
    icon: 'archive',
    hideLabel: true,
    options: [
        { label: 'Solo archivados', value: 'archived' },
        { label: 'Todos', value: 'all' },
    ],
};

const plainSelectFilter: ServerSearchFilter = {
    key: 'estado',
    label: 'Estado',
    type: 'select',
    options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
    ],
};

function renderSelectFilter(
    filter: ServerSearchFilter,
    value: string | null = null,
) {
    return render(
        <SelectFilter
            filter={filter}
            value={value}
            open={false}
            onOpenChange={() => {}}
            onValueChange={() => {}}
        />,
    );
}

describe('SelectFilter trigger labels', () => {
    it('keeps a hidden filter label accessible', () => {
        renderSelectFilter(archivedFilter);

        const trigger = screen.getByTestId('filter-resource_status-trigger');
        expect(trigger).toHaveAccessibleName('Archivados');
        expect(screen.queryByText('Archivados')).toBeNull();
    });

    it('keeps the filter label accessible alongside the selected option', () => {
        renderSelectFilter(archivedFilter, 'archived');

        const trigger = screen.getByTestId('filter-resource_status-trigger');
        expect(trigger).toHaveAccessibleName('Archivados');
        expect(
            within(trigger).getByText('Solo archivados'),
        ).toBeInTheDocument();
    });

    it('renders the label of a plain select filter', () => {
        renderSelectFilter(plainSelectFilter);

        const trigger = screen.getByTestId('filter-estado-trigger');
        expect(trigger).toHaveAccessibleName('Estado');
        expect(within(trigger).getByText('Estado')).toBeInTheDocument();
    });
});

describe('Filters — nullable select defaults', () => {
    const navigation: SearchNavigationController = {
        only: [],
        buildRoute: (): RouteDefinition<'get'> => ({
            url: '/things',
            method: 'get',
        }),
        visit: vi.fn(),
    };

    function renderSelectedFilter(defaultValue: string | null) {
        render(
            <Filters
                filters={[
                    {
                        ...plainSelectFilter,
                        defaultValue,
                    },
                ]}
                filterValues={{ estado: ['active'] }}
                selectValues={{ estado: 'active' }}
                navigation={navigation}
            />,
        );
    }

    it('treats a serialized null as no default and keeps the clear action', () => {
        renderSelectedFilter(null);

        expect(screen.getByTestId('filter-estado-clear')).toBeInTheDocument();
    });

    it('omits the clear action when the select has an effective default', () => {
        renderSelectedFilter('active');

        expect(
            screen.queryByTestId('filter-estado-clear'),
        ).not.toBeInTheDocument();
    });
});

describe('Filters — mixed control order', () => {
    const navigation: SearchNavigationController = {
        only: [],
        buildRoute: (): RouteDefinition<'get'> => ({
            url: '/things',
            method: 'get',
        }),
        visit: vi.fn(),
    };
    const priceFilter: ServerSearchRangeFilter = {
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
    };

    it('keeps select and range controls in the server catalog order', () => {
        const { container } = render(
            <Filters
                filters={[plainSelectFilter, priceFilter, archivedFilter]}
                filterValues={{}}
                navigation={navigation}
            />,
        );

        expect(
            Array.from(
                container.querySelectorAll<HTMLElement>(
                    '[data-test$="-trigger"]',
                ),
                (trigger) => trigger.dataset.test,
            ),
        ).toEqual([
            'filter-estado-trigger',
            'filter-price-trigger',
            'filter-resource_status-trigger',
        ]);
    });
});
