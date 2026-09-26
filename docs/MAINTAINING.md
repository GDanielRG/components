# Maintaining

## Ownership

`registry.json` owns the install graph and file targets. `package.json` owns tooling,
dependency versions, and verification commands. Registry production code lives under
`components/`, `hooks/`, `lib/`, and `types/`; test substitutes live only under `tests/`.

ShadCN rewrites imports that resolve outside the configured aliases, such as
`@/types/*` and `@/wayfinder/*`, and some relative type imports incorrectly, so
installed shared types use `@/components/*` and registry files never import a
consumer's generated Wayfinder modules. It also collapses a type and component
with the same basename in one install, producing a circular import alias. Distinct
names such as `types/edit-history-entry.ts` avoid that external rewriter behavior.

Consumer-owned seams and injected routes are defined in
[`CONSUMER_CONTRACT.md`](CONSUMER_CONTRACT.md).

## Verify

```sh
bun install
bun outdated
bun run format:check
bun run test
bun run registry:check
bun run smoke
```

The smoke test installs the working tree into the aligned fixture, retains stock
ShadCN files and package dependencies, checks app-owned seams, runs `tsc --noEmit`, and
proves a reinstall is byte-identical. This is the repository's real type check;
Vitest transpiles TypeScript without checking it. Wayfinder compatibility declarations
therefore live in `tests/fixture-consumer/resources/js/wayfinder-contract.ts`.

## Release

Published refs are immutable. Never move or delete one; release a new ref instead.
The default branch keeps bare internal registry dependencies.

ShadCN does not inherit a ref through `registryDependencies`; an unpinned internal
dependency resolves at the default branch. `bun run registry:release` therefore
produces a release commit whose items inline every internal dependency's files,
package dependencies, and stock registry dependencies, then validates, builds, and
smoke-tests it. Any item installed at that commit, by tag or by full commit SHA,
reads only that commit. The helper refuses a dirty checkout or a registry that is
already released, and never commits, tags, or pushes.

Consumers pin the release commit's full 40-character SHA, the reproducible form
ShadCN uses directly without resolving a ref.

### Pending pins

Unmerged work that consumers must install gets a pin commit instead of a tag:

```sh
git switch -c release/pin-1a2b3c4 1a2b3c4
bun run registry:release -- --pin
git add registry.json
git commit -m "release pin-1a2b3c4"
git push origin release/pin-1a2b3c4
git switch -
```

Keep the pin branch until no consumer records its SHA. When the source merges, cut a
snapshot from the merged default branch. Then run
`bun run registry:drift -- --ref <snapshot-commit-sha> <consumer>...`. A consumer
with no drift only updates its recorded ref; any other consumer reinstalls at the
snapshot and reviews the result.

### Pre-production snapshots

Use `snapshot-YYYYMMDD-<short-source-sha>` while every consumer is an in-house sibling
pinning exact refs:

```sh
git switch -c release/snapshot-20260726-1a2b3c4
bun run registry:release -- snapshot-20260726-1a2b3c4
git add registry.json
git commit -m "release snapshot-20260726-1a2b3c4"
git tag -a snapshot-20260726-1a2b3c4 -m "snapshot-20260726-1a2b3c4"
git push origin snapshot-20260726-1a2b3c4
git switch main
```

The SHA suffix identifies the clean source commit before the release commit.
The helper verifies that provenance. Keep pending notes under `### Unreleased`; after
publishing, backfill that heading with the exact snapshot ref in a new default-branch
commit. Published headings are frozen. Snapshots cut before inlining pin their
internal dependencies to the tag name instead; they remain valid.

### Drift

`bun run registry:drift -- [--ref <ref>] [--items a,b] [--diff] <consumer>...`
installs the recorded items from the ref into a scratch copy of each consumer,
passes the installed files and the consumer's copies through the consumer's own
formatter, and exits non-zero when a registry-owned file differs or is missing. It
only reads the consumer checkout. Without flags it uses the consumer's recorded pin;
the ref must exist in this checkout. Unpinned internal dependencies are read at the
requested ref. `shadcn add --dry-run --diff` is not a substitute: it exits zero when
files differ and does not apply the consumer's formatter.

### Production

Switch to strict SemVer when any consumer can upgrade independently, including an
external consumer or a ranged pin. At that point, removed or renamed props/copy keys,
new required injected routes, and raised baselines require a major release.
