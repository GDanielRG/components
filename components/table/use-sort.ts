import { router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    buildPathPatch,
    buildQueryDataFromCurrent,
    getQueryValue,
    parseCurrentQuery,
    resolveCurrentSearch,
} from '@/components/search/query-utils';
import type {
    RouteDefinition,
    RouteQueryOptions,
} from '@/components/types/wayfinder';

type SortOrder = 'asc' | 'desc';
type SortRouteResolver = (
    options?: RouteQueryOptions,
) => RouteDefinition<'get'>;

interface UseSortReturn {
    sort: string | null;
    order: SortOrder | null;
    handleSort: (column: string, direction: SortOrder) => void;
}

interface UseSortOptions {
    sortPath?: string | string[];
    pageParam?: string;
    routeFn: SortRouteResolver;
}

export function useSort({
    sortPath = 'sort',
    pageParam = 'page',
    routeFn,
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

        const query = buildQueryDataFromCurrent(currentData, patch);
        const destination = routeFn({ query });

        router.visit(destination.url, {
            method: destination.method,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    return { sort, order, handleSort };
}
