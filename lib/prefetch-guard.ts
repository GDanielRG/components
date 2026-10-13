import { router } from '@inertiajs/react';

function visitKey(url: URL): string {
    return url.origin + url.pathname + url.search;
}

/**
 * Cancels hover prefetches for a URL that a visit is already loading.
 *
 * A hover that reaches a link while its visit is still loading prefetches
 * while the old URL is still current, so Inertia's own same-URL guard lets it
 * through. Once its response lands it is applied to the now-current page and
 * the page remounts, discarding whatever the user changed in between (an
 * opened tab, a dialog, a draft).
 */
export function suppressPrefetchesDuringVisits(): VoidFunction {
    const loading = new Map<string, number>();
    // Inertia clears a prefetch's `prefetch` flag once its response is
    // processed, before `finish` fires, so the flag cannot tell a finished
    // prefetch from a finished visit. Track the visit objects registered at
    // `start` instead; Inertia passes the same object to both events.
    const tracked = new WeakSet<object>();

    const stopBefore = router.on('before', (event) => {
        const visit = event.detail.visit;

        if (visit.prefetch && loading.has(visitKey(visit.url))) {
            return false;
        }

        return undefined;
    });

    const stopStart = router.on('start', (event) => {
        const visit = event.detail.visit;

        if (visit.prefetch) {
            return;
        }

        tracked.add(visit);
        const key = visitKey(visit.url);
        loading.set(key, (loading.get(key) ?? 0) + 1);
    });

    const stopFinish = router.on('finish', (event) => {
        const visit = event.detail.visit;

        if (!tracked.has(visit)) {
            return;
        }

        tracked.delete(visit);
        const key = visitKey(visit.url);
        const remaining = (loading.get(key) ?? 1) - 1;

        if (remaining <= 0) {
            loading.delete(key);
        } else {
            loading.set(key, remaining);
        }
    });

    return () => {
        stopBefore();
        stopStart();
        stopFinish();
    };
}
