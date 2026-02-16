# Constraints Overview

Path: `./ctx/docs/constraints/overview.md`

## Purpose

This document defines the mandatory design boundaries of the system and the prohibited directions of architectural evolution. It fixes the stability boundary of the deterministic runtime linking architecture and distinguishes between forbidden transformations and behavior that lies outside the system’s responsibility domain.

Constraints define what the system must not become and which changes constitute exit from the current architectural model.

## Architectural Class Constraint

The system is permanently defined as a deterministic runtime linking architecture.

The following transformations are prohibited:

- transition to lazy graph resolution;
- hybrid static/runtime linking models;
- alternative linking modes within the same package;
- replacement of the immutable core pipeline;
- modification of identity semantics;
- expansion or contraction of determinism scope.

Any of the above constitutes exit from the current architectural model and requires a new architectural branch of the product.

The immutable core is an irreversible architectural decision.

## Dependency Control Constraint

All dependency relations within applications using the system must be expressed exclusively through External Dependency Declarations and resolved by the container.

The following are prohibited:

- use of static `import` as an alternative dependency mechanism;
- distributed or remote resolution;
- partial dependency graph precomputation;
- environment-dependent resolution logic.

The container is the sole authority over dependency linking semantics within its scope.

## EDD and Parser Contract Constraint

The parser profile defines the encoding contract of dependency declarations.

Within a single parser profile, the following are prohibited:

- modification of EDD grammar without profile version change;
- weakening of parser injectivity;
- introduction of implicit alias mechanisms.

Parser injectivity is a permanent constraint.

Distinct EDD values must remain semantically distinct within a profile.

## Configuration Constraint

Linking behavior is defined by finalized container configuration.

The following are prohibited:

- runtime reconfiguration after linking begins;
- configuration-dependent changes of resolution semantics across environments.

Container configuration must be fully textually determinable and reproducible as a defined state.

The system does not regulate how configuration is constructed prior to initialization, but determinism guarantees apply only to the finalized configuration state.

## Extension Constraint

The extension surface consists exclusively of preprocess and postprocess stages and is permanently fixed.

These stages always exist as part of the pipeline and cannot be disabled.

Determinism and fail-fast guarantees apply only under well-formed extensions.

Well-formed extensions are those that:

- preserve determinism under identical configuration and inputs;
- do not introduce environment-dependent behavior;
- do not modify core pipeline structure;
- do not alter canonical identity semantics.

Extensions that violate these conditions place the system outside its guaranteed behavior domain.

Side-channel communication between extensions is not regulated but voids architectural guarantees.

## State Boundary Constraint

Global mutable state external to the container is permitted if it does not affect linking semantics, identity, resolution, lifecycle enforcement, or freeze behavior.

The system does not regulate internal behavior of created objects.

Non-deterministic factories and object-level randomness are outside the responsibility boundary of the container.

## Environment Constraint

Native ES module transparency is a product principle but not a structural prohibition.

CommonJS modules are permitted through explicit ESM adapters.

Transpiled code is permitted if linking semantics remain ESM-oriented and core invariants are preserved.

## Container Responsibility Boundary

All architectural guarantees apply strictly within a single container instance.

Composition of multiple containers, nested containers, or external lifecycle orchestration is outside the system’s responsibility domain.

The system guarantees determinism, identity stability, and fail-fast behavior only within the controlled scope of one configured container.

## Stability Boundary

The system remains within its architectural model as long as:

- the immutable core pipeline remains unchanged;
- identity semantics remain stable;
- parser injectivity is preserved;
- determinism scope is not expanded or reduced;
- extension surface remains fixed.

Any structural modification beyond these boundaries constitutes architectural evolution rather than incremental change.

The current constraints define the stability envelope of the deterministic runtime linking architecture.
