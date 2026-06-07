# Sibling Components

Source shadcn GitHub registry for shared Laravel/Inertia React components used by the sibling repos in `/Users/daniel/Developer`.

## Install

After this repo is pushed to GitHub, install the full foundation set from a consumer repo with:

```sh
npx shadcn@latest add GDanielRG/components/foundations
```

Self-contained leaf items can also be installed individually, for example:

```sh
npx shadcn@latest add GDanielRG/components/app-empty-card
npx shadcn@latest add GDanielRG/components/table/use-sort
```

Most items read copy from the app-owned hook, and some areas import app-owned
shell/route files (see Consumer Prerequisites). Installing the whole
`foundations` bundle into a sibling app is the supported path; standalone leaf
installs work for the self-contained items (empty card, loading button, table
helpers, types, sidebar-sheet hook).

## Scope

This registry contains the shared, cross-repo component surface:

- simple shared components (empty card, loading button, optional sections,
  delete/destroy confirmation, dialog-form scaffold, pagination);
- table helpers for sort, row actions, and column visibility;
- server-driven search UI (search controls/results, faceted + select filters,
  applied-filter chips) plus query/navigation utilities;
- the export dialog;
- the comments, documents, and activity surfaces (comments/documents sidebar +
  inline/sidebar activity triggers);
- shared lightweight types, the sidebar-sheet hook, and one custom UI primitive
  (`ui/active-trigger-icon`).

It intentionally excludes stock shadcn/base-ui files, `use-mobile`, `lib/utils`,
domain forms, generated backend route files (Wayfinder controllers), the app
shell (sidebars/layouts, including `app-right-sidebar`), and the app-owned copy
hook.

## Consumer Prerequisites

The sibling apps already carry the stock UI primitives, the app shell, and the
generated route files these components import. For a new consumer, provide these
before adding `foundations`:

```sh
npx shadcn@latest add alert-dialog avatar badge button button-group card collapsible dialog dropdown-menu empty field input input-group item pagination popover progress radio-group scroll-area separator sidebar table tabs textarea tooltip
npm install @inertiajs/core @inertiajs/react lucide-react
```

App-owned files the components import (kept app-owned on purpose, so they are
**not** registry dependencies):

- `@/hooks/use-shared-component-copy` — the copy hook (see Copy contract below).
- `@/components/app-right-sidebar` — the activity sidebar shell. It carries
  intentional per-theme divergence (e.g. card radius), so it stays app-owned.
- generated Wayfinder controllers (e.g. `CommentController`, `DocumentController`)
  used by the comments/documents/activity surfaces for shallow update/destroy
  routes.

### Copy contract

Copy-bearing components read their labels from the consumer's local
`@/hooks/use-shared-component-copy` hook, typed against the registry-shipped
contracts in `@/types/shared-component-copy`. The contract is split into slices
so a component depends only on the keys it uses:

- `DialogCopy`, `FormCopy`, `ActionsCopy`, `TableCopy` — shared primitives;
- `CommentsCopy`, `ActivityCopy`, `DocumentsCopy`, `ExportCopy`, `SearchCopy` —
  per area.

`SharedComponentCopy` composes every slice; an app that installs the full
foundation types its hook against it, while a consumer installing one area can
type its hook against just that area's slice(s). Keep the hook app-owned so
Spanish, English, and translated (i18n `t()`) apps share the same component
source without forking. Some keys are **functions** for interpolation or
pluralization, e.g. `documentsCount(count)`, `searchSelectedCount(count)`,
`exportEmailNotice(hasFilters)`.

Component props such as `label`, `triggerLabel`, and `title` still override the
hook for one-off wording.

## Conventions

- Components use **named exports** (e.g. `import { SaveButton } from '@/components/save-button'`).
- Dialog-style components use `open` / `onOpenChange`, matching the Base UI primitives they wrap.
- Wrapper components spread `...props`, merge `className` via `cn`, and tag a `data-slot`.
- The form submit is split into `save-button` (the button) and `form-actions` (the right-aligned footer); compose them, e.g. `<FormActions><SaveButton processing={processing} /></FormActions>`.
- Domain-specific backend actions are **injected** where the shared component
  should not own a concrete resource route — e.g. `useCommentsDocumentsSidebar`
  takes `storeCommentForm` / `updateCommentForm` / `destroyCommentForm`.
  Generic document actions still use the shared generated `DocumentController`
  described in Consumer Prerequisites.
- `SearchResults` composes `ExportDialog` so consumers provide the export action
  once instead of wiring the dialog separately.
- Variants are **explicit components**, not inferred from prop presence — e.g. `ActivityTriggers` (inline dropdown/popover) vs `ActivitySidebarTriggers` (sidebar toggle buttons).

## Search select filters (feature note)

`search/select-filter` (a single-value radio filter) and its `ui/radio-group`
dependency are a **feature addition** rolled out fleet-wide for parity, not a
pure extraction: only AMNSA currently emits `select`-type filters from the
backend. The other repos carry the capability dormant until they emit select
filters server-side.

## Validate

```sh
npm run registry:check
```

`registry:check` runs `prettier --check`, validates the manifests, and builds
`public/r`. Note: the registry source uses `@/…` aliases that only resolve inside
a consumer app and the repo has no eslint, so import-order/lint cleanliness is
verified by round-tripping touched files through a reference consumer's
`eslint --fix` + `prettier` (the fleet toolchain) and copying the fixpoint back.

After the repo is pushed and public, list the GitHub source registry with:

```sh
npm run registry:list
```

The GitHub registry source is `registry.json`; the generated `public/r` output is ignored and only useful for validation or private/authenticated registry hosting experiments.
