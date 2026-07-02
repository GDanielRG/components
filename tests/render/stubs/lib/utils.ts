// Minimal `@/lib/utils` mirroring the consumer-owned contract (clsx +
// tailwind-merge `cn`). Dependency-free for the render gate.
export function cn(...inputs: unknown[]): string {
    return inputs.filter(Boolean).join(' ');
}
