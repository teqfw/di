# Architecture Constraints

Path: `./ctx/docs/architecture/constraints.md`

## Purpose

This document defines non-negotiable architectural constraints of the deterministic runtime linking architecture. It fixes prohibited directions of architectural evolution and defines the stability envelope of the current architectural branch.

## Architectural Class Constraint

The system is permanently defined as a deterministic, request-driven runtime linking architecture for native ES modules.

The container has no predefined application entrypoint.

Dependency structure is discovered only from explicit dependency requests and may differ between multiple roots requested within the same composition root.

The container must not introduce graph-driven execution as the primary linking model.

Construction of request-local internal dependency graphs during a single request is permitted, but such graphs must not become public artifacts, persistent state, or a supported product feature.

The following are prohibited:

- introduction of a public dependency graph API;
- introduction of an analysis-only mode as a supported public behavior (graph build, dry-run, preflight scan);
- hybrid static and runtime linking modes as a supported architectural feature;
- replacement or optionalization of the immutable core linking pipeline defined in `ctx/docs/architecture/linking-model.md`;
- modification of structural canonical identity semantics defined in `ctx/docs/architecture/depid-model.md`;
- expansion or contraction of determinism scope under identical configuration and contracts.

## Request-Local Pre-Resolution Constraint

For each dependency request, the container must perform complete request-local dependency discovery for the root and all transitively required dependencies before starting object instantiation.

If the dependency structure cannot be fully discovered due to missing sources, invalid contracts, or unsatisfied prerequisites, the container must fail fast and must not partially instantiate the requested structure.

This discovery is not a separate public mode of operation and must not be exposed as a standalone API.

## Cycle Handling Constraint

Cyclic dependencies are prohibited.

Cycle detection is permitted as an internal safety mechanism.

Cycle handling must not introduce graph-driven orchestration, scheduling, or graph-based lifecycle planning.

## Configuration Constraint

Linking behavior is defined by finalized container configuration.

Runtime reconfiguration after linking begins is prohibited.

Configuration must not change immutable linking semantics, canonical identity semantics, determinism scope, or lifecycle enforcement semantics.

## Extension Constraint

The architectural extension surface is permanently fixed to preprocess and postprocess stages.

Extensions must not alter immutable linking semantics, canonical identity semantics, injectivity guarantees at the parser boundary, request-driven linking form, or fail-fast behavior.

Extensions must not introduce reflection-based inference or any alternative dependency declaration mechanism.

## Stability Boundary

The system remains within its architectural model as long as:

- linking remains request-driven and request-local;
- the immutable core pipeline remains unchanged;
- structural canonical identity semantics remain stable;
- determinism scope is not expanded or reduced;
- no public analysis-only modes or public graph artifacts are introduced.

Any structural modification beyond these boundaries constitutes architectural evolution rather than incremental change.
