import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));
const stubs = resolve(root, 'tests/render/stubs');

// Resolve the registry source `@/` alias the way a consumer install does, but
// substitute test doubles for the two consumer-owned contracts (`@/lib/utils`,
// `@/hooks/use-shared-component-copy`) and for the STOCK shadcn UI primitives
// that are not vendored in this source repo. Registry-OWNED files (the real
// rebuilt comments/documents and the chat-display primitives) always resolve to
// the working tree, so the render gate exercises real component logic.
function resolveAtAlias(): import('vite').Plugin {
    return {
        name: 'registry-at-alias',
        enforce: 'pre',
        resolveId(id) {
            if (!id.startsWith('@/')) {
                return null;
            }

            const sub = id.slice(2); // strip "@/"

            // Consumer-owned contract stubs.
            if (sub === 'lib/utils') {
                return resolve(stubs, 'lib/utils.ts');
            }
            if (sub === 'hooks/use-shared-component-copy') {
                return resolve(stubs, 'hooks/use-shared-component-copy.ts');
            }

            // Types live at the repo root `types/` (install target
            // `@components/types/*`).
            if (sub.startsWith('components/types/')) {
                return resolveExisting(
                    resolve(root, sub.replace('components/types/', 'types/')),
                );
            }

            // Stock UI primitives: prefer the working tree (registry-owned
            // primitives like attachment/message/scroll-area), else fall back to
            // the stock test double.
            if (sub.startsWith('components/ui/')) {
                const real = resolveExisting(resolve(root, sub));
                if (real) {
                    return real;
                }
                const name = sub.replace('components/ui/', '');
                return resolveExisting(resolve(stubs, 'ui', name));
            }

            // Everything else maps to the working tree (components/*, hooks/*).
            return resolveExisting(resolve(root, sub));
        },
    };
}

function resolveExisting(base: string): string | null {
    for (const ext of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
        const candidate = `${base}${ext}`;
        if (existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}

export default defineConfig({
    plugins: [resolveAtAlias()],
    test: {
        // Keep the existing node-environment unit tests fast; only the render
        // gate opts into jsdom via a `// @vitest-environment jsdom` pragma.
        environment: 'node',
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        setupFiles: ['tests/render/setup.ts'],
    },
});
