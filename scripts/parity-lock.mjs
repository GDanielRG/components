// Writes each consumer's registry parity lock — the machine-readable receipt its
// CI checks installed registry-owned files against.
//
//   bun scripts/parity-lock.mjs ../amnsa --bundles activity,table,archive,edit-history
//   bun scripts/parity-lock.mjs ../amnsa ../grupo-3t --ref snapshot-20260724-ee60d86
//   bun scripts/parity-lock.mjs ../amnsa --install
//
// Expected hashes come from the REGISTRY, never from the consumer's own files:
// hashing what a consumer already has would bless its fork into the receipt, which
// is the one failure the gate exists to prevent. With --ref the bytes are read out
// of git (`git show <ref>:<path>`), so the receipt records both the human ref and
// its resolved commit. Without it they come from the working tree, record the
// full HEAD, and use `worktree@<sha>` (plus `+dirty`) as the human ref. Consumer
// CI rejects that `worktree@` prefix.
//
// `bundles` and `exceptions` are read back from an existing lock and carried
// forward, so re-running after a reinstall only moves hashes. Exceptions are never
// invented here — an undeclared divergence stays a mismatch (reported, and the
// registry hash is written anyway so CI fails on it). Declaring one is a
// deliberate act: add the entry by hand with a reason, an owner and a review date.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OWNER = 'GDanielRG/components';
const LOCK = 'registry.lock.json';
const FULL_COMMIT = /^[0-9a-f]{40}$/;
const RELEASE_TAG =
    /^(?:snapshot-\d{8}-[0-9a-f]{7,40}|v\d+\.\d+\.\d+(?:-rc\.\d+)?)$/;

// Registry targets address the consumer through shadcn's alias namespaces; each
// consumer's own components.json says where those land.
const ALIAS_OF = {
    '@components/': 'components',
    '@ui/': 'ui',
    '@lib/': 'lib',
    '@hooks/': 'hooks',
    '@utils/': 'utils',
};

const argv = process.argv.slice(2);
const consumers = [];
let ref = null;
let bundles = null;
let install = false;

for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ref') ref = argv[++i];
    else if (argv[i] === '--install') install = true;
    else if (argv[i] === '--bundles')
        bundles = argv[++i]
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean);
    else consumers.push(argv[i]);
}

if (!consumers.length) {
    console.error(
        'usage: bun scripts/parity-lock.mjs <consumer-path>... [--ref <tag>] [--bundles a,b,c] [--install]\n' +
            '  --ref      immutable snapshot tag to hash from; omit to hash the working tree\n' +
            '  --bundles  required the first time a consumer is locked; carried forward after\n' +
            '  --install  copy only registry-owned files before writing the receipt',
    );
    process.exit(1);
}

const git = (args) => execFileSync('git', args, { cwd: ROOT });
const sha256 = (bytes) =>
    crypto.createHash('sha256').update(bytes).digest('hex');

let readSource;
let recordedRef;
let recordedCommit;

if (ref) {
    const invalidImmutableRef = () => {
        console.error(
            `ref "${ref}" must be an annotated release tag or a full commit SHA — ` +
                'prepare and manually tag the release first (see docs/MAINTAINING.md), pass its full source commit, or omit --ref.',
        );
        process.exit(1);
    };

    try {
        if (FULL_COMMIT.test(ref)) {
            recordedCommit = git(['rev-parse', '--verify', `${ref}^{commit}`])
                .toString()
                .trim();

            if (recordedCommit !== ref) invalidImmutableRef();
        } else if (RELEASE_TAG.test(ref)) {
            const tagRef = `refs/tags/${ref}`;

            if (git(['cat-file', '-t', tagRef]).toString().trim() !== 'tag')
                invalidImmutableRef();

            recordedCommit = git([
                'rev-parse',
                '--verify',
                `${tagRef}^{commit}`,
            ])
                .toString()
                .trim();
        } else {
            invalidImmutableRef();
        }
    } catch {
        invalidImmutableRef();
    }

    readSource = (file) => {
        try {
            return git(['show', `${recordedCommit}:${file}`]);
        } catch {
            return null;
        }
    };
    recordedRef = ref;
} else {
    recordedCommit = git(['rev-parse', 'HEAD']).toString().trim();
    const head = git(['rev-parse', '--short', 'HEAD']).toString().trim();
    const dirty = git(['status', '--porcelain']).toString().trim().length > 0;
    readSource = (file) => {
        const absolute = path.join(ROOT, file);
        return fs.existsSync(absolute) ? fs.readFileSync(absolute) : null;
    };
    recordedRef = `worktree@${head}${dirty ? '+dirty' : ''}`;
}

