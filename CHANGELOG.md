# Changelog

The sibling workspace is **pre-production**. Shared waves now ship as immutable, dated **snapshot
tags** (`snapshot-YYYYMMDD-<short-sha>`); strict semantic versioning resumes at the
production cutover. See [docs/MAINTAINING.md](docs/MAINTAINING.md) for the two-phase
release policy. Pin installs to a snapshot tag, e.g.
`…/foundations#snapshot-20260623-<sha>`.

## Snapshots (pre-production)

### snapshot-20260716 — 2026-07-16

- **Added** a `'featured'` named trigger icon (`StarIcon`) to `ServerSearchFilter.icon`
  alongside `'archive'`, and taught `faceted-filters.tsx` (multiselect chips) the same
  named-icon + `hideLabel` trigger treatment `select-filter.tsx` already had: a named
  icon stays visible regardless of selection state, and `hideLabel` renders an icon-only
  trigger with the label as `aria-label`. Non-breaking — filters without `icon`/`hideLabel`
  render exactly as before.

- **Added** a shared `notifications` bundle (`notification-bell.tsx`,
  `notification-center.tsx`, `notification-popover-content.tsx`, `types.ts`): bell
  trigger + popover-list notification-center primitives, staged ahead of their first
  consumer — the notification-center product feature itself remains parked post-v1.
  Non-breaking (a new bundle; nothing installs it implicitly).
- **Changed** `ui/pagination.tsx`: deduplicated the `disabled`/`text` prop
  declarations on `PaginationPrevious`/`PaginationNext` (both already carried by
  `PaginationLink`'s props) and added the carried-customization note (links render
  through Inertia's `<Link>`; keep Base UI's default `nativeButton`). Type-level
  cleanup only; non-breaking.
- **Added** `data-slot="spinner"` to `ui/spinner.tsx`, matching the registry's
  slot-attribute idiom. Non-breaking.
- **Changed** `styles/ui-utilities.css`: re-vendored verbatim from upstream shadcn
  `packages/shadcn/src/tailwind.css` (2026-07 refresh), now including `no-scrollbar`
  alongside `scroll-fade`/shimmer. Existing class names unchanged; consumers pick up
  the refresh on their next install. Non-breaking.

### snapshot-20260710 — 2026-07-10

