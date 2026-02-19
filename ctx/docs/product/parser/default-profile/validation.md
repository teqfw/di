# Validation Rules (Default EDD Profile)

Path: `./ctx/docs/product/parser/default-profile/validation.md`

## 1. Scope

This document defines the normative validation rules for the default EDD profile.

These rules determine whether an EDD string is acceptable for transformation into a `DepId`.

Validation is deterministic and fail-fast. Any violation terminates parsing by throwing a standard `Error`.

No error subclasses or classification categories are defined.

## 2. Grammar Rules

The following rules define base lexical admissibility:

1. The EDD string must be a valid `AsciiEddIdentifier` as defined in `ctx/docs/product/parser/default-profile/grammar.md`.
2. Unicode characters are not permitted.
3. The string must be non-empty.
4. The string must not begin with a digit.

Violation of any Grammar Rule causes parsing to fail immediately.

## 3. Delimiter Rules

1. The delimiter `__` may appear at most once in the entire string.
2. The delimiter `__` must not appear at the beginning of the string.
3. The delimiter `__` must not appear at the end of the string.
4. `moduleName` must not contain `__`.

Violation of any Delimiter Rule causes parsing to fail.

## 4. Lifecycle Rules

1. Only `$`, `$$`, or `$$$` are permitted lifecycle markers.
2. At most one lifecycle marker sequence is permitted.
3. Lifecycle marker must appear after the export segment (if present) and before any wrapper segments.
4. `$` may appear only as part of a lifecycle marker.

Lifecycle mapping:

- `$` → `life = 'singleton'`
- `$$` → `life = 'transient'`
- `$$$` → `life = 'direct'`

Absence of lifecycle marker implies `life = 'direct'`.

Any invalid lifecycle encoding causes parsing to fail.

## 5. Wrapper Rules

Wrappers are defined as ordered suffix segments following lifecycle markers.

1. Wrappers are permitted for all lifecycle modes, including `'direct'`.
2. Wrapper segments must follow the lifecycle marker.
3. Wrapper identifiers must not contain `_` beyond the leading wrapper marker.
4. Wrapper identifiers must not contain `$`.
5. Wrapper identifiers must not be empty.
6. Wrapper identifiers must not be equal to `default`.
7. Wrapper order is preserved.
8. Duplicate wrapper identifiers are permitted.

Violation of any Wrapper Rule causes parsing to fail.

## 6. Export Rules

1. Export name must not contain `_`.
2. Export name must not contain `$`.
3. Export name may be `default`.
4. Export name must not be empty.
5. Export name must not contain additional `__`.

Export is optional.

Export presence does not require lifecycle.

Invalid export encoding causes parsing to fail.

## 7. Module Rules

After removal of export, lifecycle, and wrapper segments:

1. `moduleName` must be non-empty.
2. `moduleName` must not contain `$`.
3. `moduleName` must not contain `__`.
4. `moduleName` must not start with `_`.

Violation of any Module Rule causes parsing to fail.

## 8. Platform Prefix Rules

Platform is derived from the module prefix:

1. If the string begins with `node_`, platform is `node` and the prefix is removed.
2. If the string begins with `npm_`, platform is `npm` and the prefix is removed.
3. If no reserved prefix is present, platform is `teq`.
4. The explicit prefix `teq_` is not permitted.
5. Reserved prefixes are interpreted deterministically and always take precedence.

Violation of any Platform Prefix Rule causes parsing to fail.

## 9. Composition Consistency Rules

The following semantic consistency rules are validated during transformation:

1. If `life = 'transient'`, then `composition = 'factory'`.
2. If `composition = 'factory'`, then `exportName != null`.
3. If `exportName = null`, then `composition = 'as-is'`.

Any violation results in parsing failure.

## 10. Determinism Requirement

Validation must not perform backtracking or alternative interpretations.

A string is either valid under the default profile or invalid.

No recovery or fallback semantics are permitted.

## 11. Validation Boundary

This document defines grammar and profile admissibility rules.

Structural `DepId` invariants are validated after transformation as defined in:

- `ctx/docs/product/parser/default-profile/transformation.md`
- `ctx/docs/architecture/depid-model.md`

Any violation results in immediate failure.
