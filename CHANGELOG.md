# Changelog

The sibling workspace is **pre-production**. Shared waves now ship as immutable, dated **snapshot
tags** (`snapshot-YYYYMMDD-<short-sha>`); strict semantic versioning resumes at the
production cutover. See [docs/MAINTAINING.md](docs/MAINTAINING.md) for the two-phase
release policy. Pin installs to a snapshot tag, e.g.
`…/foundations#snapshot-20260623-<sha>`.

## Snapshots (pre-production)

### snapshot-20260818-141cfd1 — 2026-08-18

- **Fixed** the exported activity section-id union drifting when consuming apps
  run Oxfmt over registry-owned source. Its layout is now byte-stable under both
  the registry's Prettier gate and sibling format checks.

### snapshot-20260818-d67746b — 2026-08-18

- **Added** optional app-owned sections to `useCommentsDocumentsSidebar`. Consumers
  can place domain content in the shared responsive activity shell while retaining
  ownership of its id, copy, icon, content, actions, and test selectors. Existing
  comments/documents callers are unchanged.

### snapshot-20260812-4993d0b — 2026-08-12

- **Fixed** mixed select/range filter controls reordering the server-provided
  catalog, query fragments leaking into search state, and clear actions bypassing
  the consuming app's injected navigation contract.
- **Fixed** synchronous clear-then-filter visits composing from stale rendered
  state while an Inertia navigation is still pending.

### snapshot-20260811-e7750a5 — 2026-08-11

- **Updated** stable registry fixture and test dependencies, including Inertia 3.6,
  Lucide 1.31, React 19.2.8, Sonner 2.0.8, and Vitest 4.1.10.
- **Simplified** the registry-owned source-integrity test's diagnostic string
  construction while preserving its missing-file and incomplete-exception output.

### snapshot-20260810-d993d38 — 2026-08-10

- **Added** a registry-owned source-integrity Pest test to `core`. Every consumer
  now verifies its local installed bytes and declared exception pins against its
  own `registry.lock.json`, without a sibling checkout or network dependency.
- **Changed** `parity:report` to hash actual consumer files and report missing or
  changed registry-owned/exception-pinned bytes instead of reporting lock counts
  alone.
- **Added** `parity:lock --install` for narrowly scoped upgrade waves. It copies
  only registry-owned source, preserves explicit exceptions and app-owned/stock
  ShadCN files, then writes and verifies the receipt.
- **Fixed** nullable select defaults and export scope handling: a serialized
  `null` remains clearable, effective non-null defaults are displayed and submitted,
  select filters submit scalars, and multiselect filters keep array payloads.
- **Added** read-only comments/documents activity surfaces for archived resources.
  Mutation controls, uploads, typing presence, and live-update subscriptions are
  withheld while document downloads remain available.
- **Added** distinct accessible labels and stable test IDs to both range-slider
  thumbs. The search bundle now owns its slider wrapper so that contract cannot
  drift outside registry provenance.
- **Fixed** archive validation errors disappearing inside a fieldless confirmation
  modal; the first error is shown as a toast and the modal closes.
- **Added** the shared `dialog-cancel` browser-test seam to `DialogFormLayout`.
- **Changed** the `types/` contract comments to read standalone: dates-are-server-
  formatted stated in place, the `.form()` guidance no longer cites a consuming
  app, and the copy contract describes "the consuming app" generically. No type
  changes.
- **BREAKING** `useSearch` is now
  `useSearch(routeFn, { filters, only, viewControls })`, and
  `useSearchNavigation(routeFn, { only })` requires `only`. Search, sort, filter,
  and clear visits reload those props; use `only: []` for a full reload.
- **Fixed** rapid same-filter selections and filter-then-sort actions composing
  from a stale page URL while the first Inertia visit was pending. Controlled
  filter state now reads the navigation controller's effective query.
- **Changed** search visits preserve the complete Wayfinder route object, and
  applied-filter links carry `only`.
- **Changed** multi-value filters use the stock ShadCN `combobox` dependency.
  Existing props and `data-test` IDs are unchanged.
- **BREAKING** `chat-display` installs stock `message` and `bubble` primitives
  instead of shipping preset-specific copies. Reinstall the bundle and remove
  the corresponding parity exceptions.
- **Changed** `DialogFormLayout` owns its header/body/footer markup and no longer
  depends on `card`. Its title and description retain Base UI dialog semantics.
- **Added** opt-in `AppPagination` prefetch props and
  `EditHistoryPopover.employeeCacheTags`. Both use one default cache policy with
  a revalidation window.
