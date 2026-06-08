// Prepares a reproducible release by pinning every internal dependency in the
// source registry.json to the given tag, then validates, builds, and smoke-tests.
// It does NOT commit, tag, or push — the maintainer owns git.
//
//   node scripts/release.mjs v1.0.0-rc.1
//
// Then, on a throwaway release branch (so `main` keeps bare deps):
//   git switch -c release/v1.0.0-rc.1
//   git add registry.json && git commit -m "release v1.0.0-rc.1"
//   git tag v1.0.0-rc.1 && git push origin v1.0.0-rc.1   # push the TAG, not the branch
//   git switch main                                      # main keeps bare dependencies
//
// Consumers then install reproducibly with:
//   npx shadcn@latest add GDanielRG/components/foundations#v1.0.0-rc.1
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';

const ROOT = path.resolve(import.meta.dirname, '..');
const tag = process.argv[2];

if (!tag || !/^v\d+\.\d+\.\d+(-rc\.\d+)?$/.test(tag)) {
    console.error('usage: node scripts/release.mjs <tag>   e.g. v1.0.0-rc.1');
    process.exit(1);
}

const run = (cmd, args) =>
    execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });

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
