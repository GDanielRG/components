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

`bun run parity:report` is an advisory workspace report and always exits successfully.
It hashes each consumer's installed registry-owned and exception-pinned files against
that consumer's receipt, so a zero-exception row cannot conceal undeclared edits. The
installed `RegistrySourceIntegrityTest` is the blocking local counterpart.

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

### Consumer parity

Write each consumer receipt from the published snapshot:

```sh
bun run parity:lock -- ../amnsa ../grupo-3t --ref snapshot-20260726-1a2b3c4
```

During an upgrade wave, add `--install` to copy only the declared bundles'
registry-owned files before the receipt is written. It deliberately does not
overwrite stock ShadCN primitives or app-owned seams, and it preserves explicit
exceptions:

```sh
bun run parity:lock -- ../amnsa ../grupo-3t --ref snapshot-20260726-1a2b3c4 --install
```

Hashes come from the registry, never the consumer files. Omitting `--ref` records a
`worktree@<sha>` receipt for unreleased propagation; consumer CI rejects that form.
With `--ref`, pass either an exact annotated snapshot/SemVer tag or a full 40-character
commit SHA; moving names such as `main` and `HEAD` are rejected. Every receipt stores
both its human `ref` and the full resolved `commit`. For a worktree receipt, `commit`
is the current full HEAD while file hashes represent the working tree. The first
receipt needs `--bundles`; later runs retain declared bundles and explicit exceptions.

The source-integrity test is itself registry-owned and locked. Installing `core`
therefore restores both the shared source and the local invariant that protects it;
consumers do not maintain copied parity-test logic by hand.

### Production

Switch to strict SemVer when any consumer can upgrade independently, including an
external consumer or a ranged pin. At that point, removed or renamed props/copy keys,
new required injected routes, and raised baselines require a major release.
