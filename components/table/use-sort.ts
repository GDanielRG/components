import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    buildPathPatch,
    getQueryValue,
    parseCurrentQuery,
    resolveCurrentSearch,
} from '@/components/search/query-utils';
import type { SearchNavigationController } from '@/components/search/use-search-navigation';

type SortOrder = 'asc' | 'desc';

interface UseSortReturn {
    sort: string | null;
    order: SortOrder | null;
    handleSort: (column: string, direction: SortOrder) => void;
}

interface UseSortOptions {
    sortPath?: string | string[];
    pageParam?: string;
    /**
     * The navigation controller this surface already owns — the page's
     * `useSearch(...)` return value, or a `useSearchNavigation(routeFn)` for a
     * nested table that has no search of its own. It must be that SAME
     * instance: only it knows about an in-flight `replace: true` filter visit,
     * so a second controller would rebuild the sort URL from the pre-filter
     * page url and silently drop the filter the user just picked.
     */
    navigation: SearchNavigationController;
}

export function useSort({
    sortPath = 'sort',
    pageParam = 'page',
    navigation,
}: UseSortOptions): UseSortReturn {
    const { url } = usePage();
    const currentData = useMemo(
        () => parseCurrentQuery(resolveCurrentSearch(url)),
        [url],
    );

    const sortValue = getQueryValue(currentData, sortPath);
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
