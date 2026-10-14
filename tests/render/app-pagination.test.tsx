// @vitest-environment jsdom
import { router } from '@inertiajs/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AppPagination } from '@/components/app-pagination';
import type { PaginatedData } from '@/components/types/paginated-data';
import type { RouteDefinition } from '@/components/types/wayfinder';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

const things: PaginatedData<never> = {
    data: [],
    prev_page_url: null,
    next_page_url: '/things?page=3',
    links: [
        { label: 'Previous', url: null, active: false },
        { label: '1', url: '/things?page=1', active: false },
        { label: '2', url: '/things?page=2', active: true },
        { label: '3', url: '/things?page=3', active: false },
        { label: 'Next', url: '/things?page=3', active: false },
    ],
    total: 30,
    from: 11,
    to: 20,
    summary: '',
};

it('binds each page link’s native visit options to the route it visits', () => {
    const visit = vi.spyOn(router, 'visit').mockImplementation(() => {});
    let failedRoute: RouteDefinition<'get'> | null = null;
    render(
        <AppPagination
            paginatedData={things}
            visitOptions={(route) => ({
                onNetworkError: () => {
                    failedRoute = route;

                    return false;
                },
            })}
        />,
    );

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(
        screen.getByRole('button', { name: 'paginationNextLabel' }),
    );

    expect(
        visit.mock.calls.map(([href, options]) => {
            options?.onNetworkError?.(new Error('offline'));

            return [href, failedRoute];
        }),
    ).toEqual([
        ['/things?page=1', { url: '/things?page=1', method: 'get' }],
        ['/things?page=3', { url: '/things?page=3', method: 'get' }],
    ]);
});
