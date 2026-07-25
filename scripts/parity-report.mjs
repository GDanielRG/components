// Advisory fleet-drift report: which consumers are pinned to which snapshot, how
// far behind the registry each one is, and which declared divergences are due for
// review.
//
//   node scripts/parity-report.mjs                 # every sibling with a lock
//   node scripts/parity-report.mjs ../amnsa ../anter
//
// This is DELIBERATELY advisory and always exits 0. Being behind the registry is
// the normal state between upgrade waves — a new release must not redden seven
// repos before their wave reaches them. The blocking half of the gate lives in
// each consumer's own suite (tests/Unit/RegistryParityTest.php), where it checks
// that consumer against its OWN pinned lock and nothing else.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const LOCK = 'registry.lock.json';

const git = (args) =>
    execFileSync('git', args, { cwd: ROOT }).toString().trim();

const consumers = process.argv.slice(2).length
    ? process.argv.slice(2)
    : fs
          .readdirSync(path.dirname(ROOT))
          .map((entry) => path.join(path.dirname(ROOT), entry))
          .filter((entry) => fs.existsSync(path.join(entry, LOCK)))
          .sort();

if (!consumers.length) {
    console.log('No consumers with a registry.lock.json found.');
    process.exit(0);
}

// Snapshot tags are dated, so creator order is release order.
const tags = git([
    'for-each-ref',
    '--sort=creatordate',
    '--format=%(refname:short)',
    'refs/tags',
])
    .split('\n')
    .filter(Boolean);
const latest = tags.at(-1);

console.log(`registry ${ROOT}`);
console.log(`  latest ref  ${latest}`);
console.log(
    `  HEAD        ${git(['rev-parse', '--short', 'HEAD'])}${git(['status', '--porcelain']) ? ' (dirty)' : ''}\n`,
);

const rows = [];
const notes = [];
const unreleased = [];
const today = new Date().toISOString().slice(0, 10);

for (const consumer of consumers) {
    const lock = JSON.parse(fs.readFileSync(path.join(consumer, LOCK), 'utf8'));
    const name = path.basename(consumer);

    // Distance is measured in RELEASES, not commits: what an upgrade wave cares
    // about is how many snapshots have been cut since this one. A `worktree@<sha>`
    // ref is a pre-tag generation — real bytes, no release behind them — so it has
    // no position in that sequence. (Commit distance would be meaningless anyway:
    // the release helper commits its pinned registry.json on a throwaway branch,
    // so every snapshot tag sits one commit ahead of the main commit it names.)
    const released = tags.indexOf(lock.ref);
    const behind = released === -1 ? '—' : String(tags.length - 1 - released);

    rows.push([
        name,
        lock.ref,
        behind,
        String(Object.keys(lock.files).length),
        String(Object.keys(lock.exceptions).length),
    ]);

    if (lock.ref.startsWith('worktree@')) unreleased.push(name);

    for (const [file, exception] of Object.entries(lock.exceptions)) {
        if (exception.review && exception.review <= today) {
            notes.push(
                `${name} ${file}: divergence due for review (${exception.review}, owner ${exception.owner}).`,
            );
        }
    }
}

const header = ['consumer', 'pinned ref', 'behind', 'locked', 'exceptions'];
const widths = header.map((label, column) =>
    Math.max(label.length, ...rows.map((row) => row[column].length)),
);
const line = (cells) =>
    cells
        .map((cell, column) => cell.padEnd(widths[column]))
        .join('  ')
        .trimEnd();

console.log(line(header));
console.log(widths.map((width) => '-'.repeat(width)).join('  '));
for (const row of rows) console.log(line(row));

const refs = new Set(rows.map((row) => row[1]));
if (refs.size > 1) {
    notes.push(
        `consumers span ${refs.size} different refs — an upgrade wave is mid-flight.`,
    );
}

if (unreleased.length) {
    notes.push(
        `${unreleased.length === consumers.length ? 'every consumer' : unreleased.join(', ')} ` +
            'is locked to an uncommitted registry worktree rather than a snapshot tag. ' +
            'Prepare and manually tag one (see docs/MAINTAINING.md), then re-run parity-lock with --ref.',
    );
}

if (notes.length) {
    console.log('\nadvisory');
    for (const note of notes) console.log(`  ! ${note}`);
}
