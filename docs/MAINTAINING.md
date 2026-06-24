# Maintaining

## Source

The root `registry.json` is the only registry manifest. It defines nine items — eight consumption
bundles (`core`, `archive`, `sidebar`, `search`, `table`, `comments`, `documents`, `activity`) plus
`foundations` (installs them all) — and references source files under `components/`, `hooks/`, and
`types/`.

Keep shared-type imports under `@/components/*`. ShadCN rewrites unregistered `@/types/*` imports and
some relative type imports incorrectly during installation.

Keep app-owned imports limited to:

- `@/hooks/use-shared-component-copy`
- `@/components/app-right-sidebar`
- the standard ShadCN `@/lib/utils`

## Verify

```sh
npm run registry:check  # format, official schema validation, build
npm test                # pure utility tests
npm run smoke           # real aligned-baseline install, type-check, reinstall
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

Use the format `snapshot-YYYYMMDD-<short-source-sha>`. Record the synced ref in the sibling's sync
commit message (e.g. `chore(registry): sync foundations @ snapshot-20260623-1a2b3c4`), **not** in
`components.json` — its `registries` block configures namespaced URL templates, not an install lock.
Keep a `## Snapshots` note in `CHANGELOG.md` describing each wave (and flag breaking changes loudly,
since a snapshot tag carries no SemVer signal).

### Production (later): semantic versioning

Switch to strict SemVer the first time any consumer upgrades independently — a sibling ships, an
external app consumes the registry, or anyone pins a _range_ instead of an exact ref. Cut a clean
stabilization MAJOR at that point. From then on, removing or renaming a prop or copy key, adding a
required injected route, or raising the supported baseline is a breaking (MAJOR) change. Until then,
no SemVer tags are minted beyond the inaugural `v1.0.0`.
