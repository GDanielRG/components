# Maintaining

## Source

The root `registry.json` is the only registry manifest. It defines eight supported bundles and
references source files under `components/`, `hooks/`, and `types/`.

Keep shared-type imports under `@/components/*`. ShadCN rewrites unregistered `@/types/*` imports and
some relative type imports incorrectly during installation.

Keep app-owned imports limited to:

- `@/hooks/use-shared-component-copy`
- `@/components/app-right-sidebar`
- the standard ShadCN `@/lib/utils`

## Verify

```sh
npm run registry:check  # format, official schema validation, build
npm test                # pure utility tests
npm run smoke           # real aligned-baseline install, type-check, reinstall
```

The smoke test installs the working tree, retains stock ShadCN and npm dependencies, verifies the
app-owned contracts are untouched, type-checks the installed result, and proves a reinstall is
byte-identical.

## Release

```sh
npm run registry:release -- v1.0.0-rc.1
```

The release helper pins every internal registry dependency in `registry.json`, validates, builds,
and smoke-tests the pinned graph. Commit and tag that pinned registry on a release branch; keep
`main` with bare internal dependencies.

Treat a published release tag as immutable: never re-point or delete it — ship fixes as a new
version. Each release pins the whole bundle graph to its tag, and consumers may pin to that tag or to
its commit SHA.

Use semantic versioning. Removing or renaming a prop or copy key, adding a required injected route,
or raising the supported baseline is a breaking change.
