# Namespace Registry Component

Path: `./ctx/docs/code/components/namespace-registry.md`
Version: `20260227`

## Purpose

This document defines the `TeqFw_Di_Config_NamespaceRegistry` component. The component builds an immutable namespace registry for the DI container by discovering namespace mappings across the application root project and its installed dependencies and transforming them into a deterministic configuration structure.

The format and invariants of namespace entries are defined in `ctx/docs/code/layout/namespace-mapping.md`. This document does not redefine those rules.

## Architectural Level

`TeqFw_Di_Config_NamespaceRegistry` is a composition-stage component. It is permitted to be imported statically from the composition root. It is not part of runtime dependency resolution and does not participate in object lifecycle management.

The container operates in ESM-only mode. The registry produced by this component affects only filesystem resolution.

## Responsibility Boundaries

The component is responsible for:

- reading the root project `package.json`,
- discovering installed npm dependencies,
- reading each dependency `package.json`,
- extracting `teqfw.namespaces` metadata,
- validating entries according to the namespace mapping specification,
- normalizing entries into canonical form,
- aggregating entries into a single registry,
- enforcing conflict rules,
- producing an immutable result.

The component is not responsible for:

- dependency identifier parsing,
- module import execution,
- container lifecycle,
- graph resolution,
- mocking or testing policies.

## Input Domain

The input domain is strictly defined as:

1. The root `package.json` of the application (composition root project).
2. All installed npm packages reachable through the dependency graph from that root.

The root project package MUST be processed even though it is not located inside `node_modules`.

Only static metadata is interpreted. No package source code is executed during registry construction.

## Discovery Order

Processing order MUST be deterministic:

1. Root project package.
2. Installed dependencies in deterministic traversal order.

Conflict detection MUST NOT depend on traversal order. Duplicate canonical prefixes always cause fail-fast error.

## Output Structure

The component returns an immutable ordered list of registry entries. Each entry contains:

- `prefix` — canonical namespace prefix,
- `dirAbs` — absolute filesystem directory corresponding to namespace root,
- `ext` — canonical normalized extension string.

The registry MUST be sorted by descending prefix length.

The container consumes the registry as read-only configuration.

## Determinism Invariant

For a fixed filesystem state, the component MUST produce identical registry output.

The component MUST:

- avoid heuristic inference,
- avoid fallback probing,
- avoid runtime mutation after construction,
- avoid implicit derivation from package name,
- avoid implicit exclusion of the root project package.

All ambiguity must be resolved during build.

## Conflict Enforcement

Conflict detection rules are defined in `layout/namespace-mapping.md`. The registry component MUST enforce them during aggregation.

Duplicate canonical prefixes MUST cause immediate fail-fast error.

Overlapping prefixes of different lengths are permitted.

## Normalization Responsibility

Normalization rules are defined in `layout/namespace-mapping.md`. The registry component MUST:

- normalize extensions into canonical form,
- resolve relative paths into absolute directories,
- verify that directories exist and are within package boundaries.

The container MUST receive only normalized entries and must not perform additional normalization.

## Integration Sequence

Composition sequence is strictly ordered:

1. Composition root imports `TeqFw_Di_Config_NamespaceRegistry` statically.
2. Composition root invokes registry construction.
3. Composition root passes registry to container configuration.
4. Container configuration is frozen before the first resolution request.

Registry construction MUST complete before any container resolution operation.

## Agent-Oriented Constraints

The component is designed for agent-driven development and therefore enforces:

- explicit processing of root and dependency packages,
- canonicalized output structure,
- fail-fast validation,
- absence of implicit conventions,
- absence of hidden fallback logic,
- deterministic traversal.

This ensures reproducible reasoning and static analyzability for automated agents.

## Summary

`TeqFw_Di_Config_NamespaceRegistry` is a deterministic composition-stage component that processes both the root project package and all installed dependencies, validates and normalizes namespace mappings defined in their `package.json` files, and produces an immutable registry used to configure the DI container before runtime resolution begins.