- **Removed** unused `data-icon="icon"` attributes.
- **Added** smoke-fixture type checks for the registry's Wayfinder route
  contracts.
- **Changed** parity receipts to record the full resolved commit beside their
  human release or worktree ref.
- **Removed** `components/styles/ui-utilities.css`; ShadCN 4.15 supplies those
  utilities. Consumers remove the installed file and its CSS import.
- **Updated** stable runtime and tooling dependencies, including Base UI 1.7,
  ShadCN 4.15, `@testing-library/jest-dom` 7, Lucide 1.27, and Prettier 3.9.6.

### snapshot-20260725-1c359ef — 2026-07-25

- **BREAKING** `useSort` takes a `navigation: SearchNavigationController` instead
  of `routeFn`. Call sites change from `useSort({ routeFn: search.routeFn })` to
  `useSort({ navigation: search })`; a nested table with no `useSearch` of its own
  builds one with `useSearchNavigation(routeFn)` and passes that. `sortPath` and
  `pageParam` are unchanged. The old shape rebuilt its query from
  `usePage().url` and called `router.visit` directly, so a sort issued while a
  filter's non-blocking `replace: true` visit was still in flight superseded that
  visit and silently dropped the filter. Sharing the controller instance is the
  fix — a second controller cannot see the first one's pending visit — so this is
  deliberately a compile error at every call site rather than a silent fallback.
- **Fixed** `dialog-form-layout.tsx` header/footer padding collapsing to zero.
  It composes `CardHeader`/`CardContent`/`CardFooter` with no `Card` root, and the
  refreshed `ui/card.tsx` declares `[--card-spacing:--spacing(6)]` only on the
  `Card` root, so `[.border-b]:pb-(--card-spacing)` was invalid at computed-value
  time. Each card part now declares the variable itself.
- **Changed** `dialog-form-layout.tsx` to render the title and description
  through Base UI's `DialogTitle`/`DialogDescription` in their default `h2`/`p`
  elements instead of `CardTitle`/`CardDescription` divs, restoring the dialog's
  heading semantics and its `aria-labelledby`/`aria-describedby` wiring. Styled to
  match the previous output; no visual change.
- **Fixed** the `notifications` bundle clobbering two registry-owned primitives.
  Its `registryDependencies` listed bare `"scroll-area"` and `"spinner"`, which
  resolve to upstream shadcn and overwrote this registry's `ui/scroll-area.tsx`
  (shipped by `core`) and `ui/spinner.tsx` (shipped by `documents`) on any
  `notifications` or `foundations` install. Both now point at the owning bundles.
- **Fixed** `search-applied-filters.tsx` treating the optional `popoverState`
  prop as an open filter (`undefined !== null`), which left the applied-filters
  row permanently expanded and its collapse control dead whenever the prop was
  omitted.
- **Added** `triggerDataTest` / `itemDataTestPrefix` to `ColumnHeaderMenu`,
  matching `ColumnVisibilityMenu`'s existing seam, so browser tests can select the
  fleet's canonical sort control and its asc/desc/hide items.
- **Removed** the unused `useDocumentsSidebar` hook from
  `activity/comments-documents-sidebar.tsx` and the `activity` barrel. It had zero
  consumers across all seven siblings; `useCommentsDocumentsSidebar` is untouched.

### snapshot-20260724-ee60d86 — 2026-07-24

- **Added** optional two-thumb slider and calendar-range presentations to the
  shared range filter. Existing paired inputs remain the default. Slider
  definitions opt in with `control: 'slider'`, can prefix displayed values
  through `valuePrefix`, and expose a shared accessible label to both thumbs.
  Date definitions (`inputType: 'date'`) render the calendar range picker.
- **Changed** the search bundle dependencies to include its new stock shadcn
  `slider`/`calendar` primitives plus `date-fns` and `react-day-picker`.

### snapshot-20260720 — 2026-07-20

- **Added** definition-driven paired range controls (`date`/`number`) and
  top-level query-scoped selects with defaults to the shared search system.
  `SearchFilterControls` lets public discovery pages reuse the same controls
  when free-text search already lives elsewhere. Existing multiselect/select
  definitions keep their previous defaults and markup.

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
  No sibling declares it directly, but it was also added to `foundations`'
  `registryDependencies` in this same wave, so an install-everything `foundations`
  install did pull it — and, until the 20260724 fix below, clobbered this registry's
  `ui/scroll-area.tsx` and `ui/spinner.tsx` with upstream shadcn copies.
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
