# Error Model (Default EDD Profile)

Path: `./ctx/docs/architecture/parser/error-model.md`

## 1. Scope

This document defines the architectural error semantics of the default EDD parser. It specifies classification rules, termination semantics, and error boundaries. It does not prescribe concrete error class hierarchies.

## 2. Termination Semantics

Any validation or invariant violation terminates parsing immediately. Parsing must not continue after the first detected violation. The parser does not expose partial state and does not return partially constructed `DepId` objects.

The parser MUST terminate by throwing an error.

Returning error objects, result wrappers, or out-of-band error values is not permitted.

## 3. Error Categories

Parser errors are classified into the following categories:

- `GrammarViolation`
- `ProfileViolation`
- `DepIdInvariantViolation`

These categories define semantic classes of failure. Additional categories may be introduced in the future without constituting a breaking architectural change.

## 4. Classification Rules

1. Grammar rules are evaluated before profile rules.
2. If a Grammar Rule is violated, the error must be classified as `GrammarViolation`.
3. Profile rules are evaluated only after Grammar Rules succeed.
4. If a Profile Rule is violated, the error must be classified as `ProfileViolation`.
5. Structural invariant violations occurring after DTO construction must be classified as `DepIdInvariantViolation`.

If multiple violations exist, classification corresponds to the first detected violation under deterministic validation logic. No full validation is required once a failure condition is identified.

## 5. Error Information

The thrown error must contain:

- a human-readable message,
- a description of the reason for failure.

The architectural layer does not mandate a specific error object structure. Inclusion of the original EDD string in the error payload is implementation-defined.

## 6. Determinism of Error

For a given input string and the default profile definition, error classification must be deterministic. Identical input must always produce the same error category under compliant implementations.

## 7. Isolation from Resolver Errors

Errors produced by module resolution, export verification, loader interaction, or runtime linking are not part of the parser error model. The parser error model applies exclusively to EDD validation and transformation into `DepId`.

## 8. Architectural Consistency

This error model preserves fail-fast semantics, deterministic classification, strict separation between parser and resolver responsibilities, and prohibition of partial state exposure.
