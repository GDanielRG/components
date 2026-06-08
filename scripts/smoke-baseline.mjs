// Dependency-resolving install smoke test.
//
// Installs the working-tree registry into the supported ecosystem baseline,
// retaining stock shadcn dependencies and versioned npm dependencies, then
// type-checks the complete installed result.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SHADCN = path.join(ROOT, 'node_modules/.bin/shadcn');
const OWNER = 'GDanielRG/components';

const run = (cmd, args, cwd = ROOT) =>
    execFileSync(cmd, args, { cwd, stdio: 'inherit' });

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'reg-baseline-'));
try {
    fs.rmSync(path.join(ROOT, 'public/r'), { recursive: true, force: true });
    fs.mkdirSync(path.join(ROOT, 'public/r'), { recursive: true });
    run(SHADCN, ['build']);

    const registry = path.join(work, 'r');
    fs.cpSync(path.join(ROOT, 'public/r'), registry, { recursive: true });
    for (const file of fs.readdirSync(registry)) {
        if (!file.endsWith('.json') || file === 'registry.json') continue;
        const target = path.join(registry, file);
        const item = JSON.parse(fs.readFileSync(target, 'utf8'));
        if (item.registryDependencies) {
            item.registryDependencies = item.registryDependencies.map(
                (dependency) =>
                    dependency.startsWith(`${OWNER}/`)
                        ? path.join(
                              registry,
                              `${dependency.split('/').pop().split('#')[0]}.json`,
                          )
                        : dependency,
            );
        }
        fs.writeFileSync(target, JSON.stringify(item));
    }

    const consumer = path.join(work, 'consumer');
    fs.cpSync(path.join(ROOT, 'tests/fixture-consumer'), consumer, {
        recursive: true,
    });
    const contracts = [
        'resources/js/hooks/use-shared-component-copy.ts',
        'resources/js/components/app-right-sidebar.tsx',
    ];
    const before = contracts.map((file) =>
        fs.readFileSync(path.join(consumer, file), 'utf8'),
    );

    run(
        'npm',
        ['install', '--ignore-scripts', '--no-audit', '--no-fund'],
        consumer,
    );
    run(SHADCN, [
        'add',
        path.join(registry, 'foundations.json'),
        '--overwrite',
        '--yes',
        '--cwd',
        consumer,
    ]);
    run('npm', ['run', 'types:check'], consumer);

    const snapshot = () => {
        const files = {};
        const walk = (directory) => {
            for (const entry of fs.readdirSync(directory, {
                withFileTypes: true,
            })) {
                const file = path.join(directory, entry.name);
                if (entry.isDirectory()) walk(file);
                else
                    files[path.relative(consumer, file)] = fs.readFileSync(
                        file,
                        'utf8',
                    );
            }
        };
        walk(path.join(consumer, 'resources/js'));
        return files;
    };
    const installed = snapshot();

    run(SHADCN, [
        'add',
        path.join(registry, 'foundations.json'),
        '--overwrite',
        '--yes',
        '--cwd',
        consumer,
    ]);
    run('npm', ['run', 'types:check'], consumer);
    const reinstalled = snapshot();
    const changed = [
        ...new Set([...Object.keys(installed), ...Object.keys(reinstalled)]),
    ].filter((file) => installed[file] !== reinstalled[file]);
    if (changed.length)
        throw new Error(`reinstall changed files: ${changed.join(', ')}`);

    const after = contracts.map((file) =>
        fs.readFileSync(path.join(consumer, file), 'utf8'),
    );
    if (JSON.stringify(before) !== JSON.stringify(after))
        throw new Error('an app-owned contract file was overwritten');

    const corruptions = [];
    const walk = (directory) => {
        for (const entry of fs.readdirSync(directory, {
            withFileTypes: true,
        })) {
            const file = path.join(directory, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (
                /\.(ts|tsx)$/.test(entry.name) &&
                fs.readFileSync(file, 'utf8').includes('@/resources/js')
            )
                corruptions.push(path.relative(consumer, file));
        }
    };
    walk(path.join(consumer, 'resources/js'));
    if (corruptions.length)
        throw new Error(
            `install corrupted imports in: ${corruptions.join(', ')}`,
        );

    console.log(
        '\n✓ aligned baseline resolves dependencies, preserves contracts, type-checks, and reinstalls byte-identically',
    );
} finally {
    fs.rmSync(work, { recursive: true, force: true });
}
