// Prepares a reproducible release by pinning every internal dependency in the
// source registry.json to the given ref, then validates, builds, and smoke-tests.
// It does NOT commit, tag, or push — the maintainer owns git.
//
// Two ref shapes are accepted (see docs/MAINTAINING.md for the policy):
//   - pre-production immutable snapshot:  snapshot-YYYYMMDD-<short-source-sha>
//   - production semantic version:        v1.2.3  /  v1.2.3-rc.1
//
//   node scripts/release.mjs snapshot-20260623-1a2b3c4
//   node scripts/release.mjs v1.0.0-rc.1
//
// Then, on a throwaway release branch (so `main` keeps bare deps):
//   git switch -c release/<ref>
//   git add registry.json && git commit -m "release <ref>"
//   git tag <ref> && git push origin <ref>   # push the TAG, not the branch
//   git switch main                          # main keeps bare dependencies
//
// Consumers then install reproducibly with:
//   npx shadcn@latest add GDanielRG/components/foundations#<ref>
// ShadCN does not inherit a ref across registryDependencies, so pinning the whole
// graph to one immutable ref here is what makes a nested install reproducible — a
// bare `main` commit SHA does not (its internal deps carry no ref).
//
// A snapshot ref asserts provenance: its <short-source-sha> is verified to be a
// prefix of the current HEAD, so the tag name cannot claim a commit it isn't built
// from. Cut snapshots from a committed HEAD (clean tree). SemVer refs carry no SHA.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';

const ROOT = path.resolve(import.meta.dirname, '..');
const tag = process.argv[2];

const SNAPSHOT = /^snapshot-\d{8}-([0-9a-f]{7,40})$/;
const SEMVER = /^v\d+\.\d+\.\d+(-rc\.\d+)?$/;

const snapshotMatch = tag?.match(SNAPSHOT);

if (!tag || !(snapshotMatch || SEMVER.test(tag))) {
    console.error(
        'usage: node scripts/release.mjs <ref>\n' +
            '  pre-production snapshot:  snapshot-YYYYMMDD-<short-source-sha>  e.g. snapshot-20260623-1a2b3c4\n' +
            '  production semver:        v1.2.3  /  v1.2.3-rc.1',
    );
    process.exit(1);
}

const run = (cmd, args) =>
    execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });

const capture = (cmd, args) =>
    execFileSync(cmd, args, { cwd: ROOT }).toString().trim();

// Snapshot provenance: the <short-source-sha> suffix must be a real prefix of the
// commit being released, so a snapshot tag can never claim a commit it isn't built
// from. (SemVer tags carry no SHA, so this is snapshot-only.)
if (snapshotMatch) {
    const suffix = snapshotMatch[1];
    let head;
    try {
        head = capture('git', ['rev-parse', 'HEAD']);
    } catch {
        console.error(
            'cannot verify snapshot provenance: `git rev-parse HEAD` failed — ' +
                'run this inside the components git checkout.',
        );
        process.exit(1);
    }
    if (!head.startsWith(suffix)) {
        console.error(
            `snapshot suffix "${suffix}" is not a prefix of HEAD (${head}).\n` +
                'Cut the snapshot from the current source commit:  ' +
                `snapshot-<YYYYMMDD>-${head.slice(0, 7)}`,
        );
        process.exit(1);
    }
}

const registryPath = path.join(ROOT, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
for (const item of registry.items)
    if (item.registryDependencies)
        item.registryDependencies = item.registryDependencies.map(
            (dependency) =>
                dependency.startsWith('GDanielRG/components/')
                    ? `${dependency.split('#')[0]}#${tag}`
                    : dependency,
        );
fs.writeFileSync(
    registryPath,
    await prettier.format(JSON.stringify(registry), { parser: 'json' }),
);

run('npm', ['run', 'registry:validate']);
run('npm', ['run', 'registry:build']);
run('npm', ['run', 'smoke']);

console.log(
    `\n✓ registry.json pinned to ${tag} (internal deps carry #${tag}), smoke-tested.`,
);
console.log('Next, on a release branch (do not merge it — keep main bare):');
console.log(`  git switch -c release/${tag}`);
console.log(`  git add registry.json && git commit -m "release ${tag}"`);
console.log(`  git tag ${tag} && git push origin ${tag}`);
console.log('  git switch main');
