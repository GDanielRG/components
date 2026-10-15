import { defineConfig } from 'vite-plus';
import sharedComponentLint from './shared-component-lint.json';

export default defineConfig({
    // Consumers format installed files with their own formatter after install.
    check: {
        fmt: false,
    },
    lint: {
        options: {
            denyWarnings: true,
            typeAware: true,
            typeCheck: true,
        },
        plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'react'],
        jsPlugins: ['@shadcn/lint'],
        ignorePatterns: ['node_modules/**', 'vite.config.ts'],
        extends: [sharedComponentLint],
    },
});
