// Reports drift between a consumer's installed registry files and the registry
// source at a ref. Each file is installed from that ref into a scratch copy of the
// consumer, then both the installed and the consumer's copy pass through the
// consumer's own formatter, so class and import order cannot report false drift.
// The consumer checkout is only read.
//
//   bun run registry:drift -- [--ref <ref>] [--items a,b] [--diff] <consumer>...
//
// The ref and items default to the consumer's package.json `componentsRegistry`
// pin, whose `local` paths are app-owned adaptations: they are reported without
// failing. Exits 1 when any other file differs or is missing.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SHADCN = path.join(ROOT, 'node_modules/.bin/shadcn');
const OWNER = 'GDanielRG/components';
const CONFIG_FILES = [
    '.gitignore',
    'components.json',
    'package.json',
    'shared-component-lint.json',
    'tsconfig.json',
    'vite.config.ts',
];
const SOURCE_DIRECTORIES = ['resources/css', 'resources/js'];

const options = { ref: null, items: null, diff: false };
const consumers = [];
const args = process.argv.slice(2);
for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--ref') options.ref = args[++index];
    else if (arg === '--items') options.items = args[++index].split(',');
    else if (arg === '--diff') options.diff = true;
    else consumers.push(path.resolve(arg));
}

if (consumers.length === 0) {
    console.error(
        'usage: bun run registry:drift -- [--ref <ref>] [--items a,b] [--diff] <consumer>...',
    );
    process.exit(2);
}

const git = (...gitArgs) =>
    execFileSync('git', gitArgs, {
        cwd: ROOT,
        maxBuffer: 64 * 1024 * 1024,
    }).toString();

const registries = new Map();
const registryAt = (ref) => {
    if (!registries.has(ref))
        registries.set(ref, JSON.parse(git('show', `${ref}:registry.json`)));
    return registries.get(ref);
};

// A dependency without its own ref is read at the requesting ref: that is the
// source being compared, even though ShadCN would resolve it at the default branch.
function collectFiles(names, ref, files = new Map(), seen = new Set()) {
    for (const name of names) {
        if (seen.has(name)) continue;
        seen.add(name);
        const item = registryAt(ref).items.find(
            (candidate) => candidate.name === name,
        );
        if (!item)
            throw new Error(`registry item "${name}" not found at ${ref}`);

        const internal = (item.registryDependencies ?? []).filter(
            (dependency) => dependency.startsWith(`${OWNER}/`),
        );
        for (const dependency of internal) {
            const [dependencyName, dependencyRef] = dependency
                .slice(OWNER.length + 1)
                .split('#');
            collectFiles([dependencyName], dependencyRef ?? ref, files, seen);
        }

        for (const file of item.files ?? [])
            files.set(file.target, {
                ...file,
                content: git('show', `${ref}:${file.path}`),
            });
    }
    return files;
}

