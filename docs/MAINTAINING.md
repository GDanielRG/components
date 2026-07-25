# Maintaining

## Source

The root `registry.json` is the only registry manifest. It currently defines 13 items: 12
consumption bundles (`core`, `archive`, `edit-history`, `sidebar`, `search`, `table`, `comments`,
`documents`, `activity`, `chat-display`, `chat`, `notifications`) plus `foundations` (installs the
full shared foundation). Treat the manifest as the live inventory rather than maintaining a second
authoritative list in prose.

Keep shared-type imports under `@/components/*`. ShadCN rewrites unregistered `@/types/*` imports and
some relative type imports incorrectly during installation.

A registry `types/*` file must not share a basename with a component in the same install (e.g. a
`types/edit-history.ts` next to `components/edit-history.tsx`). ShadCN's import rewriter collapses the
two same-named modules and points the component's type import at itself, surfacing on install as a
`Circular definition of import alias` / `declares X locally, but it is not exported` tsc error. Name
the type file distinctly (`types/edit-history-entry.ts`).

Keep app-owned imports limited to:

- `@/hooks/use-shared-component-copy`
- `@/components/app-right-sidebar`
- the standard ShadCN `@/lib/utils`

## Verify

```sh
npm run registry:check  # format, official schema validation, build
npm test                # pure utility tests
npm run smoke           # real aligned-baseline install, type-check, reinstall
npm run parity:report   # which consumer is pinned where (advisory, always exits 0)
```

The smoke test installs the working tree, retains stock ShadCN and npm dependencies, verifies the
app-owned contracts are untouched, type-checks the installed result, and proves a reinstall is
byte-identical.

## Release

The release helper pins every internal registry dependency in `registry.json` to one immutable ref,
validates, builds, and smoke-tests the pinned graph. ShadCN does not inherit a ref across
`registryDependencies`, so pinning the whole graph to a single pre-known ref is what makes a nested
install reproducible — a bare `main` commit SHA does **not** (on `main`, internal deps carry no ref,
so `…/foundations#<main-sha>` resolves each nested bundle against the default branch, not `<sha>`).

Commit and tag that pinned registry on a throwaway release branch; keep `main` with bare internal
dependencies. Treat any published ref as immutable: never re-point or delete it — ship fixes as a new
ref. The helper does not tag or push; the maintainer owns git.

The fleet is **pre-production** — every consumer is an in-house sibling that pins an exact ref and
reinstalls deliberately. The release policy has two phases.

### Pre-production (now): immutable snapshots

Cut a dated, immutable **snapshot tag** for each shared wave instead of a semantic version (strict
SemVer's MAJOR signal is inert while no consumer upgrades independently):

```sh
npm run registry:release -- snapshot-20260623-1a2b3c4
```

Use the format `snapshot-YYYYMMDD-<short-source-sha>`. Two waves can land on the same date, so the
date alone does not identify a release — the SHA is what makes the tag unique, and it is also what
the heading in `CHANGELOG.md` needs.

That SHA cannot be known while the notes are being written (it is the SHA of the commit those notes
describe), so pending notes accumulate under `### Unreleased` and the heading is **backfilled** on
`main` in the next commit after the tag is pushed. Never append to a heading that names an
already-published tag: those notes are frozen with the ref. This file's own history shows both
failure modes — a "Pending" catch-all that drifted past two releases, and date-only headings that
cannot tell two same-day waves apart.

Record the synced ref in each sibling's
`registry.lock.json` (below), **not** in `components.json` — its `registries` block configures
namespaced URL templates, not an install lock. Keep a `## Snapshots` note in `CHANGELOG.md`
describing each wave (and flag breaking changes loudly, since a snapshot tag carries no SemVer
signal).

### Consumer parity locks

Installed registry files are never hand-edited, so the invariant is byte identity. After a wave,
write each consumer's receipt from the snapshot you just cut:

```sh
npm run parity:lock -- ../amnsa ../grupo-3t --ref snapshot-20260623-1a2b3c4
```

Hashes always come from the registry, never from the consumer's own files — hashing what a consumer
already has would bless its fork into the receipt. Omitting `--ref` hashes the working tree instead
and records `worktree@<sha>` (plus `+dirty` when this tree is dirty), which is what an agent
propagating an unreleased change uses; the `worktree@` prefix is what each consumer's CI gate
rejects, so it can never masquerade as a snapshot. A consumer's first lock needs `--bundles`; after
that the declared bundles and any exceptions carry forward.

Each consumer enforces its own lock in its own suite (`tests/Unit/RegistryParityTest.php`), so no
consumer's CI needs this checkout. `npm run parity:report` is the workspace-level counterpart: which
consumer sits on which ref, how many releases behind, and which declared divergences are due for
review. It is advisory and always exits 0 — a fresh release must not redden every consumer before
its wave reaches them.

### Production (later): semantic versioning

Switch to strict SemVer the first time any consumer upgrades independently — a sibling ships, an
external app consumes the registry, or anyone pins a _range_ instead of an exact ref. Cut a clean
stabilization MAJOR at that point. From then on, removing or renaming a prop or copy key, adding a
required injected route, or raising the supported baseline is a breaking (MAJOR) change. Until then,
no SemVer tags are minted beyond the inaugural `v1.0.0`.
