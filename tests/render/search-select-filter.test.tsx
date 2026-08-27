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

describe('SelectFilter archive trigger', () => {
    it('renders the archive icon and no visible label, keeping the label as aria-label', () => {
        renderSelectFilter(archivedFilter);

        const trigger = screen.getByTestId('filter-resource_status-trigger');
        expect(trigger).toHaveAttribute('aria-label', 'Archivados');
        expect(screen.queryByText('Archivados')).toBeNull();
        expect(trigger.querySelector('svg.lucide-archive')).not.toBeNull();
        expect(trigger.querySelector('svg.lucide-funnel-plus')).toBeNull();
    });

    it('keeps the archive icon visible once an option is selected and shows the option badge', () => {
        renderSelectFilter(archivedFilter, 'archived');

        const trigger = screen.getByTestId('filter-resource_status-trigger');
        expect(trigger.querySelector('svg.lucide-archive')).not.toBeNull();
        expect(trigger).toHaveAttribute('aria-label', 'Archivados');
        expect(
            within(trigger).getByText('Solo archivados'),
        ).toBeInTheDocument();
    });

    it('leaves a plain select filter with the FunnelPlus icon and a visible label', () => {
        renderSelectFilter(plainSelectFilter);

        const trigger = screen.getByTestId('filter-estado-trigger');
        expect(trigger).not.toHaveAttribute('aria-label');
        expect(within(trigger).getByText('Estado')).toBeInTheDocument();
        expect(trigger.querySelector('svg.lucide-funnel-plus')).not.toBeNull();
        expect(trigger.querySelector('svg.lucide-archive')).toBeNull();
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