const registry = JSON.parse(readSource('registry.json').toString('utf8'));
const items = new Map(registry.items.map((item) => [item.name, item]));

// A consumer declares the bundles it installed; the files it owns are that set
// closed over registryDependencies, exactly as shadcn resolves an install.
const closure = (declared) => {
    const seen = new Set();
    const queue = [...declared];
    while (queue.length) {
        const name = queue.shift();
        if (seen.has(name)) continue;
        const item = items.get(name);
        if (!item) {
            console.error(
                `unknown bundle "${name}" — not an item in registry.json.`,
            );
            process.exit(1);
        }
        seen.add(name);
        for (const dependency of item.registryDependencies ?? [])
            if (dependency.startsWith(`${OWNER}/`))
                queue.push(dependency.slice(OWNER.length + 1).split('#')[0]);
    }
    return [...seen].sort();
};

const resolveTarget = (target, aliases, consumer) => {
    for (const [prefix, key] of Object.entries(ALIAS_OF)) {
        if (!target.startsWith(prefix)) continue;
        const base = aliases[key];
        if (!base) {
            console.error(
                `${consumer}: components.json declares no "${key}" alias.`,
            );
            process.exit(1);
        }
        return `${base.replace(/^@\//, 'resources/js/')}/${target.slice(prefix.length)}`;
    }
    return target; // A registry:file target outside the alias namespaces is already consumer-relative.
};

let failed = false;

for (const consumer of consumers) {
    const lockPath = path.join(consumer, LOCK);
    const previous = fs.existsSync(lockPath)
        ? JSON.parse(fs.readFileSync(lockPath, 'utf8'))
        : {};
    const declared = bundles ?? previous.bundles;

    if (!declared?.length) {
        console.error(
            `${consumer}: no lock yet — pass --bundles with the bundles this repo installed.`,
        );
        process.exit(1);
    }

    const aliases =
        JSON.parse(
            fs.readFileSync(path.join(consumer, 'components.json'), 'utf8'),
        ).aliases ?? {};
    const exceptions = previous.exceptions ?? {};

    const files = {};
    const edited = [];
    const missing = [];
    const stale = [];
    const unpinned = [];
    const installedFiles = [];

    for (const name of closure(declared)) {
        for (const file of items.get(name).files ?? []) {
            const bytes = readSource(file.path);
            if (!bytes) {
                console.error(
                    `${recordedRef} has no ${file.path} — stale registry.json?`,
                );
                process.exit(1);
            }

            const target = resolveTarget(file.target, aliases, consumer);
            const expected = sha256(bytes);
            const absolute = path.join(consumer, target);
            let installed = fs.existsSync(absolute)
                ? sha256(fs.readFileSync(absolute))
                : null;
            const exception = exceptions[target];

            if (exception) {
                if (exception.sha256 === expected) stale.push(target);
                else if (installed !== exception.sha256) unpinned.push(target);
                continue; // Pinned by the exception entry, not by the registry hash.
            }

            if (install && installed !== expected) {
                fs.mkdirSync(path.dirname(absolute), { recursive: true });
                fs.writeFileSync(absolute, bytes);
                installed = expected;
                installedFiles.push(target);
            }

            files[target] = expected;
            if (installed === null) missing.push(target);
            else if (installed !== expected) edited.push(target);
        }
    }

    fs.writeFileSync(
        lockPath,
        `${JSON.stringify(
            {
                registry: OWNER,
                ref: recordedRef,
                commit: recordedCommit,
                bundles: [...declared].sort(),
                files: Object.fromEntries(Object.entries(files).sort()),
                exceptions: Object.fromEntries(
                    Object.entries(exceptions).sort(),
                ),
            },
            null,
            4,
        )}\n`,
    );

    const report = (label, list) =>
        list.length &&
        console.log(
            `  ${label}: ${list.join('\n' + ' '.repeat(label.length + 4))}`,
        );

    console.log(
        `${consumer}: ${Object.keys(files).length} locked, ${Object.keys(exceptions).length} declared divergence(s) @ ${recordedRef}`,
    );
    report('INSTALLED', installedFiles);
    report('EDITED', edited);
    report('MISSING', missing);
    report('STALE EXCEPTION (now matches the registry — delete it)', stale);
    report('EXCEPTION DRIFTED PAST ITS PINNED BYTES', unpinned);

    if (edited.length || missing.length || stale.length || unpinned.length)
        failed = true;
}

if (failed) {
    console.error(
        '\nLocks written from registry truth, but some consumers do not match them. ' +
            'Reinstall the bundle, or declare the divergence under "exceptions" with a reason, owner and review date.',
    );
    process.exit(1);
}
