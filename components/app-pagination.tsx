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

interface AppPaginationProps<T> {
    paginatedData: PaginatedData<T>;
}

export function AppPagination<T>({ paginatedData }: AppPaginationProps<T>) {
    const { paginationNextLabel, paginationPreviousLabel } =
        useSharedComponentCopy();

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
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
                        disabled={!paginatedData.next_page_url}
                        href={paginatedData.next_page_url ?? '#'}
                        text={paginationNextLabel}
                    ></PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
