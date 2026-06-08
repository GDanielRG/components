# Repo context

This public ShadCN GitHub registry distributes the shared Laravel/Inertia React frontend foundation
used across the sibling repos.

It owns reusable components, hooks, structural types, and the intentionally customized Inertia-aware
pagination primitive. It does not own domain forms, generated Wayfinder controllers, application
layouts, localized copy, or the right-sidebar shell.

The root `registry.json` is the complete registry and exposes seven supported bundles:
`core`, `search`, `table`, `comments`, `documents`, `activity`, and `foundations`.

Consumers first align to the ecosystem frontend baseline, then install a pinned bundle. Shared files
should remain identical across the fleet; locale, auth, routing, and domain differences stay in each
consumer.
