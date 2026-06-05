# Sibling Components

Source shadcn GitHub registry for shared Laravel/Inertia React components used by the sibling repos in `/Users/daniel/Developer`.

## Install

After this repo is pushed to GitHub, install the full v1 foundation set from a consumer repo with:

```sh
npx shadcn@latest add GDanielRG/components/foundations
```

Individual items can also be installed, for example:

```sh
npx shadcn@latest add GDanielRG/components/app-empty-card
npx shadcn@latest add GDanielRG/components/table/use-sort
```

## Scope

This registry contains shared code that is outside the starter/base repo surface:

- simple shared components such as empty cards, loading buttons, optional sections, delete confirmation, and pagination;
- table helpers for sort, row actions, and column visibility;
- query/navigation utilities for server-driven search flows;
- shared lightweight types and sidebar-sheet hook;
- one custom UI primitive, `ui/active-trigger-icon`.

It intentionally excludes stock shadcn/base-ui files, `use-mobile`, `lib/utils`, app-specific copy bags as registry-owned files, domain forms, full search UI, export dialogs, quick-create flows, activity history, comments/documents, and generated backend route files.

## Consumer Prerequisites

The sibling apps already carry the stock UI primitives these files import. For a new consumer, install or sync these manually before adding `foundations`:

```sh
npx shadcn@latest add alert-dialog button collapsible dropdown-menu empty pagination table
npm install @inertiajs/core @inertiajs/react lucide-react
```

They are intentionally not registry dependencies here because adding this sibling registry should not overwrite base/shadcn-owned `components/ui/*` files or silently bump app-owned package versions.

Copy-bearing components read default labels from the consumer's local
`@/hooks/use-shared-component-copy` hook. Keep that hook app-owned so Spanish,
English, and translated apps can share the same component source without forking
the registry item. For the v1 foundations bundle, consumers should expose these
keys when the local defaults differ from the Spanish fallback:

```ts
actionsLabel;
columnsLabel;
dialogCancel;
dialogDelete;
hideColumnLabel;
optionalLabel;
saveLabel;
sortAscendingLabel;
sortDescendingLabel;
```

Component props such as `label`, `triggerLabel`, `cancelLabel`, and
`confirmLabel` still override the hook for one-off wording.

## Validate

```sh
npm run registry:check
```

After the repo is pushed and public, list the GitHub source registry with:

```sh
npm run registry:list
```

The GitHub registry source is `registry.json`; the generated `public/r` output is ignored and only useful for validation or private/authenticated registry hosting experiments.
