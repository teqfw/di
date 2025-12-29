# Dependency Language Specification

Path: `ctx/docs/architecture/dependency-language.md`

## 1. Scope and Authority

This document defines the **canonical dependency description language (DSL)** used by the `@teqfw/di` container to interpret dependency identifiers within an ES6 module runtime environment.

This document is **normative**.
All dependency identifiers appearing in code, configuration, tests, and examples **MUST** conform to this specification.

In case of discrepancies with any other materials (README, examples, tests, implementation), **this document takes precedence**.

This specification is subordinate to the architectural constraints defined in `ctx/docs/architecture/dependency-model.md` and must not contradict them.

## 2. Language Intent

The dependency description language defines a **single formally specified textual representation** of dependencies, intended for:

- declarative use in constructor and factory signatures,
- mechanical interpretation by the container,
- deterministic processing by automated agents.

The language defines **only the syntax and semantics of dependency identifiers**.
It does **not** describe container implementation, resolution algorithms, or execution mechanisms.

A dependency identifier is an **opaque architectural token**, whose meaning is derived exclusively from this specification and the dependency model.

## 3. Language Boundaries

The language is intentionally limited in expressive power.

The language:

- describes **which dependency is requested**;
- encodes factory semantics, lifecycle semantics, and post-processing directives;
- is applicable only within standard ES6 module semantics.

The language does **not**:

- describe dependency graphs;
- allow computed or conditional identifiers;
- provide alternative syntaxes or dialects;
- expose internal container mechanisms;
- allow runtime dependency resolution initiated by objects.

There exists **exactly one canonical dependency description language** for `@teqfw/di`.

## 4. Lexical Form

A dependency identifier is a **non-empty string**, interpreted as a whole and indivisible into sub-expressions.

An identifier is not an expression, filesystem path, or URI, and does not allow interpolation, escaping, or evaluation.

Identifier parsing is performed by the container as a **string literal analysis** according to the formal rules of the language.

## 5. Dependency Identifier Structure

A dependency identifier is a linear string consisting of positional segments in a fixed order:

- optional platform prefix;
- mandatory module or package name;
- optional export selector;
- optional lifecycle marker;
- optional wrapper declaration.

Absence of a segment is interpreted according to default rules.

### 5.1 Platform Prefix

Only a single platform prefix is allowed: `node:`.

The presence of the prefix indicates resolution within the Node.js environment; its absence indicates resolution within the user ES6 module namespace.

### 5.2 Module Path Segment

The module name is mandatory and defines the logical name of an ES6 module or Node.js package.

Allowed characters include alphanumeric characters, `_`, `-`, a single nesting level using `/`, and scoped package form `@scope/package`.

The module name does not contain file or physical path information.
Module name to source path mapping invariants are defined in `ctx/docs/architecture/namespace-addressing.md`.

### 5.3 Export Selector

The export selector is separated from the module name using `.` or `#`.

An explicit export name is allowed, as well as an empty selector interpreted as `default`.

### 5.4 Lifecycle Marker

The lifecycle marker is specified using `$` or `$$`.

`$` indicates reuse of a single factory composition result, while `$$` indicates creation of a new result on each resolution.

The marker applies only when the identifier refers to a factory export.

### 5.5 Wrapper Clause

Wrappers are specified at the end of the identifier in parentheses as a comma-separated list of names.

Wrappers are interpreted as post-processing directives applied by the container and are executed in declaration order.

## 6. Lifecycle Semantics

Lifecycle semantics define rules for reuse of factory composition results.

### 6.1 As-Is Resolution

When no export selector and no lifecycle marker are present, the identifier refers to the ES6 module as a whole.

In this mode, the container returns the module object without factory composition; subsequent post-processing is determined by language rules.

### 6.2 Singleton Marker (`$`)

The `$` marker indicates reuse of a single factory composition result.

### 6.3 Instance Marker (`$$`)

The `$$` marker indicates creation of a new factory composition result for each dependency resolution.

### 6.4 Invalid Combinations

Combinations of markers and identifier forms that have no defined semantics within the language are considered invalid.

## 7. Export Addressing Semantics

The export selector determines which module export is used for dependency resolution.

Factory composition is permitted only for exports that are functions.

Non-functional exports are used without factory composition and without lifecycle markers.

## 8. Wrapper Semantics

Wrappers define declarative post-processing of the result returned by the container.

Wrappers are applied after the dependency result is obtained and before it is delivered to the consumer.

Wrappers do not affect export selection, factory semantics, or lifecycle semantics.

## 9. Platform-Specific Identifiers

Identifiers with the `node:` prefix are resolved using the standard Node.js module loading mechanism.

The platform prefix affects only the module source and does not alter other interpretation rules.

## 10. Identifier Interpretation Order

Identifier interpretation is performed as a deterministic unidirectional process:

1. platform determination;
2. module name interpretation;
3. export selector resolution;
4. factory determination;
5. lifecycle marker interpretation;
6. wrapper application.

## 11. Forbidden Forms

The following are considered invalid:

- syntactically invalid identifiers;
- marker combinations without defined semantics;
- nested or parameterized wrappers;
- unknown platform prefixes;
- use of filesystem paths;
- computed or dynamic identifiers.

## 12. Canonical Identifier Examples

- `App_Service`
- `App_Service.default`
- `App_Service.name`
- `App_Service$`
- `App_Service$$`
- `App_Service.name$`
- `App_Service.name$$`
- `App_Service.name(proxy)`
- `node:fs`
- `node:fs.readFile$`
- `node:@scope/package.export$$`

## 13. Non-Goals

This specification does not describe dependency graphs, optimization, alternative DSLs, resolution conditions, type systems, or container behavior beyond identifier interpretation.

## 14. Related Normative Documents

- `ctx/docs/architecture/dependency-model.md`
- `ctx/docs/architecture/namespace-addressing.md`
- `ctx/docs/architecture/types-map.md`
- `ctx/docs/product/overview.md`
