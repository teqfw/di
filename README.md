# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

Deterministic runtime DI container for native ES modules.

`@teqfw/di` uses explicit dependency contracts (CDC strings) and module-level dependency descriptors (`__deps__`).
It does not infer dependencies from constructor signatures.

## Version Line

This branch is the v2 line.

- package version: `2.0.0`
- changelog starts from `2.0.0`

## Installation

```bash
npm install @teqfw/di
```

## Quick Start

### 1. Define modules with `__deps__`

`src/App/Child.mjs`

```js
export default function App_Child() {
    return {name: 'child'};
}
```

`src/App/Root.mjs`

```js
export const __deps__ = {
    child: 'App_Child$',
};

export default function App_Root({child}) {
    return {
        name: 'root',
        child,
    };
}
```

### 2. Configure container in composition root

```js
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const container = new Container();
container.addNamespaceRoot('App_', path.resolve(__dirname, './src/App'), '.mjs');

const root = await container.get('App_Root$');
console.log(root.name);        // root
console.log(root.child.name);  // child
console.log(Object.isFrozen(root)); // true
```

## Dependency Descriptor (`__deps__`)

`__deps__` is a static module export:

```js
export const __deps__ = {
    localName: 'Some_CDC',
};
```

Rules used by container runtime:

- if `__deps__` is missing: module has zero dependencies
- keys are local argument names passed into factory/class constructor
- values are CDC strings
- dependencies are resolved recursively before instantiation

## CDC Grammar (Default Profile)

Surface form:

```text
[PlatformPrefix]ModuleName[__ExportName][LifecycleAndWrappers]
```

Where:

- `PlatformPrefix`: `node_` | `npm_` | omitted (`teq` by default)
- `Export segment`: `__ExportName`
- `Lifecycle marker`: `$` | `$$` | `$$$`
- `Wrappers`: `_<wrapperId>` suffixes after lifecycle marker

Examples:

- `App_Service` - whole module (`as-is`)
- `App_Service$` - default export as factory with lifecycle marker
- `App_Service__build$$` - named export `build` with lifecycle marker
- `App_Service$$_wrapLog_wrapTrace` - wrapper chain in declared order
- `node_fs` - Node builtin
- `npm_lodash` - npm package

Notes:

- explicit `teq_` prefix is forbidden
- wrappers without lifecycle marker are invalid
- parser is deterministic and fail-fast

## Public API

```js
const container = new Container();
```

Builder stage methods (only before first `get`):

- `setParser(parser)`
- `addNamespaceRoot(prefix, target, defaultExt)`
- `addPreprocess(fn)`
- `addPostprocess(fn)`
- `enableLogging()`
- `enableTestMode()`
- `register(cdc, mock)` (only in test mode)

Resolution:

- `await container.get(cdc)`

Behavioral guarantees:

- configuration is locked after first `get`
- fail-fast pipeline
- deterministic linking under identical contracts and config
- produced values are frozen
- container enters failed state after fatal linking error

## Wrappers

Wrappers are regular exports of the same module and are executed in declaration order.
Each wrapper receives current value and must return synchronously.

```js
export default function App_Service() {
    return {steps: ['core']};
}

export function wrapLog(value) {
    value.steps.push('log');
    return value;
}
```

Request:

```js
await container.get('App_Service$$_wrapLog');
```

## Test Mode and Mocks

```js
container.enableTestMode();
container.register('App_Service$', {name: 'mock-service'});
```

Mock lookup uses canonical parsed dependency identity and is applied before resolver/instantiation.

## Browser Usage

ESM via jsDelivr:

```html
<script type="module">
  import Container from 'https://cdn.jsdelivr.net/npm/@teqfw/di@2/+esm';
  const container = new Container();
</script>
```

## Documentation Source

Normative docs live in `ctx/`:

- product overview: `ctx/docs/product/overview.md`
- default CDC profile: `ctx/docs/product/default-cdc-profile.md`
- grammar: `ctx/docs/architecture/cdc-profile/default/grammar.md`
- transformation: `ctx/docs/architecture/cdc-profile/default/transformation.md`
- validation: `ctx/docs/architecture/cdc-profile/default/validation.md`
- container contract: `ctx/docs/code/components/container.md`
