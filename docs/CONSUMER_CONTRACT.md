# Consumer contract

This registry targets the Laravel, Inertia, Base UI, and ShadCN stack declared in
`package.json` and `registry.json`. Those manifests, not this document, own dependency
versions and bundle contents.

## App-owned seams

Consumers provide:

- `components.json` aliases for `@/components`, `@/components/ui`, `@/hooks`, and
  `@/lib/utils`;
- a TypeScript `@/*` alias resolving to `resources/js/*`;
- `@/lib/utils` exports for stock ShadCN `cn` and the fleet's `toUrl(href)` resolver;
- `@/hooks/use-shared-component-copy`, returning the installed
  `SharedComponentCopy` contract; and
- the controlled `AppRightSidebar` export at `@/components/app-right-sidebar`.

Locale and shell styling vary by app, so registry installs never own or overwrite
these seams.

## Injected routes

Comments receive `storeCommentForm`, `updateCommentForm`, and
`destroyCommentForm`. Documents receive `storeDocumentAction`,
`updateDocumentAction`, `destroyDocumentAction`, and `showDocumentAction`.

Pass generated Wayfinder controller actions into those props. Registry components
depend on the installed structural route types and never import a consumer controller.

## Search navigation

`useSearch(routeFn, { filters, only })` and
`useSearchNavigation(routeFn, { only })` require the page props owned by the query:
the collection, filter catalogue, and query-derived counters. Search, sort, filter,
and clear visits reload only those props. Use `only: []` when a full reload is
intentional.

Pass the same `SearchNavigationState` instance to `useSort`; it owns the effective
query while an Inertia visit is pending. Both navigation hooks return this state.
A hand-built navigation state must expose `effectiveQuery` and `only`, and apply
`only` in `visit`.

`SearchAppliedFilters` accepts `additionalAppliedCount` for app-owned filters. The
app renders those chips and includes their removal through `useSearch`'s
`viewControls` (or its own `clearAllPatch`); the
shared component includes their count in its total and keeps the clear action
available when they are the only active filters.

## Prefetch invalidation

`AppPagination` prefetching is opt-in and follows Inertia's native cache duration. Name
prefetched resources with `cacheTags` and invalidate those tags after writes.
`EditHistoryPopover` accepts `employeeCacheTags` for the same reason. The comments and
documents mutation surfaces accept `invalidateCacheTags` and forward the app-owned tag
or tag set to Inertia; the registry owns no tag vocabulary or invalidation policy.

## Live comment updates

The activity sidebar owns the comments/documents shell and accepts
`renderCommentLiveUpdates({ enabled, visible })`. Consumers keep broadcast clients,
generated channel helpers, and Echo/Reverb hooks app-owned. The sidebar passes
`enabled=false` while a comment draft is being created or edited, or a comment
deletion is in flight, so a remote reload cannot replace local input; an edit whose
row disappears from `comments` is dropped so updates never stay paused without an
editor. `visible` is true while the sidebar is open on the comments tab, letting
consumers scope periodic reads to the visible surface while a subscription stays
mounted. Pass `readOnly` for archived or otherwise immutable resources; the
sidebar then withholds comment/document mutations, upload controls, typing presence,
and live-update subscriptions while retaining download access.

## Additional activity sections

`useCommentsDocumentsSidebar` accepts optional `additionalSections` for app-owned
domain content that should share the comments/documents shell. Each descriptor owns
its stable id, label, Lucide icon, content, optional count, footer, header action, and
test selectors. As with the built-in comments and documents sections, count badges are
shown only for positive counts. A positive count also participates in the sidebar's
default-open and initial-section selection after comments and documents; an explicit
`defaultOpen` still takes precedence. The registry keeps responsive sidebar state, tab
switching, scrolling, and presentation consistent without adding domain-specific copy
or icons to the shared contract. Existing consumers that only use comments and
documents require no changes.
