// Mirrors the shared props Laravel Wayfinder emits for an app that serves the
// realtime plan, because the fixture does not run `wayfinder:generate`.
import '@inertiajs/core';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            auth: { user: { id: number } | null };
            realtime: {
                connection: {
                    key: string;
                    host: string;
                    port: number;
                    scheme: string;
                } | null;
                features: {
                    comments: {
                        transport: 'reverb' | 'poll' | 'manual';
                        pollIntervalMs: number | null;
                    };
                };
            };
        };
    }
}
