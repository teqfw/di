# Product Documentation (`./ctx/docs/product/`)

Path: `./ctx/docs/product/AGENTS.md`

## Purpose

The `ctx/docs/product/` directory defines the product-level meaning of the `@teqfw/di` method: an LLM-first declarative discipline of structuring JavaScript modules around explicit Canonical Dependency Contracts (CDC), the Default CDC Profile, and deterministic late binding. It positions the library `@teqfw/di` as the reference implementation of this method and defines product intent, principles, scope, and responsibility boundaries, including its role as a foundational base of Tequila Framework (TeqFW).

## Level Boundaries

This level describes what the product is, what responsibility it accepts, and what responsibility it excludes. It does not define internal linking mechanics in stepwise execution detail, organizational interaction procedures, or implementation-level code conventions.

This level defines normative product assumptions about declarative dependency metadata, static reconstructibility, and prohibition of reflection-based dependency extraction as part of product identity. Architectural execution structure, DTO invariants, and extension surfaces are defined at architecture level.

## Consistency Rule

Documents of this level must remain semantically aligned in product identity (method-first), reference implementation framing (`@teqfw/di`), declared scope, deterministic runtime linking guarantee, LLM-first static-declaration positioning, module-level dependency descriptor model, the Default CDC Profile as the only CDC interpretation at product level, Default CDC Profile immutability and compatibility boundary, and immutable linking semantics. Product statements may differ in granularity but must not introduce conflicting responsibility boundaries or conflicting product positioning.

## Level Map

- `AGENTS.md` — this document, defining purpose, boundaries, and consistency rules of the product level.
- `default-cdc-profile.md` — product-level normative positioning, compatibility guarantees, and stability policy for the default CDC profile.
- `overview.md` — product overview describing purpose, domain problem, architectural position, and value.
- `principles.md` — declarative product principles that constrain product behavior and evolution.
- `scope.md` — product scope and explicit responsibility boundaries, including out-of-scope concerns.

## Summary

`ctx/docs/product/AGENTS.md` defines the governed space of the product documentation level and provides a navigational anchor for its documents while preserving internal semantic consistency.
