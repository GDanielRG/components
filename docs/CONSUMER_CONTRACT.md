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

## Registry pin

Record the installed release in `package.json`:

```json
"componentsRegistry": {
    "ref": "<full release commit SHA>",
    "items": ["foundations", "realtime", "design-lint"],
    "local": []
}
```

`ref` is the release commit every item was installed from; `items` are the items
installed at it. `local` lists registry-owned files the app intentionally adapts, by
path from the app root; `bun run registry:drift` reports them without failing. Update
the record with every reinstall. `components.json` cannot hold it: ShadCN rejects
unknown keys there, and its `registries` accept only URL templates serving built items.

## Dialog forms

`DialogFormLayout` supplies a padded header, a scrolling body, and an optional
footer. Its title and description inherit the installed dialog primitives' styles.

Use `DialogFormContent` around the form. It owns the viewport height bound,
flex column, clipped outer overflow, zero outer padding, and omission of the
primitive's duplicate close button. `DialogFormLayout` owns section padding and
the visible close action. Consumers choose width through `className` and keep
normal dialog props, refs, focus handling, and callbacks.

Any intervening form or wrapper still needs `flex min-h-0 flex-1 flex-col` so the
body can shrink and scroll while the header and footer stay visible. Plain dialogs,
settings shells, and other compositions keep `DialogContent` when they need its
padding or default close control.

The `design-lint` registry item allows `max-h-[calc(100dvh-2rem)]` only in
`dialog-form-content.tsx`; it reserves one rem above and below the popup. Install
its updated config with the component. Layout checking stays enabled elsewhere.

## Design lint contracts

Install `design-lint`, import `./shared-component-lint.json` in `vite.config.ts`,
and include that object in `lint.extends`. It owns only file-scoped allowances for registry compositions;
keep rule severity, app-specific contracts, and global design policy in the app.
Update the config with the components that need it. Oxlint rule options replace
rather than merge, so an app override for the same file must retain its shared contract.

## Compact editors and state cues

`EmptyCard` adds the outline width that the installed `Empty` leaves to its caller.
Unset filter triggers use a dashed border. Range/select popovers use `gap-3`;
attachment metadata editors use `gap-2`. These are scoped composition contracts,
not changes to full-form spacing. Consumers enforcing `shadcn/no-restyle` permit
these exact utilities only in the owning component files.

Clear-filter and column-reset actions retain the neutral ghost variant: they
reset a reversible view and do not delete application data.

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
`renderCommentLiveUpdates({ enabled, visible })`; render `RealtimeUpdates` from the
`realtime` item there with that state spread onto it. The sidebar does not depend on
the realtime item. It passes `enabled=false` while a comment draft is being created
or edited, or a comment delete request is in flight, so a remote reload cannot
replace local input; an edit whose row disappears from `comments` is dropped so
updates never stay paused without an editor. `visible` is true while the sidebar is
open on the comments tab, letting consumers scope periodic reads to the visible
surface while a subscription stays mounted. Pass `readOnly` for archived or otherwise immutable resources; the
sidebar then withholds comment/document mutations, upload controls, typing presence,
and live-update subscriptions while retaining download access.

## Realtime client

Install `realtime` beside `foundations` to share the live-update client:
`configureRealtimeEcho`, `useRealtimeFeature`, `RealtimeUpdates`, and
`useCommentTypingPresence`. It is opt-in and declares versioned `@laravel/echo-react`,
`laravel-echo`, `pusher-js`, and `@inertiajs/*` ranges. ShadCN writes versioned ranges
into `package.json` even when the app already declares the package, so review the
manifest after every install and keep any higher floor the app has adopted.

The client reads the app's shared `realtime` prop and `auth.user.id` through the
Wayfinder-generated `InertiaConfig['sharedPageProps']` declaration.
`realtime.connection` is `{ key, host, port, scheme }` or `null`; each
`realtime.features` entry is `{ transport, pollIntervalMs }`, where `transport` is
`reverb`, `poll`, or `manual`, and `pollIntervalMs` is milliseconds or `null`. A
`manual` transport or a `null` interval disables automatic refresh: `RealtimeUpdates`
renders nothing. Typing presence requires a `comments` feature. The
backend that serves this prop, authorizes channels, and broadcasts events stays
app-owned.

Call `configureRealtimeEcho` once when creating the Inertia app. Error responses can
omit shared props, so read the connection defensively:

```tsx
withApp(app, { page }) {
    configureRealtimeEcho(page.props.realtime?.connection ?? null);
    // ...
}
```

A `null` connection configures Echo's null broadcaster.

Registry files never import generated Wayfinder modules, because ShadCN rewrites
`@/wayfinder/*` imports into unresolvable paths. `RealtimeUpdates` and
`useCommentTypingPresence` therefore accept channel, event, and cache-tag strings.
Build those values from the generated `BroadcastChannels` and `BroadcastEvents` and
the app's closed cache tags in an app-owned seam, such as a map of commentable
resources, so the closed sets stay typed where they are chosen. Channel names omit
Echo's `private-` and `presence-` prefixes. Presence authorization returns `user_id`,
`name`, and `avatar`; other member fields are ignored.

`RealtimeUpdates` reloads `only` after a broadcast, a successful Reverb subscription,
or a return to the visible tab. While `enabled` and `visible`, it polls every
`pollIntervalMs` until it is subscribed to Reverb, then reconciles every minute (or
every `pollIntervalMs`, if longer), so a change whose broadcast was never published
still appears. Reads are debounced and never overlap. When `enabled` becomes false,
an in-flight read is cancelled and replayed once it is true again.
`invalidateCacheTags` are flushed after a read that changes the `snapshot` result,
or after every read when no snapshot is given.

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

Pagination belongs to the search navigation controller. Set `pageParam` on
`useSearchNavigation` for a nested table (for example, `employees_page`), and pass
that controller to `useSort`. The default remains `page`. A visit resets only
that surface's pagination, preserving unrelated tables' query state.
