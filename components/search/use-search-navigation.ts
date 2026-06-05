import type { VisitHelperOptions } from '@inertiajs/core';
import { router, usePage } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import {
    buildQueryDataFromCurrent,
    parseCurrentQuery,
    resolveCurrentSearch,
} from '@/components/search/query-utils';
import type {
    SearchNavigationData,
    SearchNavigationPatch,
} from '@/components/search/query-utils';
import type { RouteDefinition, RouteFn } from '@/types/wayfinder';

export type SearchVisitOptions = VisitHelperOptions;

export interface SearchNavigationController {
    buildRoute: (patch: SearchNavigationPatch) => RouteDefinition<'get'>;
    visit: (patch: SearchNavigationPatch, options?: SearchVisitOptions) => void;
}

interface PendingVisit {
    id: number;
    query: SearchNavigationData;
    url: string;
}

const defaultVisitOptions = {
    preserveState: true,
    preserveScroll: true,
    replace: true,
} satisfies SearchVisitOptions;

function toPageUrl(url: string): URL {
    return new URL(url, 'http://localhost');
}

function resolveBaseQuery(
    currentUrl: string,
    currentQuery: SearchNavigationData,
    pendingVisit: PendingVisit | null,
): SearchNavigationData {
    if (pendingVisit === null) {
        return currentQuery;
    }

    const currentPage = toPageUrl(currentUrl);
    const pendingPage = toPageUrl(pendingVisit.url);
    const isSamePage = currentPage.pathname === pendingPage.pathname;
    const hasCaughtUp = currentPage.search === pendingPage.search;

    return isSamePage && !hasCaughtUp ? pendingVisit.query : currentQuery;
}

export function useSearchNavigation(
    routeFn: RouteFn,
): SearchNavigationController {
    const { url } = usePage();
    const currentQuery = useMemo(
        () => parseCurrentQuery(resolveCurrentSearch(url)),
        [url],
    );
    const [pendingVisit, setPendingVisit] = useState<PendingVisit | null>(null);
    const nextVisitId = useRef(0);
    const baseQuery = useMemo(
        () => resolveBaseQuery(url, currentQuery, pendingVisit),
        [currentQuery, pendingVisit, url],
    );

    function buildNextQuery(
        patch: SearchNavigationPatch,
    ): SearchNavigationData {
        return buildQueryDataFromCurrent(baseQuery, patch);
    }

    function buildRoute(patch: SearchNavigationPatch): RouteDefinition<'get'> {
        return routeFn({
            query: buildNextQuery(patch),
        });
    }

    function visit(
        patch: SearchNavigationPatch,
        options: SearchVisitOptions = {},
    ): void {
        const nextQuery = buildNextQuery(patch);
        const nextRoute = routeFn({ query: nextQuery });
        const visitId = ++nextVisitId.current;
        const { onFinish, ...visitOptions } = options;

        setPendingVisit({
            id: visitId,
            query: nextQuery,
            url: nextRoute.url,
        });

        router.visit(nextRoute.url, {
            method: nextRoute.method,
            ...defaultVisitOptions,
            ...visitOptions,
            onFinish: (visit) => {
                setPendingVisit((currentPendingVisit) =>
                    currentPendingVisit?.id === visitId
                        ? null
                        : currentPendingVisit,
                );

                onFinish?.(visit);
            },
        });
    }

    return { buildRoute, visit };
}
