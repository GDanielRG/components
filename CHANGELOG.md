# Changelog

This project follows semantic versioning; pin installs to a tag (e.g. `…/foundations#v1.0.0`).

## v1.1.0 — 2026-06-12

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
