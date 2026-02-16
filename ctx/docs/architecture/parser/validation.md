# Validation Rules (Default EDD Profile)

Path: `./ctx/docs/architecture/parser/validation.md`

## 1. Scope

This document defines the normative validation rules for the default EDD profile. These rules determine whether an EDD string is acceptable for transformation into a `DepId`. Validation is deterministic and fail-fast. Any violation terminates parsing.

## 2. Classification of Violations

Validation failures are classified as:

- `GrammarViolation` — violation of base lexical constraints.
- `ProfileViolation` — violation of default EDD profile rules.

Classification does not affect termination semantics; any violation results in failure.

## 3. Grammar Rules

The following rules define base lexical admissibility:

1. The EDD string must be a valid ASCII ECMAScript `IdentifierName`.
2. Unicode characters are not permitted.
3. Leading digits are not permitted.
4. The string must be non-empty.

Violation of any Grammar Rule results in `GrammarViolation`.

## 4. Profile Rules

Profile rules apply only after Grammar Rules are satisfied.

### 4.1 Delimiter Rules

1. The delimiter `__` may appear at most once in the entire string.
2. The delimiter `__` must not appear at the beginning of the string.
3. The delimiter `__` must not appear at the end of the string.
4. `moduleName` must not contain `__`.

Violation of any Delimiter Rule results in `ProfileViolation`.

### 4.2 Lifecycle Rules

1. Only `$` or `$$` are permitted lifecycle markers.
2. At most one lifecycle marker sequence is permitted.
3. Lifecycle must appear immediately after the base module segment and before any wrapper segments.
4. `$` may appear only as part of the lifecycle marker.

Violation of any Lifecycle Rule results in `ProfileViolation`.

### 4.3 Wrapper Rules

1. Wrappers are permitted only when lifecycle is present.
2. Wrapper segments must follow lifecycle.
3. Wrapper names must not contain `_`.
4. Wrapper names must not contain `$`.
5. Wrapper names must not be `default`.
6. Wrapper names may contain digits.
7. Wrapper segments must not be empty.

Violation of any Wrapper Rule results in `ProfileViolation`.

### 4.4 Export Rules

1. Export name must not contain `_`.
2. Export name must not contain `$`.
3. Export name may be `default`.
4. Export name may be `node` or `npm`.
5. Empty export segments are not permitted.

Violation of any Export Rule results in `ProfileViolation`.

### 4.5 Module Rules

1. `moduleName` must be non-empty after removal of lifecycle, wrappers, and export.
2. `moduleName` must not contain `$`.
3. `moduleName` must not contain `__`.
4. `moduleName` must not start with `_`.
5. `moduleName` must not be equal to `node`.
6. `moduleName` must not be equal to `npm`.

Violation of any Module Rule results in `ProfileViolation`.

### 4.6 Platform Prefix Rules

1. If the string begins with `node_`, platform is `node` and the prefix is removed from `moduleName`.
2. If the string begins with `npm_`, platform is `npm` and the prefix is removed from `moduleName`.
3. If no reserved prefix is present, platform is `src`.
4. The explicit prefix `src_` is not permitted.
5. Reserved prefixes are interpreted deterministically and always take precedence.

Violation of any Platform Prefix Rule results in `ProfileViolation`.

## 5. Determinism Requirement

Validation must not perform backtracking or alternative interpretations. A string is either valid under the default profile or invalid. No recovery or fallback semantics are permitted.
