# Parser Implementation Contract

Path: `./ctx/docs/code/parser.md`

## 1. Purpose

This document defines the implementation-level contract of the parser component within `@teqfw/di`. It specifies the required public interface, error surface, determinism guarantees, unit-test obligations, and conformance requirements to architecture-level parser specifications.

## 2. Normative Architecture References

Parser implementations MUST conform to the following architecture boundary documents:

- `ctx/docs/architecture/edd-model.md`
- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/architecture/invariants.md`
- `ctx/docs/architecture/linking-model.md`

These documents define the parser boundary, `DepId` structure, core invariants, and the immutable linking pipeline boundary.

The canonical default EDD profile shipped with the product is specified in:

- `ctx/docs/product/default-edd-profile.md`
- `ctx/docs/product/parser/default-profile/grammar.md`
- `ctx/docs/product/parser/default-profile/transformation.md`
- `ctx/docs/product/parser/default-profile/validation.md`

This code-level document does not restate default-profile grammar, mapping rules, or validation rules.

## 3. Public Interface

Every parser implementation MUST expose a single public method with the following signature:

`parse(edd: string): DepId`

The method MUST accept exactly one EDD string, return a fully constructed `DepId` instance on success, throw on failure, never return partial or intermediate structures, and never return `null` or `undefined`.

## 4. Parser Variants

Two parser variants are supported at code level:

1. A generic parser implementation conforming to the architectural parser contract.
2. The default EDD profile parser provided by the product.

All parser implementations MUST satisfy this interface and behavioral contract. The default parser implementation MUST additionally conform exactly to the product-defined default profile semantics.

## 5. Determinism and Purity

The parser MUST be a pure deterministic function. Given identical input string and identical parser profile definition, the returned `DepId` MUST be structurally identical across executions.

The parser MUST have no side effects, must not access container configuration, must not access preprocess or postprocess stages, must not access global mutable state, must not depend on runtime environment variables, must not perform I/O, and must not perform module resolution.

## 6. Fail-Fast Behavior

The parser MUST follow strict fail-fast semantics. On the first detected violation, the parser MUST throw immediately. No aggregation of multiple errors is permitted. No partial validation is exposed. No recovery or fallback semantics are permitted.

Returning error objects instead of throwing is prohibited.

## 7. Error Surface

The parser MUST throw a standard `Error` for any rejection under the selected profile.

Concrete error classes, structured error fields, and error classification are implementation-defined and must not be relied upon by architectural semantics.

Error messages MUST be human-readable and describe the reason for failure.

## 8. DepId Construction Contract

The parser MUST construct a `DepId` instance with explicit deterministic assignment of all structural identity fields and with `origin` equal to the original input string without modification.

Structural invariants are defined at architecture level. If the constructed `DepId` violates those invariants, the parser MUST throw.

The parser MUST NOT expose or allow direct construction of `DepId` by application code.

## 9. Injectivity and Equivalence Conformance

Within a given parser profile, the implementation MUST preserve semantic injectivity and MUST implement only the equivalence classes defined by that profile. Introducing additional equivalence classes within a profile is non-compliant.

Any change that weakens injectivity within a profile is a breaking change.

## 10. Unit Test Requirements

Parser implementations MUST achieve 100% branch coverage of parsing logic.

Unit tests MUST cover grammar validation branches, profile validation branches, transformation branches, architecture-defined equivalence classes, all error categories, invariant violation scenarios, deterministic success cases, and deterministic failure classification.

Tests MUST verify that successful parsing produces a valid `DepId`, invalid input always throws, error category is correct for each violation type, repeated invocation on identical input is structurally stable, and no side effects are observable.

## 11. Deterministic Stability

Given a fixed parser implementation and fixed profile definition, the mapping from EDD to `DepId` MUST remain stable within a library version.

Any semantic change that alters resulting structural `DepId` values for previously valid EDD inputs is a breaking change. Cosmetic refactoring that preserves structural output and error classification is permitted.

## 12. Conformance Boundary

The parser implementation MUST remain within architectural boundaries for EDD interpretation, structural canonical `DepId` identity, fail-fast semantics, semantic injectivity, and determinism scope.

The parser MUST NOT modify or extend immutable core linking pipeline stages, introduce additional extension points, alter resolver semantics, or introduce non-deterministic behavior.
