# Namespace Mapping (`./ctx/docs/code/layout/namespace-mapping.md`)

Path: `./ctx/docs/code/layout/namespace-mapping.md`
Version: `20260227`

## Purpose

This document defines the deterministic and machine-reconstructible model of mapping logical namespaces to filesystem directories in TeqFW-based systems. The model is designed primarily for agent-driven development and must minimize ambiguity, interpretation variance, and heuristic behavior.

Namespace mapping forms a declarative bridge between logical dependency identifiers and physical ESM module files. It does not redefine container lifecycle, dependency graph semantics, or instantiation policy.

## Execution Model Constraint

The container operates strictly in ESM-only mode. Namespace mapping affects only filesystem resolution. It does not influence execution semantics.

## Metadata Location

Namespace mappings are declared statically inside `package.json` under the `teqfw.namespaces` section.

Example:

```json
{
  "teqfw": {
    "namespaces": [
      {
        "prefix": "Ns_App_Back_",
        "path": "./src",
        "ext": "js"
      },
      {
        "prefix": "Ns_App_Shared_",
        "path": "./web/app/Shared"
      }
    ]
  }
}
```

Metadata must be interpretable without code execution.

## Namespace Entry Structure

Each element of `teqfw.namespaces` is an object with strictly defined attributes.

### prefix (required)

Logical namespace root.

Invariants:

- MUST be a non-empty string.
- MUST end with `_`.
- Comparison is case-sensitive.
- MUST be unique across the aggregated namespace registry.
- Canonical form always includes trailing underscore.

No automatic underscore insertion is performed.

### path (required)

Filesystem directory relative to package root.

Invariants:

- MUST be a relative path.
- MUST resolve inside package root.
- MUST exist at composition time.
- MUST represent a directory.

Symbolic resolution outside the package boundary is prohibited.

### ext (optional)

File extension used for module resolution.

Behavior:

- If omitted → default `.mjs`.
- If specified:
  - May be provided with or without leading dot.
  - Composition layer MUST normalize to canonical form.
  - Canonical form is a string beginning with `.`.
  - Empty string is invalid.
  - Only ESM-compatible source extensions are allowed.

Normalization algorithm:

1. If `ext` starts with `.` → keep as is.
2. Otherwise → prepend `.`.
3. Store normalized value in registry.
4. Container receives only normalized values.

The container does not perform normalization.

## Conflict Model

Conflict evaluation occurs during namespace aggregation in composition stage.

### Allowed

Overlapping prefixes of different lengths.

Example:

- `Ns_App_`
- `Ns_App_Back_`

Resolution rule: longest prefix match applies during dependency resolution.

### Forbidden

Exact duplicate prefixes after canonical comparison.

Example:

- `Ns_App_`
- `Ns_App_`

This condition MUST cause immediate fail-fast termination of composition.

No prefix shadowing override mechanism exists.

## Aggregation Model

Namespace aggregation occurs strictly before the first container resolution request.

Composition algorithm:

1. Discover all `package.json` files in dependency graph.
2. Extract `teqfw.namespaces` entries.
3. Validate structural invariants.
4. Canonicalize `prefix` and `ext`.
5. Resolve `path` to absolute directory.
6. Detect duplicate prefixes.
7. Sort entries by descending prefix length.
8. Produce immutable namespace registry.
9. Provide registry to container constructor.

The container does not:

- read `package.json`,
- scan filesystem,
- perform discovery,
- perform normalization.

The container consumes a prevalidated registry.

## Resolution Algorithm

Given dependency identifier `DepId`:

1. Select longest matching namespace prefix.
2. Remove prefix from identifier.
3. Replace `_` with `/`.
4. Append namespace-specific normalized extension.
5. Resolve absolute file path.
6. Perform dynamic `import()`.

No fallback probing, extension guessing, or multi-resolution attempts are permitted.

Resolution must be deterministic.

## Agent-Oriented Determinism

The model enforces:

- Single canonical namespace form.
- Single canonical extension form.
- No implicit fallback logic.
- No runtime mutation of namespace registry.
- No shadowing override behavior.
- No inference from package name.

This ensures:

- reproducible machine reasoning,
- static analyzability,
- absence of heuristic ambiguity,
- compatibility with automated refactoring agents.

## Non-Goals

This document does not define:

- automatic namespace derivation from npm package names,
- container lifecycle behavior,
- dependency graph construction,
- instantiation semantics,
- mocking strategy.

## Summary

Namespace mapping in TeqFW is a static, deterministic, fail-fast configuration layer optimized for agent-driven development. All ambiguity is resolved during composition. Runtime behavior is strictly declarative and reproducible.
