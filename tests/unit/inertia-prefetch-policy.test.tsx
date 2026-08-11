// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppPagination } from '@/components/app-pagination';
import { EditHistoryPopover } from '@/components/edit-history';
import { DEFAULT_PREFETCH_CACHE_FOR } from '@/components/inertia-prefetch-policy';

vi.mock('@inertiajs/react', () => ({
    Link: ({
        as,
        cacheFor,
        cacheTags,
        children,
        href,
        prefetch,
        ...props
    }: {
        as?: string;
        cacheFor?: string | [string, string];
        cacheTags?: string | string[];
        children?: ReactNode;
        href?: string;
        prefetch?: boolean;
    }) => {
        const sharedProps = {
            ...props,
            'data-cache-for':
                cacheFor === undefined ? undefined : JSON.stringify(cacheFor),
            'data-cache-tags':
                cacheTags === undefined ? undefined : JSON.stringify(cacheTags),
            'data-prefetch': prefetch === undefined ? undefined : `${prefetch}`,
        };

        return as === 'button' ? (
            <button {...sharedProps} data-href={href}>
                {children}
            </button>
        ) : (
            <a {...sharedProps} href={href}>
                {children}
            </a>
        );
    },
}));

afterEach(cleanup);

describe('Inertia prefetch policy', () => {
    it('keeps a stale-while-revalidate window', () => {
        expect(DEFAULT_PREFETCH_CACHE_FOR).toEqual(['30s', '5m']);
    });

    it('passes the shared default to enabled pagination links only', () => {
        render(
            <AppPagination
                paginatedData={{
                    data: [],
                    prev_page_url: null,
                    next_page_url: '/records?page=2',
                    links: [
                        { label: 'Previous', url: null, active: false },
                        { label: '1', url: '/records?page=1', active: true },
                        {
                            label: '2',
                            url: '/records?page=2',
                            active: false,
                        },
                        {
                            label: 'Next',
                            url: '/records?page=2',
                            active: false,
                        },
                    ],
                    total: 20,
                    from: 1,
                    to: 10,
                    summary: 'Showing 1 to 10 of 20 results',
                }}
                prefetch
                cacheTags="records"
            />,
        );

        const next = screen.getByRole('button', {
            name: 'paginationNextLabel',
        });
        expect(next).toHaveAttribute(
            'data-cache-for',
            JSON.stringify(DEFAULT_PREFETCH_CACHE_FOR),
        );
        expect(next).toHaveAttribute('data-cache-tags', '"records"');
        expect(next).toHaveAttribute('data-prefetch', 'true');

        const previous = screen.getByRole('button', {
            name: 'paginationPreviousLabel',
        });
        expect(previous).not.toHaveAttribute('data-cache-for');
        expect(previous).not.toHaveAttribute('data-prefetch');
    });

    it('passes the shared default to viewable edit-history causer links', () => {
        render(
            <EditHistoryPopover
                history={[
                    {
                        id: 1,
                        formatted_at: 'August 10, 2026',
                        causer: {
                            id: 42,
                            name: 'Ada Lovelace',
                            initials: 'AL',
                            action: 'updated',
                        },
                        changes: [],
                    },
                ]}
                employeeHref={(id) => `/employees/${id}`}
                employeeCacheTags={['employees', 'employee:42']}
            />,
        );

        const link = screen.getByRole('link', { name: 'Ada' });
        expect(link).toHaveAttribute(
            'data-cache-for',
            JSON.stringify(DEFAULT_PREFETCH_CACHE_FOR),
        );
        expect(link).toHaveAttribute(
            'data-cache-tags',
            JSON.stringify(['employees', 'employee:42']),
        );
        expect(link).toHaveAttribute('data-prefetch', 'true');
    });
});
