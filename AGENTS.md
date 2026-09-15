First read [the Developer workspace guide](../AGENTS.md) for fleet conventions.

## Test suite boundaries

- Registry tests protect reusable consumer contracts: callbacks, submitted data, navigation, state recovery, and accessibility semantics owned by component composition.
- Before committing, pushing, or opening a PR, review each added or changed test even when it passes. Name its lasting consumer outcome and distinct failure, consolidate duplicate coverage, and identify surviving coverage before removing a consumer contract.
- Keep cosmetic SVG, CSS, geometry, and dependency primitive checks as temporary verification. Preserve the registry's own interaction and compatibility contracts.
