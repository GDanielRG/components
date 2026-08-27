# Maintaining

## Ownership

`registry.json` owns the install graph and file targets. `package.json` owns tooling,
dependency versions, and verification commands. Registry production code lives under
`components/`, `hooks/`, and `types/`; test substitutes live only under `tests/`.

ShadCN rewrites unregistered `@/types/*` and some relative type imports incorrectly,
so installed shared types use `@/components/*`. It also collapses a type and component
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

ShadCN does not inherit a ref through `registryDependencies`. A top-level SHA or tag
therefore does not pin nested bundles. `bun run registry:release -- <ref>` rewrites
every internal dependency to that ref, validates, builds, and smoke-tests the graph.
It refuses a dirty checkout, a source registry that is already pinned, or a ref that
already exists locally. It does not commit, tag, push, or otherwise mutate a remote.

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

The SHA suffix identifies the clean source commit before the pinned release commit.
The helper verifies that provenance. Keep pending notes under `### Unreleased`; after
publishing, backfill that heading with the exact snapshot ref in a new default-branch
commit. Published headings are frozen.

### Production

Switch to strict SemVer when any consumer can upgrade independently, including an
external consumer or a ranged pin. At that point, removed or renamed props/copy keys,
new required injected routes, and raised baselines require a major release.
