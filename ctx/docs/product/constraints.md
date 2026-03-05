# Product Constraints

Path: `./ctx/docs/product/constraints.md`

## Purpose

This document defines non-negotiable product-level constraints of the `@teqfw/di` method. Constraints define what the product must not become and which changes constitute exit from the current product identity.

## Dependency Declaration Constraint

Compliant applications must express dependency relations exclusively through Canonical Dependency Contracts (CDC) declared in module-level dependency descriptors.

The following are prohibited as compliant application dependency mechanisms:

- use of static `import` statements to express application dependency structure;
- reflection-based inference of dependencies from behavioral code;
- implicit injection by signature inspection, parameter-name extraction, decorator metadata, or source parsing;
- hidden registries or container-side heuristics that derive dependencies without explicit descriptors.

Static imports are permitted inside the implementation of the container itself as an implementation technique. They must not become a product-level dependency mechanism for applications.

The container must treat the module-level dependency descriptor as the sole canonical source of declared dependencies for a given export. No inference is permitted.

## Default CDC Profile Constraint

The product ships and normatively defines exactly one CDC interpretation: the Default CDC Profile.

All product-level guarantees apply exclusively under the Default CDC Profile.

Consumers may technically use alternative CDC profiles, but such profiles are outside the product responsibility boundary and outside the guaranteed behavior domain.

Within the Default CDC Profile, the following are prohibited:

- weakening of parser injectivity at the CDC-to-`DepId` boundary;
- introduction of additional equivalence classes beyond those defined by the default profile specification;
- introduction of semantic alias mechanisms that collapse distinct semantic interpretations;
- modification of default-profile grammar, mapping, or validation in a way that changes the resulting structural `DepId` for previously valid CDC without a breaking product change;
- modification of structural identity semantics for previously valid CDC such that the resulting structural `DepId` changes without a breaking product change.

## Determinism Constraint

Given identical declared contracts (CDC and descriptors) and identical finalized container configuration, linking must produce identical outcomes.

Linking behavior must not depend on evaluation-order side effects, hidden mutable global state, or environment-dependent resolution logic.

## Responsibility Boundary Constraint

The product must not expand into application lifecycle orchestration, scheduling, or runtime management beyond deterministic runtime linking under explicit declared contracts.

The product must not introduce build-time analysis modes, preflight validation APIs, or full-application dependency graph generation as supported public behavior.

## Stability Boundary

The product remains within its identity as long as:

- dependency declarations remain explicit and descriptor-driven with no inference;
- the Default CDC Profile remains the only normative CDC interpretation and preserves injective mapping to structural `DepId`;
- deterministic runtime linking under declared contracts remains the core guarantee.

Any change that violates these conditions constitutes exit from the current product identity rather than incremental evolution.
