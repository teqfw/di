# Testing Layers

Path: `./ctx/docs/code/layout/testing.md`

## Purpose

This document defines the normative testing-layer model of the base package at the implementation level.

Testing is structured to reflect architectural boundaries of the system. The testing model separates verification of local module contracts from verification of system-level runtime linking semantics.

This document governs implementation-level verification only and does not redefine product meaning, architectural form, architectural execution model, environment assumptions, or level-specific constraints.

Detailed rules are defined in layer-specific contracts and are not duplicated here.

## Layer Model

The project defines two normative testing layers:

- unit testing;
- integration testing.

Both layers are mandatory and operate at distinct architectural boundaries.

The separation of layers is structural and intentional. Each layer verifies a different class of invariants and must not overlap in responsibility.

## Layer Boundaries

Unit testing verifies module-level contracts of individual implementation modules. It validates local invariants, deterministic behavior, fail-fast semantics, structural guarantees, and isolation constraints at the source-file boundary.

Integration testing verifies runtime linking semantics at the container boundary. It validates system-level invariants including composition rules, lifecycle behavior, wrapper execution semantics, test mode behavior, failure-state transitions, and integrity of immutable linking semantics across the full runtime pipeline.

Unit testing protects local correctness.

Integration testing protects architectural behavior.

## Layer Interaction

Unit tests and integration tests are complementary.

- Unit tests do not validate runtime composition.
- Integration tests do not validate internal module normalization or isolated invariants.
- Neither layer substitutes the other.

Behavioral validity of the base package requires both layers to pass.

## Normative References

- `./ctx/docs/code/layout/testing/unit.md`
- `./ctx/docs/code/layout/testing/integration.md`

## Summary

Implementation-level verification is structured into two normative layers:

- Unit testing for module contracts and local invariants.
- Integration testing for runtime linking semantics and architectural behavior.

This layered structure ensures both local correctness and preservation of immutable linking semantics across system evolution.