- **BREAKING** `SearchCopy` gains a REQUIRED `searchSubmit: string` key (the icon-only
  search-submit button's accessible name). Every consumer's `useSharedComponentCopy`
  implementation must add the key when installing this snapshot, or `tsc` fails.
- **Added** accessible names to icon-only registry controls: `search.tsx` submit button
  (`aria-label={copy.searchSubmit}`) and `table/row-actions-cell.tsx` trigger (moved
  from an `sr-only` span outlier to `aria-label={resolvedTriggerLabel}`, matching the
  registry idiom).

### snapshot-20260709-8de8ea9 — 2026-07-09

Backfilled — this content shipped in this snapshot but was never split out of the
"Pending" catch-all at the time; recorded now so history reflects the actual tagged ref.

- **Fixed** the icon-only clear-filters trigger (`search-applied-filters.tsx`) carried
  no accessible name; added `aria-label={copy.searchClearFilters}`, matching the other
  icon-only search triggers.
- Otherwise a dependency refresh only (`package-lock.json`); no registry contract
  changes.

### snapshot-20260707-34e6ed7 — 2026-07-07

Backfilled — same drift as above: this content was already cut into this snapshot tag
but stayed listed under "Pending" past its own release.

- **Changed** `SearchControls` filter disclosure to the unset-count rule: the "Filters"
  latch renders only while **more than one unset (inactive) filter** exists; with exactly
  one unset filter it renders inline immediately (no slide-in on initial render — the
  `starting:` transition is now conditioned on a latch-triggered reveal). Disclosure stays
  sticky per pageview. No data-test hook changes, but single-filter surfaces stop
  rendering `@search-filters-disclosure-trigger` entirely — Browser tests that clicked the
  latch on a lone filter must assert the inline filter (and the trigger's absence) instead.
- **Added** owned Tailwind v4 utilities (`components/styles/ui-utilities.css`, shipped by
  `core` as a `registry:file` targeting `resources/css/ui-utilities.css`; consumers add a
  one-line `@import './ui-utilities.css';` after the `shadcn/tailwind.css` import). Hand-authored
  because our installed `shadcn@4.11.0/tailwind.css` ships only `@utility no-scrollbar`. Provides
  `scroll-fade`/`scroll-fade-y`/`-x`, logical RTL-safe `scroll-fade-s`/`-e` (+ `-t`/`-b`,
  `-none`, and `scroll-fade-<n>` size knobs) — a static base `mask-image` (graceful degradation)
  modulated by `animation-timeline: scroll()` (~14px default fade, smaller than upstream's ~40px
  so the cue stays subtle); the scroll-aware layer is wrapped in
  `@media (prefers-reduced-motion: no-preference)` so reduced motion pins to the static
  base. Also `shimmer` (+ `shimmer-once`/`-reverse`/`-none` and `-duration`/`-spread`/`-angle`/
  `-color` knobs), a `background-clip: text` highlight that disables under
  `prefers-reduced-motion: reduce`.
- **Added** `fadeEdges` to `components/ui/scroll-area.tsx` (`boolean | 'y' | 'x'`, default
  `false`) — masks the Viewport's edges with `scroll-fade-y`/`-x` as an overflow-more cue.
  `fadeEdges` defaults off so existing scroll areas stay byte-identical until a surface opts in.
  Generic `DialogFormLayout` bodies intentionally do **not** fade: form dialogs hold focus rings,
  validation text, and full-width table controls, so masking the padded scroll body is too broad.
- **Added** two chat bundles, split along the `@shadcn/react` boundary:
    - **`chat-display`** (consumer-safe; folded into `foundations`) — the `message`/`bubble`/
      `attachment`/`marker` primitives (`registry:ui`) and `TimestampWithReveal`
      (`registry:component`). Depends on `GDanielRG/components/core` (`cn`, `use-sidebar-sheet`)
      plus `button`/`popover`/`tooltip`; npm deps are only `@base-ui/react` + `class-variance-authority`
      (already shared across consumers). It imports **no** `@shadcn/react`, so `comments`/`documents` can rebuild
      on these primitives without leaking the pre-1.0 package into every repo.
    - **`chat`** — the `MessageScroller` family (`registry:component`) + the `chat/index.ts`
      barrel. This is the only bundle that pulls `@shadcn/react@0.1.0` (`shadcn add` rewrites the
      pin to a caret downstream). `activity` now depends on it because the comments sidebar uses the
      sticky-bottom scroller and scroll-to-latest control; display-only consumers can still install
      `chat-display` without the pre-1.0 package.
- **Rebuilt** the comments and documents surfaces on the `chat-display` primitives, behaviour-
  preserving (every `data-test` id retained): `comment-list` now composes `MessageGroup`/`Message`/
  `MessageAvatar`/`MessageContent`/`MessageFooter` with `Bubble`/`BubbleContent`,
  `TimestampWithReveal`, optional avatars, current-user alignment, and render hooks for scroller
  item/container composition. Document rows (`documents-panel-item`, `document-item`,
  `pending-document-item`) render on the `Attachment` family with upload `state`
  (idle/uploading/processing/error/done) driving the visual (the title auto-shimmers while
  uploading/processing). The old `sidebar-document-upload-card` is replaced by inline pending file
  rows plus a compact `DocumentUploadStatus` control. `comments` and `documents` now depend on
  `GDanielRG/components/chat-display` (and dropped the now-unused `item`; `documents` also dropped
  `card`/`popover` and added `spinner`). The activity sidebar composes `MessageScroller` directly
  for comments, reverses latest-first server data into chronological display, starts at the latest
  comment, and exposes a scroll-to-latest button. Live broadcast subscribers remain app-owned and
  are injected via `renderCommentLiveUpdates`, so generated Wayfinder/Reverb types never enter the
  registry component. A new jsdom render-level regression test (`tests/render`, run by `npm test`)
  mounts the real rebuilt components and asserts the data-test ids, the `can_be_managed`
  edit/delete gating, and the document state mapping — the behavioural gate (smoke proves
  install-determinism only).
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
  `@ui/scroll-area.tsx` (the registry's Base UI implementation, without the
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
