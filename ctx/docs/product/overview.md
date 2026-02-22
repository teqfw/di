# LLM-First Declarative JavaScript Method

Path: `./ctx/docs/product/overview.md`

## Purpose

The product is an LLM-first disciplined method of writing JavaScript applications on the ES module execution model. The method eliminates static imports as an application dependency mechanism and replaces them with explicit Canonical Dependency Contracts (CDC) and module-level dependency descriptors, enabling deterministic late binding while preserving execution isomorphism across browser and Node.js environments.

The library `@teqfw/di` is the reference implementation of this method and serves as a foundational base of Tequila Framework (TeqFW), a platform for agent-oriented construction and maintenance of isomorphic JavaScript applications.

## Method, Not Framework

The product is a method of structuring modules, not a framework or an architectural style.

The method defines a discipline in which:

- application dependency structure is not expressed via static `import` statements;
- dependency requirements of module exports are declared explicitly as static data;
- dependency contracts are expressed as CDC and interpreted by the Default CDC Profile;
- runtime linking is deterministic under identical CDC, descriptors, and configuration;
- the same linking model applies in browser and Node.js environments.

The library enforces these constraints and provides a mechanically predictable runtime for late binding.

## Development Model Assumptions

When applied in practice to the construction and maintenance of JavaScript applications, the method assumes an LLM-first workflow in which:

- Agents generate and maintain dependency declarations and module-level contracts as part of the structural code surface of the application.
- Humans perform semantic review, validate architectural intent, and enforce documented invariants.
- Dependency metadata of the application is explicit, static, and structurally predictable.
- Dependency metadata is reconstructible without runtime reflection, function source parsing, or signature inference.

## Dependency Contract Model

Dependencies are declared as Canonical Dependency Contracts (CDC). A CDC is a string-level canonical linking contract interpreted by the Default CDC Profile. Under this profile, CDC strings deterministically map to a structural canonical representation (`DepId`) used by immutable linking semantics.

CDC encodes dependency identity, export selection, composition semantics, lifecycle semantics, and wrapper declarations at the contract surface.

Dependency identity is determined by structural `DepId` fields, not by raw CDC string equality. The Default CDC Profile is normative and defines compatibility between applications with respect to dependency contracts.

The Default CDC Profile and its stability boundary are positioned in `ctx/docs/product/default-cdc-profile.md`. The formal grammar, transformation model, and validation rules are specified at architecture level in `ctx/docs/architecture/cdc-profile/default/`.

## Module-Level Dependency Descriptor Model

Dependencies of a module export are declared via a static ES module export descriptor. The descriptor is part of the public module contract and is intended to be generated and updated mechanically.

The descriptor is indexed by export name (including `default`) and defines the CDC set required for that export. Descriptor omission is interpreted as an empty dependency set. No implicit inference is permitted.

Runtime signature analysis, constructor parameter parsing, and other reflection-based dependency extraction mechanisms are outside the product model.

## Problem Domain

Modern JavaScript applications commonly embed dependency structure through static imports. This fixes dependency graphs at authoring time, increases structural coupling, constrains architectural evolution, and introduces divergence between frontend and backend execution models.

Many dependency injection approaches rely on transpilation, compile-time metadata, or manual container configuration. These mechanisms introduce additional build or configuration surfaces that are not structurally reconstructible from module contracts alone.

`@teqfw/di` replaces static imports as a dependency mechanism with explicit Canonical Dependency Contracts (CDC) and deterministic late binding, without transpilation, compile-time metadata generation, or manual container wiring.

## Guarantees

The method is defined by the following guarantees:

- linking semantics are based on the ES module execution model;
- static imports must not be used to express application dependency structure;
- non-ESM code may be integrated only through explicit ES module adapters;
- no reliance on transpilation or reflection-based dependency extraction;
- identical linking semantics in browser and Node.js environments;
- immutable linking semantics under the Default CDC Profile;
- immutability of created objects enforced by the reference implementation;
- deterministic linking under identical CDC, descriptors, and configuration.

These principles define the architectural scope and limits of the system. All guarantees in this document apply under the Default CDC Profile shipped with the product.

## Value

The method provides a disciplined, structurally explicit dependency model in which contracts are declarative, machine-reconstructible, and normatively interpreted under a stable CDC profile.

This enables deterministic late binding, automatic linking without manual container wiring, reproducible behavior under automation, and a stable cross-environment execution model suitable for agent-oriented development workflows.

## Responsibility Boundary

The product defines the contract surface (CDC, descriptors, and invariants) and guarantees deterministic late binding and isomorphic execution. The library enforces these guarantees at runtime as a reference implementation.

Application lifecycle orchestration, domain behavior, execution policies, concurrency control, and cross-application compatibility of custom dependency formats are outside this boundary.
