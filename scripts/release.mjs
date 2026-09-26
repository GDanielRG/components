// Prepares a reproducible release commit by inlining every internal registry
// dependency into the items that need it, then validates, builds, and
// smoke-tests. It does NOT commit, tag, or push — the maintainer owns git.
//
// ShadCN does not inherit a ref across registryDependencies, so an item that
// depends on `GDanielRG/components/core` would read `core` from the default
// branch. A release commit has no internal dependencies: installing any item at
// that commit, by tag or by full commit SHA, reads only that commit.
//
// Three modes (see docs/MAINTAINING.md for the policy):
//   pre-production immutable snapshot:  snapshot-YYYYMMDD-<short-source-sha>
//   production semantic version:        v1.2.3  /  v1.2.3-rc.1
//   pending commit pin:                 --pin
//
// A snapshot ref asserts provenance: its <short-source-sha> is verified to be a
// prefix of the current HEAD, so the tag name cannot claim a commit it isn't built
// from. Cut releases from a committed HEAD (clean tree).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';

const ROOT = path.resolve(import.meta.dirname, '..');
const OWNER = 'GDanielRG/components/';
const tag = process.argv[2];
const pin = tag === '--pin';

const SNAPSHOT = /^snapshot-\d{8}-([0-9a-f]{7,40})$/;
const SEMVER = /^v\d+\.\d+\.\d+(-rc\.\d+)?$/;
const INLINEABLE_FIELDS = new Set([
    'name',
    'type',
    'title',
    'description',
    'dependencies',
    'devDependencies',
    'registryDependencies',
    'files',
    'docs',
]);

const snapshotMatch = tag?.match(SNAPSHOT);

if (!tag || !(pin || snapshotMatch || SEMVER.test(tag))) {
    console.error(
        'usage: bun scripts/release.mjs <ref> | --pin\n' +
            '  pre-production snapshot:  snapshot-YYYYMMDD-<short-source-sha>  e.g. snapshot-20260623-1a2b3c4\n' +
            '  production semver:        v1.2.3  /  v1.2.3-rc.1\n' +
            '  pending commit pin:       --pin',
    );
    process.exit(1);
}

const run = (cmd, args) =>
    execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });

const capture = (cmd, args) =>
    execFileSync(cmd, args, { cwd: ROOT }).toString().trim();

let head;
try {
    head = capture('git', ['rev-parse', 'HEAD']);
} catch {
    console.error(
        'cannot verify release provenance: `git rev-parse HEAD` failed — ' +
            'run this inside the components git checkout.',
    );
    process.exit(1);
}

if (capture('git', ['status', '--porcelain']) !== '') {
    console.error(
        'release preparation requires a clean source checkout. Commit the generic source, then create a release branch before running this command.',
    );
    process.exit(1);
}

if (!pin) {
    try {
        capture('git', ['show-ref', '--verify', '--quiet', `refs/tags/${tag}`]);
        console.error(
            `release ref "${tag}" already exists locally. Published refs are immutable; choose a new ref.`,
        );
        process.exit(1);
    } catch (error) {
        if (error?.status !== 1) throw error;
    }
}

