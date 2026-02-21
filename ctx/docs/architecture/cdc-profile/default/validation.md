# Validation Rules (Default CDC Profile)

Path: `./ctx/docs/architecture/cdc-profile/default/validation.md`

## 1. Scope

This document defines the normative validation rules for admissibility of a CDC string under the default profile.

Validation is deterministic and fail-fast. Any violation terminates parsing by throwing a standard `Error`. No recovery, fallback, or alternative interpretation is permitted.

## 2. Lexical Rules

1. The CDC string MUST be a valid `AsciiCdcIdentifier` as defined in `ctx/docs/architecture/cdc-profile/default/grammar.md`.
2. The string MUST be non-empty.
3. Unicode characters are forbidden.

Violation of any Lexical Rule causes parsing to fail immediately.

## 3. Platform Prefix Rules

1. If the string begins with `node_`, platform is `node` and the prefix is removed.
2. If the string begins with `npm_`, platform is `npm` and the prefix is removed.
3. If no reserved prefix is present, platform is `teq`.
4. The explicit prefix `teq_` is forbidden.
5. Reserved prefixes are interpreted deterministically and take precedence over all other segmentation.

Violation of any Platform Prefix Rule causes parsing to fail.

## 4. Delimiter Rules

1. The export delimiter `__` may appear at most once in the entire string.
2. If `__` is present, it MUST NOT appear at the beginning of the string.
3. If `__` is present, it MUST NOT appear at the end of the string.
4. `moduleName` MUST NOT contain `__`.

Violation of any Delimiter Rule causes parsing to fail.

## 5. Lifecycle Rules

1. A lifecycle marker, if present, MUST be exactly one of: `$`, `$$`, `$$$`.
2. At most one lifecycle marker is permitted.
3. If present, the lifecycle marker MUST appear after the export segment (if present) and before wrapper segments.
4. `$` MUST NOT appear outside the lifecycle marker.

Lifecycle mapping:

- `$` → `life = 'singleton'`
- `$$` → `life = 'transient'`
- `$$$` → `life = 'direct'`

Absence of lifecycle marker implies `life = 'direct'`.

Any invalid lifecycle encoding causes parsing to fail.

## 6. Wrapper Rules

Wrappers are defined as ordered suffix segments following a lifecycle marker.

1. Wrapper segments are permitted only when a lifecycle marker is present.
2. Wrapper identifiers MUST satisfy `WrapperId := [a-z][0-9A-Za-z]*`.
3. Wrapper identifiers MUST NOT contain `_` beyond the leading wrapper delimiter.
4. Wrapper identifiers MUST NOT contain `$`.
5. Wrapper identifiers MUST NOT be empty.
6. Wrapper identifier equal to `default` is forbidden.
7. Wrapper order is preserved.
8. Duplicate wrapper identifiers are permitted.

If a wrapper-like terminal suffix matching `"_" WrapperId` is present while lifecycle marker is absent, parsing fails.

Violation of any Wrapper Rule causes parsing to fail.

## 7. Export Rules

1. Export name MUST be non-empty.
2. Export name MUST NOT contain `_`.
3. Export name MUST NOT contain `$`.
4. Export name MUST NOT contain additional `__`.
5. Export name may be `default`.

Export segment is optional.

Invalid export encoding causes parsing to fail.

## 8. Module Rules

After removal of platform prefix and extraction of export, lifecycle, and wrapper segments:

1. `moduleName` MUST be non-empty.
2. `moduleName` MUST NOT start with `_`.
3. `moduleName` MUST NOT start with `$`.
4. `moduleName` MUST NOT contain `$`.
5. `moduleName` MUST NOT contain `__`.

Violation of any Module Rule causes parsing to fail.

## 9. Structural Invariants

After transformation, structural invariants defined in `ctx/docs/architecture/depid-model.md` MUST hold. Any violation causes immediate failure.

## 10. Validation Boundary

This document defines lexical admissibility and profile-specific constraints. Semantic mapping is defined in `ctx/docs/architecture/cdc-profile/default/transformation.md`. Structural invariants are defined in `ctx/docs/architecture/depid-model.md`.
