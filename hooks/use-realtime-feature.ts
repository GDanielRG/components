import { usePage } from '@inertiajs/react';
import type { RealtimeFeature, RealtimePlan } from '@/lib/realtime';

export function useRealtimeFeature(feature: RealtimeFeature): RealtimePlan {
    return usePage().props.realtime.features[feature];
}
