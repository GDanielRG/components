# Consumer contract

This registry targets a specific Laravel + Inertia + Base UI baseline, not an arbitrary React project.

## Supported baseline

| Technology                    | Supported baseline |
| ----------------------------- | ------------------ |
| React                         | 19.2+              |
| Tailwind CSS                  | 4.3+               |
| Base UI                       | 1.5+               |
| Inertia core, React, and Vite | 3.3.1+             |
| Laravel Wayfinder Vite plugin | 0.1.7+             |
| lucide-react                  | 1.17+              |
| ShadCN CLI                    | 4.11.0             |

The registry declares the Inertia and Lucide runtime dependencies its files import. Align the full
baseline before installing so generated routes, stock ShadCN primitives, and shared
components are tested as one frontend foundation.

## Required project shape

- `components.json` aliases: `@/components`, `@/components/ui`, `@/hooks`, and `@/lib/utils`.
- TypeScript alias: `@/*` resolves to `resources/js/*`.
- `@/hooks/use-shared-component-copy` returns the locale-specific
  `SharedComponentCopy` contract installed at `@/components/types/shared-component-copy`.
- `@/components/app-right-sidebar` exports controlled `AppRightSidebar` and
  `AppRightSidebarCloseButton` components.

The copy hook and sidebar shell stay app-owned because locale and shell styling intentionally vary
between consumers. Registry installs and reinstalls never overwrite them.

## Injected routes

Comments receive `storeCommentForm`, `updateCommentForm`, and `destroyCommentForm`. Documents receive
`storeDocumentAction`, `updateDocumentAction`, `destroyDocumentAction`, and `showDocumentAction`.

Pass generated Wayfinder controller actions into those props. Shared components depend only on the
small structural route contracts installed at `@/components/types/wayfinder`; they never hardcode a
consumer controller.