function targetPath(target, consumer) {
    const match = target.match(/^@([^/]+)\/(.+)$/);
    if (!match) return target;
    const [, alias, rest] = match;
    const aliasPath = JSON.parse(
        fs.readFileSync(path.join(consumer, 'components.json'), 'utf8'),
    ).aliases[alias];
    const paths = JSON.parse(
        fs.readFileSync(path.join(consumer, 'tsconfig.json'), 'utf8'),
    ).compilerOptions.paths['@/*'][0];
    if (!aliasPath?.startsWith('@/'))
        throw new Error(`cannot resolve target ${target} in ${consumer}`);
    return path.posix.join(
        paths.replace(/^\.\//, '').replace(/\*$/, ''),
        aliasPath.slice(2),
        rest,
    );
}

function prepareScratch(consumer, work) {
    const scratch = path.join(work, 'consumer');
    for (const file of CONFIG_FILES)
        if (fs.existsSync(path.join(consumer, file)))
            fs.cpSync(path.join(consumer, file), path.join(scratch, file));
    for (const directory of SOURCE_DIRECTORIES)
        fs.cpSync(
            path.join(consumer, directory),
            path.join(scratch, directory),
            {
                recursive: true,
            },
        );

    // Link packages one by one so tool caches land in the scratch directory.
    const modules = path.join(scratch, 'node_modules');
    fs.mkdirSync(modules);
    for (const entry of fs.readdirSync(path.join(consumer, 'node_modules')))
        fs.symlinkSync(
            path.join(consumer, 'node_modules', entry),
            path.join(modules, entry),
        );
    return scratch;
}

function checkConsumer(consumer) {
    const pin =
        JSON.parse(fs.readFileSync(path.join(consumer, 'package.json'), 'utf8'))
            .componentsRegistry ?? {};
    const ref = options.ref ?? pin.ref;
    const items = options.items ?? pin.items;
    const local = new Set(pin.local ?? []);
    if (!ref || !items?.length)
        throw new Error(
            `${consumer} has no componentsRegistry pin; pass --ref and --items`,
        );
    try {
        git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`);
    } catch {
        throw new Error(`ref ${ref} is not available locally; fetch it first`);
    }

    const files = [...collectFiles(items, ref).values()];
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-drift-'));
    try {
        const scratch = prepareScratch(consumer, work);
        const item = path.join(work, 'installed.json');
        fs.writeFileSync(
            item,
            JSON.stringify({
                $schema: 'https://ui.shadcn.com/schema/registry-item.json',
                name: 'installed',
                type: 'registry:item',
                files,
            }),
        );
        execFileSync(
            SHADCN,
            ['add', item, '--overwrite', '--yes', '--silent', '--cwd', scratch],
            {
                // ShadCN leaves a temporary directory behind for each file it rewrites.
                env: { ...process.env, TMPDIR: work },
                stdio: ['ignore', 'ignore', 'inherit'],
            },
        );

        const targets = files.map((file) => targetPath(file.target, consumer));
        const format = () =>
            execFileSync(
                path.join(scratch, 'node_modules/.bin/vp'),
                ['fmt', '--no-error-on-unmatched-pattern', ...targets],
                { cwd: scratch, stdio: ['ignore', 'ignore', 'inherit'] },
            );
        const read = () =>
            targets.map((target) =>
                fs.readFileSync(path.join(scratch, target), 'utf8'),
            );

        format();
        const expected = read();
        const missing = [];
        for (const target of targets) {
            const actual = path.join(consumer, target);
            if (fs.existsSync(actual))
                fs.copyFileSync(actual, path.join(scratch, target));
            else missing.push(target);
        }
        format();
        const actual = read();

        const differing = targets.filter(
            (target, index) =>
                !missing.includes(target) && expected[index] !== actual[index],
        );
        const drift = differing.filter((target) => !local.has(target));
        console.log(
            `\n${consumer} @ ${ref} (${items.join(', ')}): ${targets.length} files, ${drift.length} drifted, ${missing.length} missing, ${differing.length - drift.length} local`,
        );
        for (const target of missing) console.log(`  missing  ${target}`);
        for (const target of local)
            if (targets.includes(target) && !differing.includes(target))
                console.log(`  matches  ${target} (remove it from local)`);
        for (const target of differing) {
            const index = targets.indexOf(target);
            const expectedFile = path.join(work, 'expected');
            fs.writeFileSync(expectedFile, expected[index]);
            let patch = '';
            try {
                execFileSync('diff', [
                    '-u',
                    '--label',
                    `registry/${target}`,
                    '--label',
                    `consumer/${target}`,
                    expectedFile,
                    path.join(scratch, target),
                ]);
            } catch (error) {
                patch = error.stdout.toString();
            }
            const changed = patch
                .split('\n')
                .filter((line) => /^[-+](?![-+]{2} )/.test(line)).length;
            console.log(
                `  ${local.has(target) ? 'local  ' : 'drifted'}  ${target} (${changed} changed lines)`,
            );
            if (options.diff) console.log(patch);
        }
        return drift.length + missing.length;
    } finally {
        fs.rmSync(work, { recursive: true, force: true });
    }
}

let failures = 0;
for (const consumer of consumers) failures += checkConsumer(consumer);
process.exit(failures > 0 ? 1 : 0);
