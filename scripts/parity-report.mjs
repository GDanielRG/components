// Advisory consumer report: which consumers are pinned to which snapshot, how
// far behind the registry each one is, whether their installed bytes still match
// their own receipts, and which declared exceptions are due for review.
//
//   bun scripts/parity-report.mjs                 # every sibling with a lock
//   bun scripts/parity-report.mjs ../amnsa ../anter
//
// This is DELIBERATELY advisory and always exits 0. Being behind the registry is
// normal between upgrade waves. The blocking half is the registry-owned source
// integrity test installed into each consumer, which reads only that consumer's
// local receipt and files.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const LOCK = 'registry.lock.json';

const git = (args) =>
    execFileSync('git', args, { cwd: ROOT }).toString().trim();
const sha256 = (bytes) =>
    crypto.createHash('sha256').update(bytes).digest('hex');
const isRecord = (value) =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
const isStringRecord = (value) =>
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === 'string');
const isExceptionRecord = (value) =>
    isRecord(value) &&
    Object.values(value).every(
        (entry) => isRecord(entry) && typeof entry.sha256 === 'string',
    );
const isReceipt = (value) =>
    isRecord(value) &&
    typeof value.registry === 'string' &&
    typeof value.ref === 'string' &&
    typeof value.commit === 'string' &&
    Array.isArray(value.bundles) &&
    value.bundles.every((bundle) => typeof bundle === 'string') &&
    isStringRecord(value.files) &&
    isExceptionRecord(value.exceptions);

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
    const name = path.basename(consumer);
    const lockPath = path.join(consumer, LOCK);
    let lock;

    try {
        lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

        if (!isReceipt(lock)) {
            throw new Error('receipt has an invalid structure');
        }
    } catch (error) {
        rows.push([name, 'invalid', '—', '—', '—', '—']);
        notes.push(
            `${name} ${LOCK}: ${error instanceof Error ? error.message : 'could not read receipt'}.`,
        );
        continue;
    }

    // Distance is measured in RELEASES, not commits: what an upgrade wave cares
    // about is how many snapshots have been cut since this one. A `worktree@<sha>`
    // ref is a pre-tag generation — real bytes, no release behind them — so it has
    // no position in that sequence. (Commit distance would be meaningless anyway:
    // the release helper commits its pinned registry.json on a throwaway branch,
    // so every snapshot tag sits one commit ahead of the main commit it names.)
    const released = tags.indexOf(lock.ref);
    const behind = released === -1 ? '—' : String(tags.length - 1 - released);

    if (lock.ref.startsWith('worktree@')) unreleased.push(name);

    let drift = 0;
    const verifyFiles = (files, label) => {
        for (const [file, expected] of Object.entries(files)) {
            const absolute = path.join(consumer, file);

            if (!fs.existsSync(absolute)) {
                drift++;
                notes.push(`${name} ${file}: ${label} file is missing.`);
                continue;
            }

            let installed;
            try {
                installed = sha256(fs.readFileSync(absolute));
            } catch (error) {
                drift++;
                notes.push(
                    `${name} ${file}: ${label} file could not be read (${error instanceof Error ? error.message : 'unknown error'}).`,
                );
                continue;
            }

            if (installed !== expected) {
                drift++;
                notes.push(
                    `${name} ${file}: ${label} file differs from its receipt.`,
                );
            }
        }
    };

    verifyFiles(lock.files, 'registry-owned');
    verifyFiles(
        Object.fromEntries(
            Object.entries(lock.exceptions).map(([file, exception]) => [
                file,
                exception.sha256,
            ]),
        ),
        'exception',
    );

    rows.push([
        name,
        lock.ref,
        behind,
        String(Object.keys(lock.files).length),
        String(Object.keys(lock.exceptions).length),
        String(drift),
    ]);

    for (const [file, exception] of Object.entries(lock.exceptions)) {
        if (exception.review && exception.review <= today) {
            notes.push(
                `${name} ${file}: divergence due for review (${exception.review}, owner ${exception.owner}).`,
            );
        }
    }
}

const header = [
    'consumer',
    'pinned ref',
    'behind',
    'locked',
    'exceptions',
    'drift',
];
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
