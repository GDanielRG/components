import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import type { PaginatedData } from '@/components/types/paginated-data';
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

interface AppPaginationProps<T> extends PaginationPrefetchProps {
    paginatedData: PaginatedData<T>;
}

/**
 * Page links prefetch only when the consumer asks for it with `prefetch`.
 *
 * Name the resource with `cacheTags` so the writing surface can drop those
 * entries with `invalidateCacheTags`. Cache duration follows Inertia's native
 * default.
 */
export function AppPagination<T>({
    paginatedData,
    prefetch,
    cacheTags,
}: AppPaginationProps<T>) {
    const { paginationNextLabel, paginationPreviousLabel } =
        useSharedComponentCopy();

    // A boundary link renders as `#`, which is not a page worth prefetching.
    function prefetchProps(url: string | null): PaginationPrefetchProps {
        return url ? { prefetch, cacheTags } : {};
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        {...prefetchProps(paginatedData.prev_page_url)}
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
                                {...prefetchProps(link.url)}
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
                        {...prefetchProps(paginatedData.next_page_url)}
                        disabled={!paginatedData.next_page_url}
                        href={paginatedData.next_page_url ?? '#'}
                        text={paginationNextLabel}
                    ></PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
