# Components

Shared frontend building blocks for Laravel + Inertia React apps built on Base UI, distributed as a
public [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github).

## Install

Use this registry in a Laravel/Inertia React app that has been migrated to Base UI and aligned with
the [frontend baseline](docs/CONSUMER_CONTRACT.md):

```sh
bunx --bun shadcn@latest add GDanielRG/components/foundations#<release-commit-sha>
```

Always pin to the full commit SHA of a **release commit** — a published tag's commit or a
pending pin — never a branch and never a `main` SHA. ShadCN does not inherit a ref across
registry dependencies, so a release commit inlines every internal dependency: all of an
item's files come from that commit. On `main` the internal dependencies carry no ref, so a
`main` SHA would resolve nested bundles against the default branch instead of your SHA.

The fleet is pre-production, so the latest shared state is published as a dated, immutable **snapshot
tag** rather than a semantic version (see [the maintenance guide](docs/MAINTAINING.md) for the
two-phase release policy). Install the most recent one by its commit SHA
(`git rev-parse 'snapshot-…^{commit}'`). Record the pin as described in [the consumer contract](docs/CONSUMER_CONTRACT.md#registry-pin).

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
- `chat` — virtualized message scroller; it depends on the pre-1.0 `@shadcn/react`
  package, which `activity` therefore pulls in
- `realtime` — Echo configuration, live resource refreshes with polling fallback,
  and comment typing presence (held out of `foundations`: it requires the app's
  shared realtime plan and Echo packages)
- `foundations` — installs every bundle except `realtime` and `design-lint`,
  including `chat` and `@shadcn/react` through `activity`

`registry.json` is the live inventory; this list is a reading aid, so check it
there rather than trusting the prose if the two ever disagree.

Inspect before installing or updating:

```sh
bunx --bun shadcn@latest view GDanielRG/components/foundations#<release-commit-sha>
bunx --bun shadcn@latest add GDanielRG/components/foundations#<release-commit-sha> --dry-run
```

## Maintain

```sh
bun run registry:check
bun run test
bun run smoke
```

The source files and root [`registry.json`](registry.json) are the complete registry. See
[the maintenance guide](docs/MAINTAINING.md) for releases and compatibility changes.

Consumer formatters may reorder equivalent Tailwind classes after installation. The reinstall smoke checks registry installation stability; it does not certify byte identity after a consumer formatter runs. Compare portable behavior and document app-owned adaptations before treating a source diff as drift.
