// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExportDialog } from '@/components/export-dialog';
import type { UseSearchReturn } from '@/components/search/search';
import type { RouteDefinition } from '@/components/types/wayfinder';

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
});
