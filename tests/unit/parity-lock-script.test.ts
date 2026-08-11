import { execFileSync, spawnSync } from 'node:child_process';
import {
    copyFileSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const temporaryConsumers: string[] = [];

function git(...args: string[]): string {
    return execFileSync('git', args, { cwd: root }).toString().trim();
}

function makeConsumer(): string {
    const consumer = mkdtempSync(join(tmpdir(), 'components-parity-lock-'));
    temporaryConsumers.push(consumer);

    writeFileSync(
        join(consumer, 'components.json'),
        `${JSON.stringify({
            aliases: {
                components: '@/components',
                hooks: '@/hooks',
                lib: '@/lib',
                ui: '@/components/ui',
                utils: '@/lib/utils',
            },
        })}\n`,
    );

    for (const file of ['components/ui/sidebar.tsx', 'hooks/use-mobile.ts']) {
        const target = join(consumer, 'resources/js', file);
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(join(root, file), target);
    }

    return consumer;
}

function lock(consumer: string): Record<string, unknown> {
    return JSON.parse(
        readFileSync(join(consumer, 'registry.lock.json'), 'utf8'),
    );
}

function runParityLock(consumer: string, ...args: string[]): void {
    execFileSync(
        process.execPath,
        [
            join(root, 'scripts/parity-lock.mjs'),
            consumer,
            '--bundles',
            'sidebar',
            ...args,
        ],
        { cwd: root },
    );
}

afterEach(() => {
    for (const consumer of temporaryConsumers.splice(0)) {
        rmSync(consumer, { recursive: true, force: true });
    }
});

describe('parity-lock receipt provenance', () => {
    it('records a human ref and its full resolved commit', () => {
        const consumer = makeConsumer();
        const commit = git('rev-parse', 'HEAD');

        runParityLock(consumer, '--ref', commit);

        expect(lock(consumer)).toMatchObject({
            ref: commit,
            commit,
        });
    });

    it('rejects a moving ref', () => {
        const consumer = makeConsumer();
        const result = spawnSync(
            process.execPath,
            [
                join(root, 'scripts/parity-lock.mjs'),
                consumer,
                '--bundles',
                'sidebar',
                '--ref',
                'HEAD',
            ],
            { cwd: root, encoding: 'utf8' },
        );

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain(
            'must be an annotated release tag or a full commit SHA',
        );
    });

    it('records the full HEAD for a worktree receipt', () => {
        const consumer = makeConsumer();

        runParityLock(consumer);

        expect(lock(consumer)).toMatchObject({
            ref: expect.stringMatching(/^worktree@[0-9a-f]+(?:\+dirty)?$/),
            commit: git('rev-parse', 'HEAD'),
        });
    });

    it('installs only the registry-owned bytes before writing the receipt', () => {
        const consumer = makeConsumer();
        const sidebar = join(
            consumer,
            'resources/js/components/ui/sidebar.tsx',
        );
        writeFileSync(sidebar, 'locally edited\n');

        runParityLock(consumer, '--install');

        expect(readFileSync(sidebar, 'utf8')).toBe(
            readFileSync(join(root, 'components/ui/sidebar.tsx'), 'utf8'),
        );
        expect(
            lock(consumer) as { files: Record<string, string> },
        ).toMatchObject({
            files: {
                'resources/js/components/ui/sidebar.tsx': expect.any(String),
            },
        });
    });
});
