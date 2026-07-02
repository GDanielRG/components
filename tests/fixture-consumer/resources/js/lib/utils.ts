// Minimal `@/lib/utils` so the fixture mirrors a real consumer: every such app
// ships this (clsx + tailwind-merge `cn`, plus the fleet-standard `toUrl` used by
// the graduated `use-current-url` hook). Its mere presence lets shadcn resolve
// `@/lib/utils` to a consumer file instead of falling back to the
// basename-colliding registry `documents/utils.ts`. Content is intentionally
// dependency-free but must expose every symbol the registry imports so the
// installed result type-checks.
import type { InertiaLinkProps } from '@inertiajs/react';

export function cn(...inputs: unknown[]): string {
    return inputs.filter(Boolean).join(' ');
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    if (typeof url === 'string') {
        return url;
    }

    if (url instanceof URL) {
        return url.toString();
    }

    return url.url;
}
