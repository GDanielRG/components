// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExportDialog } from '@/components/export-dialog';
import type { UseSearchReturn } from '@/components/search/search';
import type { RouteDefinition } from '@/components/types/wayfinder';
import type { ServerSearchFilter } from '@/components/types/server-search';

const { transforms } = vi.hoisted(() => ({
    transforms: [] as Array<() => unknown>,
}));

vi.mock('@inertiajs/react', () => ({
    Form: ({
        children,
        transform,
    }: {
        children: (state: { processing: boolean }) => ReactNode;
        transform: () => unknown;
    }) => {
        transforms.push(transform);

        return <form>{children({ processing: false })}</form>;
    },
    Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

afterEach(() => {
    cleanup();
    transforms.length = 0;
});

function makeSearch(): UseSearchReturn {
    const route: RouteDefinition<'get'> = {
        url: '/things',
        method: 'get',
    };
    const filters = [
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            defaultValue: 'pending',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
            ],
        },
        {
            key: 'category',
            label: 'Category',
            options: [{ label: 'Priority', value: 'priority' }],
        },
    ];
    const navigation = {
        only: ['things'],
        buildRoute: () => route,
        visit: vi.fn(),
    };

    return {
        ...navigation,
        effectiveQuery: {},
        filters,
        initialSearch: '',
        filterValues: { category: ['priority'] },
        selectValues: { status: 'pending' },
        rangeValues: {},
        hasActiveFilters: true,
        filterPopoverState: {
            openFilterKey: null,
            setOpenFilterKey: vi.fn(),
        },
        appliedFilters: {
            filters,
            filterValues: { category: ['priority'] },
            selectValues: { status: 'pending' },
            rangeValues: {},
            navigation,
            searchValue: '',
            clearAllPatch: {},
        },
    };
}

describe('ExportDialog — effective search scope', () => {
    it('displays and submits omitted select defaults with the correct scalar shape', () => {
        render(
            <ExportDialog
                exportAction={() => ({ url: '/exports', method: 'post' })}
                search={makeSearch()}
                open
                showTrigger={false}
            />,
        );

        expect(
            screen.getByTestId('export-filter-status-trigger'),
        ).toHaveTextContent('Pending');
        expect(transforms).toHaveLength(1);
        expect(transforms[0]()).toEqual({
            filter: {
                status: 'pending',
                category: ['priority'],
            },
        });
    });

    it.each([
        ['both bounds', '2026-09-01', '2026-09-07'],
        ['lower bound only', '2026-09-01', null],
        ['upper bound only', null, '2026-09-07'],
        ['no bounds', null, null],
    ])('submits named range keys for %s', (_label, from, to) => {
        const search = makeSearch();
        const range: ServerSearchFilter = {
            key: 'period',
            label: 'Period',
            type: 'range',
            fromKey: 'date_from',
            toKey: 'date_to',
            fromLabel: 'From',
            toLabel: 'To',
            inputType: 'date',
            applyLabel: 'Apply',
            clearLabel: 'Clear',
        };
        search.appliedFilters.filters = [range];
        search.appliedFilters.filterValues = {
            period: [from, to].filter(
                (value): value is string => value !== null,
            ),
        };
        search.appliedFilters.rangeValues = { period: { from, to } };

        render(
            <ExportDialog
                exportAction={() => ({ url: '/exports', method: 'post' })}
                search={search}
                open
                showTrigger={false}
            />,
        );

        const expected = {
            ...(from ? { date_from: from } : {}),
            ...(to ? { date_to: to } : {}),
        };
        expect(transforms[0]()).toEqual(
            Object.keys(expected).length ? { filter: expected } : {},
        );
    });

    it('keeps top-level controls out of nested filters, including range bounds and defaults', () => {
        const search = makeSearch();
        search.appliedFilters.filters = [
            ...search.filters,
            {
                key: 'resource_status',
                label: 'Resources',
                type: 'select',
                scope: 'query',
                defaultValue: 'active',
                options: [],
            },
            { key: 'owners', label: 'Owners', scope: 'query', options: [] },
            {
                key: 'amount',
                label: 'Amount',
                type: 'range',
                scope: 'query',
                fromKey: 'minimum',
                toKey: 'maximum',
                fromLabel: 'Minimum',
                toLabel: 'Maximum',
                inputType: 'number',
                applyLabel: 'Apply',
                clearLabel: 'Clear',
            },
        ];
        search.appliedFilters.filterValues = {
            ...search.filterValues,
            owners: ['7', '9'],
            amount: ['0'],
        };
        search.appliedFilters.rangeValues = { amount: { from: null, to: '0' } };
        search.appliedFilters.searchValue = 'María';

        render(
            <ExportDialog
                exportAction={() => ({ url: '/exports', method: 'post' })}
                search={search}
                open
                showTrigger={false}
            />,
        );

        expect(transforms[0]()).toEqual({
            resource_status: 'active',
            owners: ['7', '9'],
            maximum: '0',
            filter: {
                search: 'María',
                status: 'pending',
                category: ['priority'],
            },
        });
    });
});
