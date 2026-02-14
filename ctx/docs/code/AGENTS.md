# Code Engineering Context

Path: `ctx/docs/code/AGENTS.md`

## Purpose

The `code/` level fixes engineering norms for the project: code organization, modularity rules, runtime contracts, and testing expectations. Documents here describe how the product code is structured and constrained without prescribing agent behavior or operational procedures.

## Level Map

- `conventions/` — local naming and structural conventions for code and namespaces defined at the sublevel.
- `AGENTS.md` — this document, defining the boundaries of engineering norms at the `code/` level.
- `api-boundary.md` — declared public API surface and boundary constraints for the codebase.

## Proposed Structure

This section describes a suggested directory layout for `ctx/docs/code/`. It is not mandatory and is populated incrementally as the corresponding documentation appears in the context.

- `compat/` — compatibility constraints that affect how code is written (runtime targets, supported versions).
- `conventions/` — naming, identifiers, formatting, and other local code conventions.
- `errors/` — error handling policy (error taxonomy, message format, remediation expectations).
- `jsdocs/` — rules for documenting JavaScript code (JSDoc style, tagging, documentation placement).
- `logging/` — logging policy (levels, event structure, correlation, forbidden data).
- `packaging/` — npm packaging conventions (exports, entry points, publishing, deprecations).
- `patterns/` — recommended implementation patterns and idioms used across the codebase.
- `performance/` — performance-sensitive coding rules (hot paths, caching, async patterns).
- `security/` — secure coding rules and prohibited practices within the codebase.
- `standards/` — mandatory engineering standards (compatibility, versioning expectations, public surface rules).
- `testing/` — testing expectations (levels, naming, fixtures, mocking strategy, test modes).
- `tooling/` — development tooling and static analysis configuration relevant to code quality.

## Boundaries

This level:

- declares engineering rules that guide implementation and testing;
- constrains code structure and public interfaces within the project.

This level does not:

- define architectural invariants reserved for `architecture/`;
- describe product meaning reserved for `product/`;
- introduce agent behavior or reporting rules.
