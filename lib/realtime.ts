import type { InertiaConfig } from '@inertiajs/core';
import { configureEcho, echoIsConfigured } from '@laravel/echo-react';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

export type RealtimeSharedData = InertiaConfig['sharedPageProps']['realtime'];

export type RealtimeConnection = NonNullable<RealtimeSharedData['connection']>;

export type RealtimeFeature = keyof RealtimeSharedData['features'];

export type RealtimePlan = RealtimeSharedData['features'][RealtimeFeature];

export function configureRealtimeEcho(
    connection: RealtimeConnection | null,
): void {
    if (typeof window === 'undefined' || echoIsConfigured()) {
        return;
    }

    // laravel-echo looks for the Reverb client on window.
    window.Pusher = Pusher;

    configureEcho(
        connection
            ? {
                  broadcaster: 'reverb',
                  key: connection.key,
                  wsHost: connection.host,
                  wsPort: connection.port,
                  wssPort: connection.port,
                  forceTLS: connection.scheme === 'https',
                  enabledTransports: ['ws', 'wss'],
              }
            : { broadcaster: 'null' },
    );
}
