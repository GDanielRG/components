# Changelog

The fleet is **pre-production**. Shared waves now ship as immutable, dated **snapshot
tags** (`snapshot-YYYYMMDD-<short-sha>`); strict semantic versioning resumes at the
production cutover. See [docs/MAINTAINING.md](docs/MAINTAINING.md) for the two-phase
release policy. Pin installs to a snapshot tag, e.g.
`…/foundations#snapshot-20260623-<sha>`.

## Snapshots (pre-production)

### Pending — next snapshot

Everything on `main` since the `v1.1.0` entry below, awaiting a `snapshot-*` tag. Cut it
with `npm run registry:release -- snapshot-YYYYMMDD-<short-sha>` (maintainer tags/pushes).

- **Added** the `archive` bundle and folded it into `foundations`: `ArchivedStatusBadge`,
  `ArchiveConfirmationModal`, and `ArchiveConfirmationForm` — the Form + modal pairing that
  mirrors `DestroyConfirmationForm` (archive reuses the DELETE route).
- **Comments:** the `Comment` type and `comment-list` now read a uniform
  `author?: { name, avatar }` shape and fall back to the legacy `employee.user.name`, so
  Employee-authored and User-authored comment surfaces share one component. Backward
  compatible — existing consumers that emit `employee` need no backend change.
- **Rebuilt** `comments-documents-sidebar` from primitives and reworked the `search` bundle.
- ⚠ **Breaking (frontend contract)** carried on `main` since `v1.1.0` — a snapshot tag has no
  SemVer signal, so adopt these explicitly in any fresh consumer (all siblings already have):
  `onClose → onToggle`; search renames `reset → clearAll`, `controls → viewControls`,
  `SearchViewControl → SearchClearControl`, `buildResetPatch → buildClearAllPatch`, and the
  `showAppliedFilters` boolean → a `children` slot; `AppRightSidebarCloseButton` dropped from
  the app-owned export contract; the `archive` bundle requires new `ArchiveCopy` copy keys.

## Semantic versions (historical, pre-production)

> These early `v1.x` labels predate the snapshot policy. `v1.0.0` is the only minted git tag;
> `v1.1.0` was documented but never tagged. Kept for provenance.

## v1.1.0 — 2026-06-12 (documented, not tagged)

- Added the `sidebar` consumption bundle (`components/ui/sidebar.tsx` +
  `hooks/use-mobile.ts`): provider with keyboard-shortcut and mobile
  overrides, sheet-based mobile rendering, and the menu/rail/inset family.
  The `activity` bundle now depends on `GDanielRG/components/sidebar` instead
  of the bare shadcn `sidebar` primitive.
- Removed UMD-global React reliance in `documents` and `search` components:
  `documents-list`, `document-item`, `documents-panel-item`,
  `documents-form-section`, and `faceted-filters` now use explicit named
  `react` type imports.
- `scroll-area` is now registry-owned: shipped in `core` as
  `@ui/scroll-area.tsx` (the fleet's Base UI implementation, without the
  unused `import * as React` that upstream shadcn still carries).
  `comments`/`documents`/`activity` no longer declare the upstream shadcn
  `scroll-area` registryDependency — the file resolves transitively through
  `core`.
- Hardened the install smoke test: the fixture-consumer tsconfig now enables
  `noUnusedLocals`/`noUnusedParameters`, matching the consuming apps, so the
  registry CI catches the unused-symbol class that previously had to be
  filtered downstream.

## v1.0.0 — 2026-06-08

Inaugural consolidated release.

- Consolidated to 7 consumption bundles: `core`, `search`, `table`, `comments`, `documents`,
  `activity`, and `foundations` (= all six).
- Routed all shared-type imports through `@/components/*`, fixing shadcn's install-time import
  corruption (guarded by the install smoke test).
- The registry now owns its `Document` / `Comment` / route types, dropping the `@/types` and
  generated-Wayfinder install requirements.
- The registry owns the Inertia-aware pagination primitive and its collision-free paginated-data
  contract.
- **Breaking** (vs the pre-v1 file-synced sources): document components inject resource routes
  (`store` / `update` / `destroy` / `show`), matching comments — pages rendering documents must
  pass these factories.
- Runtime Inertia/Lucide dependencies are versioned against the supported baseline.
- Reproducible tag-pinned bundle graphs, official schema validation, unit tests, and a real
  dependency-resolving install smoke that type-checks and reinstalls byte-identically.
