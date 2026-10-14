import type { LinkComponentBaseProps } from '@inertiajs/core';
import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import type { PaginatedData } from '@/components/types/paginated-data';
import type { RouteDefinition } from '@/components/types/wayfinder';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useSharedComponentCopy } from '@/hooks/use-shared-component-copy';

type PaginationPrefetchProps = Pick<
    ComponentProps<typeof Link>,
    'prefetch' | 'cacheTags'
>;

type PaginationVisitOptions = Omit<
    LinkComponentBaseProps,
    'href' | 'method' | 'data' | 'prefetch' | 'cacheFor' | 'cacheTags'
>;

interface AppPaginationProps<T> extends PaginationPrefetchProps {
    paginatedData: PaginatedData<T>;
    /** Native `<Link>` visit options for the exact page route each link visits. */
    visitOptions?: (route: RouteDefinition<'get'>) => PaginationVisitOptions;
}

export function AppPagination<T>({
    paginatedData,
    prefetch,
    cacheTags,
    visitOptions,
}: AppPaginationProps<T>) {
    const { paginationNextLabel, paginationPreviousLabel } =
        useSharedComponentCopy();

    function linkProps(
        url: string | null,
    ): PaginationVisitOptions & PaginationPrefetchProps {
        if (!url) {
            return {};
        }

        return {
            ...visitOptions?.({ url, method: 'get' }),
            prefetch,
            cacheTags,
        };
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        {...linkProps(paginatedData.prev_page_url)}
                        disabled={!paginatedData.prev_page_url}
                        href={paginatedData.prev_page_url ?? '#'}
                        text={paginationPreviousLabel}
                    ></PaginationPrevious>
                </PaginationItem>
                {paginatedData.links.slice(1, -1).map((link, index) => (
                    <PaginationItem className="max-lg:hidden" key={index}>
                        {link.label === '...' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                {...linkProps(link.url)}
                                href={link.url ?? '#'}
                                isActive={link.active}
                            >
                                {link.label}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        {...linkProps(paginatedData.next_page_url)}
                        disabled={!paginatedData.next_page_url}
                        href={paginatedData.next_page_url ?? '#'}
                        text={paginationNextLabel}
                    ></PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
