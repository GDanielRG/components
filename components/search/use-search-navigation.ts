import type { VisitHelperOptions } from '@inertiajs/core';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    buildQueryDataFromCurrent,
    parseCurrentQuery,
    resolveCurrentSearch,
} from '@/components/search/query-utils';
import type {
    SearchNavigationData,
    SearchNavigationPatch,
} from '@/components/search/query-utils';
import type {
    RouteDefinition,
    RouteResolver,
} from '@/components/types/wayfinder';

export type SearchVisitOptions = VisitHelperOptions;

export interface SearchNavigationOptions {
    /**
     * The page props a search, sort or pagination visit has to refresh — the
     * collection, its filter catalogue, and any counter rendered from the same
     * query. Everything else (the permission-derived sidebar, translation
     * catalogues, shared props) is left alone, so a keystroke no longer re-runs
     * the whole controller.
     *
     * Only the page knows its own prop names, so there is no default. Pass `[]`
     * to keep the full reload deliberately.
     */
    only: string[];
}

export interface SearchNavigationController extends SearchNavigationOptions {
    buildRoute: (patch: SearchNavigationPatch) => RouteDefinition<'get'>;
    visit: (patch: SearchNavigationPatch, options?: SearchVisitOptions) => void;
}

export interface SearchNavigationState extends SearchNavigationController {
    readonly effectiveQuery: SearchNavigationData;
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
    routeFn: RouteResolver<'get'>,
    { only }: SearchNavigationOptions,
): SearchNavigationState {
    const { url } = usePage();
    const currentQuery = useMemo(
        () => parseCurrentQuery(resolveCurrentSearch(url)),
        [url],
    );
    const [pendingVisit, setPendingVisit] = useState<PendingVisit | null>(null);
    // Synchronous mirror of `pendingVisit`: a visit issued before React
    // re-renders (rapid clear-then-filter clicks) must compose on the latest
    // pending query, not on the last rendered state. Every write goes through
    // `trackPendingVisit` so the ref and the state can never disagree.
    const pendingVisitRef = useRef<PendingVisit | null>(null);
    const nextVisitId = useRef(0);
    const baseQuery = useMemo(
        () => resolveBaseQuery(url, currentQuery, pendingVisit),
        [currentQuery, pendingVisit, url],
    );

    function trackPendingVisit(nextPendingVisit: PendingVisit | null): void {
        pendingVisitRef.current = nextPendingVisit;
        setPendingVisit(nextPendingVisit);
    }

    useEffect(() => {
        const currentPendingVisit = pendingVisitRef.current;

        if (currentPendingVisit === null) {
            return;
        }

        const currentPage = toPageUrl(url);
        const pendingPage = toPageUrl(currentPendingVisit.url);

        if (
            currentPage.pathname === pendingPage.pathname &&
            currentPage.search === pendingPage.search
        ) {
            trackPendingVisit(null);
        }
    }, [url]);

    function buildNextQuery(
        patch: SearchNavigationPatch,
    ): SearchNavigationData {
        return buildQueryDataFromCurrent(
            resolveBaseQuery(url, currentQuery, pendingVisitRef.current),
            patch,
        );
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

        trackPendingVisit({
            id: visitId,
            query: nextQuery,
            url: nextRoute.url,
        });

        // The whole route object goes through, not just its url: it carries the
        // real verb and the `component` Inertia needs to swap a cached page.
        router.visit(nextRoute, {
            only,
            ...defaultVisitOptions,
            ...visitOptions,
            onFinish: (visit) => {
                if (pendingVisitRef.current?.id === visitId) {
                    trackPendingVisit(null);
                }

                onFinish?.(visit);
            },
        });
    }

    return { only, effectiveQuery: baseQuery, buildRoute, visit };
}
