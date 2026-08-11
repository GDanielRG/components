# Components

Shared frontend building blocks for Laravel + Inertia React apps built on Base UI, distributed as a
public [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github).

## Install

Use this registry in a Laravel/Inertia React app that has been migrated to Base UI and aligned with
the [frontend baseline](docs/CONSUMER_CONTRACT.md):

```sh
bunx --bun shadcn@latest add GDanielRG/components/foundations#v1.0.0
```

Always pin to a **release ref** — a published tag (or that tag's commit SHA), never a branch and
never a bare `main` SHA. ShadCN does not inherit a ref across registry dependencies, so each release
pins every internal bundle to one immutable ref: `#v1.0.0` resolves all of that release's bundles at
that ref. A bare `main` commit SHA is _not_ a safe pin — on `main` the internal deps carry no ref, so
the nested bundles would resolve against the default branch instead of your SHA.

The fleet is pre-production, so the latest shared state is published as a dated, immutable **snapshot
tag** rather than a semantic version (see [the maintenance guide](docs/MAINTAINING.md) for the
two-phase release policy). Install the most recent one — for example:

```sh
bunx --bun shadcn@latest add GDanielRG/components/foundations#snapshot-20260623-<short-sha>
```

The consumer also provides two intentionally app-owned files:

- `@/hooks/use-shared-component-copy`
- `@/components/app-right-sidebar`

The [consumer contract](docs/CONSUMER_CONTRACT.md) defines the exact baseline, aliases, and injected
route contracts.

## Bundles

- `core` — shared types, hooks, pagination, and generic components
- `archive` — archive status badge, confirmation modal, and form for soft-delete archive flows
- `edit-history` — edit-history entries and their popover
- `sidebar` — fleet sidebar provider, rail, and menu primitives
- `search` — server-driven search controls and export dialog
- `table` — sorting, visibility, and row-action helpers
- `comments` — polymorphic comment UI
- `documents` — polymorphic document and upload UI
- `activity` — combined comments/documents activity UI
- `chat-display` — chat message rendering primitives
- `chat` — chat input and conversation shell (held out of `foundations`: it
  depends on the pre-1.0 `@shadcn/react` package)
- `notifications` — notification bell, center, and popover list
- `foundations` — installs every bundle except `chat`

`registry.json` is the live inventory; this list is a reading aid, so check it
there rather than trusting the prose if the two ever disagree.

Inspect before installing or updating:

```sh
bunx --bun shadcn@latest view GDanielRG/components/foundations#v1.0.0
bunx --bun shadcn@latest add GDanielRG/components/foundations#v1.0.0 --dry-run
```

## Maintain

```sh
bun run registry:check
bun run test
bun run smoke
```

The source files and root [`registry.json`](registry.json) are the complete registry. See
[the maintenance guide](docs/MAINTAINING.md) for releases and compatibility changes.
