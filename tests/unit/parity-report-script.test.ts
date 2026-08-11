import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const temporaryDirectories: string[] = [];

function sha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function makeConsumer(): { consumer: string; ownedFile: string } {
    const parent = mkdtempSync(join(tmpdir(), 'components-parity-report-'));
    temporaryDirectories.push(parent);

    const consumer = join(parent, 'consumer');
    const ownedFile = join(consumer, 'resources/js/components/example.ts');
    const contents = 'export const value = true;\n';

    mkdirSync(dirname(ownedFile), { recursive: true });
    writeFileSync(ownedFile, contents);
    writeFileSync(
        join(consumer, 'registry.lock.json'),
        `${JSON.stringify({
            registry: 'GDanielRG/components',
            ref: 'HEAD',
            commit: '0000000000000000000000000000000000000000',
            bundles: ['core'],
            files: {
                'resources/js/components/example.ts': sha256(contents),
            },
            exceptions: {},
        })}\n`,
    );

    return { consumer, ownedFile };
}

function report(consumer: string): string {
    return execFileSync(
        process.execPath,
        [join(root, 'scripts/parity-report.mjs'), consumer],
        { cwd: root },
    ).toString();
}

afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
        rmSync(directory, { recursive: true, force: true });
    }
});

describe('parity-report installed-byte inspection', () => {
    it('reports a matching consumer with zero drift', () => {
        const { consumer } = makeConsumer();

        expect(report(consumer)).toMatch(/consumer\s+HEAD\s+—\s+1\s+0\s+0/);
    });

    it('surfaces changed registry-owned bytes while remaining advisory', () => {
        const { consumer, ownedFile } = makeConsumer();
        writeFileSync(ownedFile, 'export const value = false;\n');

        const output = report(consumer);

        expect(output).toMatch(/consumer\s+HEAD\s+—\s+1\s+0\s+1/);
        expect(output).toContain(
            'registry-owned file differs from its receipt',
        );
    });

    it('reports structurally invalid JSON receipts without failing', () => {
        const { consumer } = makeConsumer();
        writeFileSync(join(consumer, 'registry.lock.json'), '{}\n');

        const output = report(consumer);

        expect(output).toMatch(/consumer\s+invalid\s+—\s+—\s+—\s+—/);
        expect(output).toContain('receipt has an invalid structure');
    });
});