const registryPath = path.join(ROOT, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const internalDependencies = (item) =>
    (item.registryDependencies ?? []).filter((dependency) =>
        dependency.startsWith(OWNER),
    );
const pinnedInternalDependencies = registry.items.flatMap((item) =>
    internalDependencies(item).filter((dependency) => dependency.includes('#')),
);
const released = !registry.items.some(
    (item) => internalDependencies(item).length > 0,
);

if (pinnedInternalDependencies.length > 0 || released) {
    console.error(
        'release preparation must start from the generic source registry, whose items depend on each other without refs.',
    );
    process.exit(1);
}

// Snapshot provenance: the <short-source-sha> suffix must be a real prefix of the
// clean source commit, so a snapshot tag can never claim bytes from another commit.
// SemVer refs and pins carry no SHA, so this is snapshot-only.
if (snapshotMatch) {
    const suffix = snapshotMatch[1];

    if (!head.startsWith(suffix)) {
        console.error(
            `snapshot suffix "${suffix}" is not a prefix of HEAD (${head}).\n` +
                'Cut the snapshot from the current source commit:  ' +
                `snapshot-<YYYYMMDD>-${head.slice(0, 7)}`,
        );
        process.exit(1);
    }
}

const items = new Map(registry.items.map((item) => [item.name, item]));

function closure(name, order = [], seen = new Set()) {
    if (seen.has(name)) return order;
    seen.add(name);
    const item = items.get(name);
    if (!item) throw new Error(`unknown internal registry item "${name}"`);
    for (const dependency of internalDependencies(item))
        closure(dependency.slice(OWNER.length), order, seen);
    order.push(item);
    return order;
}

function mergePackages(field, members) {
    const versions = new Map();
    for (const member of members)
        for (const dependency of member[field] ?? []) {
            const name = dependency.replace(/(?!^)@[^@]*$/, '');
            const existing = versions.get(name);
            if (existing && existing !== dependency)
                throw new Error(
                    `conflicting ${field} for ${name}: ${existing} and ${dependency}`,
                );
            versions.set(name, dependency);
        }
    return versions.size > 0 ? [...versions.values()] : undefined;
}

function inline(item) {
    const members = closure(item.name);
    for (const member of members)
        for (const field of Object.keys(member))
            if (!INLINEABLE_FIELDS.has(field))
                throw new Error(
                    `cannot inline "${member.name}" into "${item.name}": unsupported field "${field}"`,
                );

    const files = new Map();
    for (const member of members)
        for (const file of member.files ?? []) {
            const existing = files.get(file.target);
            if (existing && existing.path !== file.path)
                throw new Error(
                    `conflicting files for ${file.target}: ${existing.path} and ${file.path}`,
                );
            files.set(file.target, file);
        }

    const registryDependencies = [
        ...new Set(
            members.flatMap((member) =>
                (member.registryDependencies ?? []).filter(
                    (dependency) => !dependency.startsWith(OWNER),
                ),
            ),
        ),
    ];

    const {
        dependencies: _dependencies,
        devDependencies: _devDependencies,
        registryDependencies: _registryDependencies,
        files: _files,
        docs: _docs,
        ...metadata
    } = item;
    const dependencies = mergePackages('dependencies', members);
    const devDependencies = mergePackages('devDependencies', members);
    const docs = [
        ...new Set(members.map((member) => member.docs).filter(Boolean)),
    ].join('\n\n');
    return {
        ...metadata,
        ...(dependencies && { dependencies }),
        ...(devDependencies && { devDependencies }),
        ...(registryDependencies.length > 0 && { registryDependencies }),
        ...(files.size > 0 && { files: [...files.values()] }),
        ...(docs && { docs }),
    };
}

registry.items = registry.items.map(inline);
fs.writeFileSync(
    registryPath,
    await prettier.format(JSON.stringify(registry), { parser: 'json' }),
);

run('bun', ['run', 'registry:validate']);
run('bun', ['run', 'registry:build']);
run('bun', ['run', 'smoke']);

if (pin) {
    const name = `pin-${head.slice(0, 7)}`;
    console.log(
        '\n✓ registry.json inlines every internal dependency, smoke-tested.',
    );
    console.log('Next, commit this pin on the current release branch:');
    console.log(`  git add registry.json && git commit -m "release ${name}"`);
    console.log(`  git push origin HEAD:refs/heads/release/${name}`);
    console.log('  git switch -');
    console.log(
        '\nConsumers install and record the full SHA of that commit (`git rev-parse release/' +
            name +
            '`).',
    );
    process.exit(0);
}

console.log(
    `\n✓ registry.json inlines every internal dependency for ${tag}, smoke-tested.`,
);
console.log('Next, commit and tag this release on the current release branch:');
console.log(`  git add registry.json && git commit -m "release ${tag}"`);
console.log(`  git tag -a ${tag} -m "${tag}" && git push origin ${tag}`);
console.log('  git switch main');
console.log(
    `\nThen, back on main: rename CHANGELOG.md's "### Unreleased" heading to "### ${tag}".`,
);
console.log(
    "The tag's short SHA is only knowable now, so the heading is backfilled — leaving it",
);
console.log(
    'as "Unreleased" is how past waves drifted past their own release.',
);
