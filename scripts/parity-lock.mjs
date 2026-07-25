// Writes each consumer's registry parity lock — the machine-readable receipt its
// CI checks installed registry-owned files against.
//
//   node scripts/parity-lock.mjs ../amnsa --bundles activity,table,archive,edit-history
//   node scripts/parity-lock.mjs ../amnsa ../grupo-3t --ref snapshot-20260724-ee60d86
//
// Expected hashes come from the REGISTRY, never from the consumer's own files:
// hashing what a consumer already has would bless its fork into the receipt, which
// is the one failure the gate exists to prevent. With --ref the bytes are read out
// of git (`git show <ref>:<path>`), so the receipt is bound to an immutable
// snapshot; without it they come from the working tree and the ref is recorded as
// `worktree@<sha>` (plus `+dirty` when the registry tree is dirty). That
// `worktree@` prefix — not the `+dirty` suffix — is what the consumer's CI gate
// rejects, so a pre-tag generation can never masquerade as a snapshot.
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

for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ref') ref = argv[++i];
    else if (argv[i] === '--bundles')
        bundles = argv[++i]
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean);
    else consumers.push(argv[i]);
}

if (!consumers.length) {
    console.error(
        'usage: node scripts/parity-lock.mjs <consumer-path>... [--ref <tag>] [--bundles a,b,c]\n' +
            '  --ref      immutable snapshot tag to hash from; omit to hash the working tree\n' +
            '  --bundles  required the first time a consumer is locked; carried forward after',
    );
    process.exit(1);
}

const git = (args) => execFileSync('git', args, { cwd: ROOT });
const sha256 = (bytes) =>
    crypto.createHash('sha256').update(bytes).digest('hex');

let readSource;
let recordedRef;

if (ref) {
    try {
        git(['rev-parse', '--verify', `${ref}^{commit}`]);
    } catch {
        console.error(
            `ref "${ref}" does not resolve to a commit in this checkout — ` +
                'prepare and manually tag the snapshot first (see docs/MAINTAINING.md), or omit --ref.',
        );
        process.exit(1);
    }
    readSource = (file) => {
        try {
            return git(['show', `${ref}:${file}`]);
        } catch {
            return null;
        }
    };
    recordedRef = ref;
} else {
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
    return target; // Already consumer-relative, e.g. resources/css/ui-utilities.css.
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
            const installed = fs.existsSync(absolute)
                ? sha256(fs.readFileSync(absolute))
                : null;
            const exception = exceptions[target];

            if (exception) {
                if (exception.sha256 === expected) stale.push(target);
                else if (installed !== exception.sha256) unpinned.push(target);
                continue; // Pinned by the exception entry, not by the registry hash.
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
