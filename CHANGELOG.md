# Changelog

This project follows semantic versioning; pin installs to a tag (e.g. `…/foundations#v1.0.0`).

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
