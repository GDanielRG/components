// Minimal `@/lib/utils` so the fixture mirrors a real consumer: every such app
// ships this (clsx + tailwind-merge `cn`). Its mere presence lets shadcn
// resolve `@/lib/utils` to a consumer file instead of falling back to the
// basename-colliding registry `documents/utils.ts`. Content is intentionally
// dependency-free — the fixture is an install target, never type-checked.
export function cn(...inputs: unknown[]): string {
    return inputs.filter(Boolean).join(' ');
}
