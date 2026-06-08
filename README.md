# Components

Shared frontend building blocks for Laravel + Inertia React apps built on Base UI, distributed as a
public [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github).

## Install

Use this registry in a Laravel/Inertia React app that has been migrated to Base UI and aligned with
the [frontend baseline](docs/CONSUMER_CONTRACT.md):

```sh
npx shadcn add GDanielRG/components/foundations#v1.0.0
```

Always pin to a release ref — a tag or a commit SHA — never a branch. ShadCN does not inherit a ref
across registry dependencies, so each release pins every internal bundle to its tag: `#v1.0.0`
resolves all seven bundles at that release. Published release tags are never re-pointed, so a tag pin
is stable. To pin to a ref that cannot move even in principle, use the release's commit SHA:

```sh
npx shadcn add GDanielRG/components/foundations#85cb9244b166aa5f7d1f496efb6f8ec8a81c6dd7
```

The consumer also provides two intentionally app-owned files:

- `@/hooks/use-shared-component-copy`
- `@/components/app-right-sidebar`

The [consumer contract](docs/CONSUMER_CONTRACT.md) defines the exact baseline, aliases, and injected
route contracts.

## Bundles

- `core` — shared types, hooks, pagination, and generic components
- `search` — server-driven search controls and export dialog
- `table` — sorting, visibility, and row-action helpers
- `comments` — polymorphic comment UI
- `documents` — polymorphic document and upload UI
- `activity` — combined comments/documents activity UI
- `foundations` — installs all bundles

Inspect before installing or updating:

```sh
npx shadcn view GDanielRG/components/foundations#v1.0.0
npx shadcn add GDanielRG/components/foundations#v1.0.0 --dry-run
```

## Maintain

```sh
npm run registry:check
npm test
npm run smoke
```

The source files and root [`registry.json`](registry.json) are the complete registry. See
[the maintenance guide](docs/MAINTAINING.md) for releases and compatibility changes.
