import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));
const stubs = resolve(root, 'tests/render/stubs');

// Resolve consumer-owned contracts and stock shadcn primitives to test doubles;
// registry-owned modules continue to resolve from the working tree.
function resolveAtAlias(): import('vite').Plugin {
    return {
        name: 'registry-at-alias',
        enforce: 'pre',
        resolveId(id) {
            if (!id.startsWith('@/')) {
                return null;
            }

            const sub = id.slice(2); // strip "@/"

            if (sub === 'lib/utils') {
                return resolve(stubs, 'lib/utils.ts');
            }
            if (sub === 'hooks/use-shared-component-copy') {
                return resolve(stubs, 'hooks/use-shared-component-copy.ts');
            }

            if (sub.startsWith('components/types/')) {
                return resolveExisting(
                    resolve(root, sub.replace('components/types/', 'types/')),
                );
            }

            if (sub.startsWith('components/ui/')) {
                const real = resolveExisting(resolve(root, sub));
                if (real) {
                    return real;
                }
                const name = sub.replace('components/ui/', '');
                return resolveExisting(resolve(stubs, 'ui', name));
            }

            return resolveExisting(resolve(root, sub));
        },
    };
}

function resolveExisting(base: string): string | null {
    for (const ext of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
        const candidate = `${base}${ext}`;
        if (existsSync(candidate) && statSync(candidate).isFile()) {
            return candidate;
        }
    }
    return null;
}

export default defineConfig({
    plugins: [resolveAtAlias()],
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        setupFiles: ['tests/render/setup.ts'],
    },
});
