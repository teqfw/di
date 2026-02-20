# Testing Contract

Path: `./ctx/docs/code/testing.md`

## Purpose

This document defines the normative unit-testing contract of the base package. It specifies placement rules, structural mirroring requirements, isolation constraints, determinism requirements, and failure semantics at the implementation level.

This document governs implementation-level testing only and does not redefine architectural or product-level semantics.

The only normative testing type defined here is unit testing.

## Scope

The contract applies to all implementation modules located in the primary source directory (e.g., `src2/`).

A source file is considered testable if it contains executable logic, structural normalization, or invariant enforcement.

Pure re-export modules containing no logic are exempt from the one-to-one test requirement.

## Unit Testing

### Structural Mirroring

Unit tests are located exclusively in:

```txt
./test2/unit/
```

The directory structure inside `test2/unit/` MUST mirror the structure of the primary source directory.

For every testable source file, exactly one corresponding unit test file MUST exist.

Example:

```txt
src2/Dto/DepId.mjs
→
test2/unit/Dto/DepId.test.mjs
```

Structural mirroring is mandatory.

### Isolation Invariant

Unit tests MUST be fully isolated.

Unit tests MUST NOT perform:

- filesystem access;
- network access;
- timer-based execution;
- environment-variable access;
- process-level state mutation.

If a module interacts with external facilities, those interactions MUST be abstracted and controlled within the test boundary.

Unit tests MUST NOT depend on global mutable state.

### Determinism Invariant

For modules that define deterministic behavior, unit tests MUST verify that:

- identical input produces structurally identical output;
- repeated invocation does not mutate prior results;
- no hidden state persists across calls.

Determinism verification applies strictly to documented module contracts.

### Failure Semantics

For modules that specify fail-fast behavior, unit tests MUST verify that:

- invalid input results in immediate failure;
- no partial structures are returned;
- failure is expressed through standard `Error`.

Error message wording is not part of the contract unless explicitly defined elsewhere.

### Structural Verification

Where applicable, unit tests MUST verify:

- complete structural shape of returned objects;
- normalization rules;
- immutability guarantees when specified;
- absence of unintended mutation.

Unit tests MUST validate only behavior defined in code-level contracts and MUST NOT rely on undocumented internal implementation details.

## Tooling

The normative testing stack consists of:

- `node:test`;
- `node:assert/strict`.

All unit tests MUST use the normative stack.

## Contract Boundary

This testing contract governs structural and behavioral verification of individual modules.

It does not define integration testing, runtime composition validation, or system-level behavior.

Unit tests operate strictly at the module contract boundary.

## Summary

The base package defines a single normative testing layer: unit testing.

Each testable module MUST have exactly one corresponding unit test file. Tests MUST mirror source structure, enforce isolation, validate determinism where specified, verify fail-fast semantics where defined, and remain free of real side effects.

No runtime composition semantics, dynamic module loading behavior, or dependency wiring logic are part of this testing contract.
