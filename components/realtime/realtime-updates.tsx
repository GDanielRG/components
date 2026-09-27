import type { CancelToken, Page, ReloadOptions } from '@inertiajs/core';
import { router, usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
import { useEffect, useRef } from 'react';
import { useRealtimeFeature } from '@/hooks/use-realtime-feature';
import type { RealtimeFeature, RealtimePlan } from '@/lib/realtime';

/** Collapse a burst of refresh signals into one owned read. */
const REFRESH_DEBOUNCE_MS = 250;

/**
 * A healthy subscription still misses changes whose broadcast was never published, so a
 * subscribed resource keeps reconciling, never more often than its fallback poll.
 */
const SUBSCRIBED_RECONCILE_INTERVAL_MS = 60_000;

export interface RealtimeUpdatesProps {
    feature: RealtimeFeature;
    /** A generated private channel name, without Echo's `private-` prefix. */
    channel: string;
    event: string;
    /** An empty allow-list reloads every prop. */
    only: string[];
    /** A refresh is safe: no draft or pending mutation could be replaced by an authoritative read. */
    enabled?: boolean;
    /** The surface showing the watched props is open; periodic reads stop while it is closed. */
    visible?: boolean;
    invalidateCacheTags?: string | string[];
    /** Serializes the watched props; cache tags are invalidated only when an owned read changes the result. */
    snapshot?: (props: Page['props']) => string;
}

type AutomaticTransport = Exclude<RealtimePlan['transport'], 'manual'>;

export function RealtimeUpdates({ feature, ...props }: RealtimeUpdatesProps) {
    const plan = useRealtimeFeature(feature);

    if (plan.transport === 'manual' || plan.pollIntervalMs === null) {
        return null;
    }

    return (
        <ResourceRefreshCoordinator
            key={props.channel}
            transport={plan.transport}
            pollIntervalMs={plan.pollIntervalMs}
            {...props}
        />
    );
}

interface ResourceRefreshCoordinatorProps extends Omit<
    RealtimeUpdatesProps,
    'feature'
> {
    transport: AutomaticTransport;
    pollIntervalMs: number;
}

function ResourceRefreshCoordinator({
    transport,
    pollIntervalMs,
    channel,
    event,
    only,
    enabled = true,
    visible = true,
    invalidateCacheTags,
    snapshot,
}: ResourceRefreshCoordinatorProps) {
    const page = usePage();
    const latest = useRef<ReadTarget & CoordinatorInputs>({
        only,
        invalidateCacheTags,
        snapshot,
        props: page.props,
        enabled,
        visible,
    });
    useEffect(() => {
        latest.current = {
            only,
            invalidateCacheTags,
            snapshot,
            props: page.props,
            enabled,
            visible,
        };
    });

    const coordinatorRef = useRef<RefreshCoordinator | null>(null);

    useEffect(() => {
        const coordinator = createRefreshCoordinator({
            transport,
            pollIntervalMs,
            channel,
            event,
            target: () => latest.current,
        });
        coordinatorRef.current = coordinator;
        coordinator.update(latest.current);

        return () => {
            coordinatorRef.current = null;
            coordinator.dispose();
        };
    }, [transport, pollIntervalMs, channel, event]);

    useEffect(() => {
        coordinatorRef.current?.update({ enabled, visible });
    }, [enabled, visible]);

    return null;
}

interface ReadTarget {
    only: string[];
    invalidateCacheTags?: string | string[];
    snapshot?: (props: Page['props']) => string;
    props: Page['props'];
}

interface CoordinatorInputs {
    enabled: boolean;
    visible: boolean;
}

interface RefreshCoordinator {
    update: (inputs: CoordinatorInputs) => void;
    dispose: () => void;
}

type Poll = ReturnType<typeof router.poll>;

interface RefreshCoordinatorOptions {
    transport: AutomaticTransport;
    pollIntervalMs: number;
    channel: string;
    event: string;
    target: () => ReadTarget;
}

/**
 * One refresh lifecycle per watched resource: owned reads are coalesced, never overlap, are
 * cancelled when a read becomes unsafe, and are replayed once it is safe again. Broadcast
 * events, subscription success, and return to visibility all funnel through the same signal.
 */
function createRefreshCoordinator({
    transport,
    pollIntervalMs,
    channel,
    event,
    target,
}: RefreshCoordinatorOptions): RefreshCoordinator {
    let disposed = false;
    let subscribed = false;
    let enabled = true;
    let visible = true;
    let tabVisible = document.visibilityState === 'visible';
    let inFlight: CancelToken | null = null;
    let pending = false;
    let debounce: ReturnType<typeof setTimeout> | null = null;
    let activePoll: Poll | null = null;

    const isEligible = (): boolean => tabVisible && enabled;

    const readOptions = (): ReloadOptions => {
        const { only, invalidateCacheTags, snapshot, props } = target();
        const before = snapshot?.(props);

        return {
            ...(only.length > 0 ? { only } : {}),
            onCancelToken: (token) => {
                inFlight = token;
            },
            onSuccess: (nextPage) => {
                if (disposed || invalidateCacheTags === undefined) {
                    return;
                }

                if (
                    snapshot === undefined ||
                    snapshot(nextPage.props) !== before
                ) {
                    router.flushByCacheTags(invalidateCacheTags);
                }
            },
            onFinish: () => {
                inFlight = null;

                if (!disposed && pending && isEligible()) {
                    pending = false;
                    schedule();
                }
            },
        };
    };

    const start = (): void => {
        if (disposed) {
            return;
        }

        if (!isEligible() || inFlight !== null) {
            pending = true;

            return;
        }

        router.reload(readOptions());
    };

    const schedule = (): void => {
        if (disposed || debounce !== null) {
            return;
        }

        debounce = setTimeout(() => {
            debounce = null;
            start();
        }, REFRESH_DEBOUNCE_MS);
    };

    const createPoll = (intervalMs: number): Poll => {
        const poll = router.poll(
            intervalMs,
            () => {
                if (isEligible() && inFlight === null && debounce === null) {
                    return readOptions();
                }

                // A skipped tick must not end rest mode.
                poll.start();

                return { onBefore: () => false };
            },
            { autoStart: false, keepAlive: true, mode: 'rest' },
        );

        return poll;
    };

    const fallbackPoll = createPoll(pollIntervalMs);
    const reconcilePoll = createPoll(
        Math.max(pollIntervalMs, SUBSCRIBED_RECONCILE_INTERVAL_MS),
    );

    const applyPolicy = (): void => {
        if (disposed) {
            return;
        }

        let nextPoll: Poll | null = null;

        if (tabVisible && enabled && visible) {
            nextPoll =
                transport === 'reverb' && subscribed
                    ? reconcilePoll
                    : fallbackPoll;
        }

        if (nextPoll !== activePoll) {
            activePoll?.stop();
            activePoll = nextPoll;
            activePoll?.start();
        }
    };

    const handleVisibilityChange = (): void => {
        tabVisible = document.visibilityState === 'visible';
        applyPolicy();

        if (tabVisible) {
            pending = false;
            schedule();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let leaveSubscription = (): void => {};

    if (transport === 'reverb') {
        const privateChannel = echo<'reverb'>().private(channel);

        privateChannel.listen(event, () => schedule());
        privateChannel.subscribed(() => {
            subscribed = true;
            applyPolicy();
            schedule();
        });
        privateChannel.error(() => {
            subscribed = false;
            applyPolicy();
        });

        const stopWatchingConnection =
            echo<'reverb'>().connector.onConnectionChange((status) => {
                if (status !== 'connected' && subscribed) {
                    subscribed = false;
                    applyPolicy();
                }
            });

        leaveSubscription = () => {
            stopWatchingConnection();
            echo().leaveChannel(`private-${channel}`);
        };
    }

    return {
        update: (inputs) => {
            enabled = inputs.enabled;
            visible = inputs.visible;

            if (!enabled) {
                if (debounce !== null) {
                    clearTimeout(debounce);
                    debounce = null;
                    pending = true;
                }

                if (inFlight !== null) {
                    pending = true;
                    inFlight.cancel();
                }
            }

            applyPolicy();

            if (enabled && pending) {
                pending = false;
                schedule();
            }
        },
        dispose: () => {
            disposed = true;
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );

            if (debounce !== null) {
                clearTimeout(debounce);
                debounce = null;
            }

            fallbackPoll.destroy();
            reconcilePoll.destroy();
            inFlight?.cancel();
            inFlight = null;
            leaveSubscription();
        },
    };
}
