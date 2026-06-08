# Sibling Components

Shared frontend building blocks for the Laravel/Inertia React sibling repos, distributed as a
public [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github).

## Install

Use this registry in a Laravel/Inertia React app that has been migrated to Base UI and aligned with
the [ecosystem frontend baseline](docs/CONSUMER_CONTRACT.md):

```sh
npx shadcn add GDanielRG/components/foundations#v1.0.0
```

Pin installs to a release tag. ShadCN refs are not inherited across registry dependencies, so each
release pins its complete bundle graph.

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
