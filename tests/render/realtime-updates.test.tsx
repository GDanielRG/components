// @vitest-environment jsdom
import type { ReloadOptions } from '@inertiajs/core';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RealtimeUpdates } from '@/components/realtime/realtime-updates';

const inertia = vi.hoisted(() => ({
    reloads: [] as ReloadOptions[],
    plan: { transport: 'poll', pollIntervalMs: 60000 },
    activePollIntervals: new Set<number>(),
}));

const reverb = vi.hoisted(() => ({
    onSubscribed: (): void => {},
}));

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            realtime: {
                connection: null,
                features: { comments: inertia.plan },
            },
        },
    }),
    router: {
        reload: (options: ReloadOptions) => inertia.reloads.push(options),
        poll: (interval: number) => ({
            start: () => inertia.activePollIntervals.add(interval),
            stop: () => inertia.activePollIntervals.delete(interval),
            destroy: () => inertia.activePollIntervals.delete(interval),
        }),
        flushByCacheTags: vi.fn(),
    },
}));

vi.mock('@laravel/echo-react', () => {
    const channel = {
        listen: () => channel,
        subscribed: (callback: () => void) => {
            reverb.onSubscribed = callback;

            return channel;
        },
        error: () => channel,
    };

    return {
        echo: () => ({
            private: () => channel,
            connector: { onConnectionChange: () => () => {} },
            leaveChannel: vi.fn(),
        }),
    };
});

beforeEach(() => {
    vi.useFakeTimers();
    inertia.reloads = [];
    inertia.plan = { transport: 'poll', pollIntervalMs: 60000 };
    inertia.activePollIntervals.clear();
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

function Updates({ enabled }: { enabled: boolean }) {
    return (
        <RealtimeUpdates
            feature="comments"
            channel="comments.posts.1"
            event=".CommentChanged"
            only={['comments']}
            enabled={enabled}
        />
    );
}

describe('RealtimeUpdates', () => {
    it('cancels an in-flight read when refreshing becomes unsafe and replays it once safe', () => {
        const { rerender } = render(<Updates enabled />);

        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
            vi.runOnlyPendingTimers();
        });

        expect(inertia.reloads).toHaveLength(1);
        const [read] = inertia.reloads;
        const cancel = vi.fn(() => read.onFinish?.({} as never));
        read.onCancelToken?.({ cancel });

        rerender(<Updates enabled={false} />);
        act(() => vi.runOnlyPendingTimers());

        expect(cancel).toHaveBeenCalledOnce();
        expect(inertia.reloads).toHaveLength(1);

        rerender(<Updates enabled />);
        act(() => vi.runOnlyPendingTimers());

        expect(inertia.reloads).toHaveLength(2);
        expect(inertia.reloads[1].only).toEqual(['comments']);
    });

    it('keeps reconciling on a slower cadence while subscribed to Reverb', () => {
        inertia.plan = { transport: 'reverb', pollIntervalMs: 15000 };
        render(<Updates enabled />);

        expect([...inertia.activePollIntervals]).toEqual([15000]);

        act(() => reverb.onSubscribed());

        expect([...inertia.activePollIntervals]).toEqual([60000]);
    });
});
