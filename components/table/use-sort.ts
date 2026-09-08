import { buildPathPatch, getQueryValue } from '@/components/search/query-utils';
import type { SearchNavigationState } from '@/components/search/use-search-navigation';

type SortOrder = 'asc' | 'desc';

interface UseSortReturn {
    sort: string | null;
    order: SortOrder | null;
    handleSort: (column: string, direction: SortOrder) => void;
}

interface UseSortOptions {
    sortPath?: string | string[];
    // Must be the surface's controller so sorting sees any in-flight filter URL.
    navigation: SearchNavigationState;
}

export function useSort({
    sortPath = 'sort',
    navigation,
}: UseSortOptions): UseSortReturn {
    const sortValue = getQueryValue(navigation.effectiveQuery, sortPath);
    const sort = sortValue?.startsWith('-') ? sortValue.slice(1) : sortValue;
    const order = sortValue
        ? sortValue.startsWith('-')
            ? 'desc'
            : 'asc'
        : null;

    function handleSort(column: string, direction: SortOrder) {
        navigation.visit(
            buildPathPatch(
                sortPath,
                sort === column && order === direction
                    ? null
                    : direction === 'desc'
                      ? `-${column}`
                      : column,
            ),
        );
    }

    return { sort, order, handleSort };
}
