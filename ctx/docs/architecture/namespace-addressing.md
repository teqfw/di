# Namespace Addressing in `@teqfw/di`

Path: `ctx/docs/architecture/namespace-addressing.md`

## 1. Scope and Authority

This document defines the invariants of ES module addressing in the `@teqfw/di` library in terms of namespace names: address structure, semantic zones, public surface rules, and deterministic module-name mapping.

## 2. Namespace Root

The library defines a single namespace root:

- `TeqFw_Di_` — the root prefix of ES module addresses in the library.

The root is used as a key to bind a source root directory. All module addresses in the library start with this prefix and continue with segments separated by `_`.

## 3. Semantic Zoning

Within the root, an address is divided into zones by the intended meaning of the module. A zone is expressed by an address segment and participates in public surface rules:

- `..._Api_...` — contract modules (interfaces) intended for external use and extension.
- `..._Dto_...` — data structures used in contracts and/or implementation.
- all other zones — implementation (internal mechanisms).

A zone is part of the address and does not introduce additional namespace roots.

## 4. Public Surface Policy

Only modules in the `..._Api_...` zone are considered the public addressing contract. External code must not depend on implementation addresses directly.

DTOs are not public automatically: a DTO becomes part of the public surface only if it is used in public contract signatures and is published as part of the public type surface.

## 5. Address Structure and Mapping Invariant

An ES module address is built as a sequence of segments separated by `_` and is deterministically mapped to a source path through configured namespace-root bindings and a stable mapping rule.

Address requirements:

- an address encodes a semantic hierarchy and, at the same time, serves as the logical name of a specific ES module within the source tree defined by the mapping rules;
- address segments are consistent with the rules that convert an address into a relative path under the bound root (including converting `_` into directory separators);
- the namespace root is bound to a source root via configuration, and the module name tail maps to a relative path by a stable rule;
- if multiple roots match, the longest matching namespace root applies to determine the bound source root;
- an address does not contain absolute paths; absolute paths exist only in the configuration of root bindings;
- an address does not contain environment-specific markers that must be expressed by configuration (runtime environment, source placement, access format);
- refactoring source layout requires either address changes or updates to the mapping and root bindings to preserve deterministic resolution.

## 6. Relation to Dependency Identifier Language

Addressing rules define the form and semantics of the ES module name inside a dependency identifier. The dependency identifier language is canonical: extensibility is achieved through contract axes (e.g., resolving and pre/post processing), not through alternative identifier syntaxes.

## 7. Relation to Type Publication

Addressing defines how modules and zones are named. The public type surface is determined by the library type publication rules and is specified separately; an address itself does not make a module or a type public.
