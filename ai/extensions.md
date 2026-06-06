# extensions.md

Version: 20260606

## Purpose

The container supports controlled extension of dependency resolution through three distinct mechanisms:

- preprocess hooks;
- postprocess hooks;
- wrapper exports.

These mechanisms are related but not interchangeable.

## Preprocess Hooks

Preprocess hooks transform CDC identities before resolution.

Signature:

```js
(depId) => depId
```

Properties:

- registered with `addPreprocess()`;
- run in declared order;
- receive and return DepId DTO values;
- affect identifier interpretation before module resolution.

Typical uses:

- CDC alias rewriting;
- policy-driven identifier normalization;
- project-specific prefix adaptation.

## Postprocess Hooks

Postprocess hooks transform resolved values after instantiation and before wrapper exports.

Signature:

```js
(value) => value
```

Properties:

- registered with `addPostprocess()`;
- run for every resolved value;
- run in declared order;
- do not alter CDC parsing or module resolution.

Typical uses:

- global instrumentation;
- value normalization;
- cross-cutting adaptation applied uniformly to all resolved values.

## Wrapper Exports

Wrapper exports are selected directly from CDC suffixes and are resolved from the same module namespace as the dependency being composed.

Signature:

```js
(value) => value
```

Properties:

- selected by wrapper suffixes such as `_wrapLog`;
- applied only when present in the CDC;
- executed after postprocess hooks and before freeze;
- not registered globally in the container.

Example:

```txt
App_Service$$_wrapLog_wrapTrace
```

In this example the container composes the dependency, applies postprocess hooks, then applies wrapper exports `wrapLog` and `wrapTrace` in that order.

## Execution Order

The extension-related execution order is:

1. preprocess hooks;
2. instantiation or as-is resolution;
3. postprocess hooks;
4. wrapper exports;
5. freeze.

## Constraints

Extensions must satisfy these constraints:

- they must be registered before the first `get()` if they use container registration APIs;
- they should be deterministic for the same input;
- they must not rely on mutating frozen returned values;
- they must not bypass lifecycle semantics enforced by the container.
