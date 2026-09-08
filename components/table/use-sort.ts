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
    pageParam?: string;
    // Must be the surface's controller so sorting sees any in-flight filter URL.
    navigation: SearchNavigationState;
}

export function useSort({
    sortPath = 'sort',
    pageParam = 'page',
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
        const patch =
            sort === column && order === direction
                ? {
                      ...buildPathPatch(sortPath, null),
                      [pageParam]: null,
                  }
                : {
                      ...buildPathPatch(
                          sortPath,
                          direction === 'desc' ? `-${column}` : column,
                      ),
                      [pageParam]: null,
                  };

        navigation.visit(patch);
    }

    return { sort, order, handleSort };
}
