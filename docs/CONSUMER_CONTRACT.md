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

## Installed provenance

`registry.lock.json` records the human release `ref`, its full resolved `commit`,
and hashes of registry-owned files. The ref identifies the upgrade wave; the commit
keeps that receipt unambiguous if a local alias or tag later resolves differently.

The core bundle installs `tests/Unit/RegistrySourceIntegrityTest.php`. It reads only
the consumer's local receipt and source files: no sibling checkout, network request,
or moving registry branch is part of the consumer test gate. Registry-owned files
must remain byte-identical to the receipt. A deliberate app-specific fork belongs
under `exceptions`, pinned by SHA-256 and documented with a reason, owner, and review
date.

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

Pass the same navigation instance to `useSort`; it owns the effective query while an
Inertia visit is pending. A hand-built `SearchNavigationController` must expose `only`
and apply it in `visit`.

## Prefetch invalidation

`AppPagination` prefetching is opt-in. Its default cache policy has a revalidation
window; a scalar Inertia `cacheFor` value does not. Name prefetched resources with
`cacheTags` and invalidate those tags after writes. `EditHistoryPopover` accepts
`employeeCacheTags` for the same reason.

## Live comment updates

The activity sidebar owns the comments/documents shell and accepts
`renderCommentLiveUpdates({ enabled })`. Consumers keep broadcast clients, generated
channel helpers, and Echo/Reverb hooks app-owned. The sidebar passes `enabled=false`
while a comment draft is being created or edited so a remote reload cannot replace
local input. Pass `readOnly` for archived or otherwise immutable resources; the
sidebar then withholds comment/document mutations, upload controls, typing presence,
and live-update subscriptions while retaining download access.
