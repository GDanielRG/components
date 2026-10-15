// braces has no patched release for GHSA-vfj7-8cjw-p6xm; from 00:00 UTC on
// 2026-11-05 the audit runs unfiltered again.
import { spawnSync } from 'node:child_process';

const args = ['audit'];
if (Date.now() < Date.UTC(2026, 10, 5))
    args.push('--ignore=GHSA-vfj7-8cjw-p6xm');

const { status, error } = spawnSync('bun', args, { stdio: 'inherit' });
if (error) throw error;
process.exit(status ?? 1);
