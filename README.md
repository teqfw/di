# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)


`@teqfw/di` is a dependency injection container for standard JavaScript. This library is compatible with both browser
and Node.js environments when using JS, but is exclusive to Node.js when using TS.

**This library only supports ES6 modules ([the live demo](https://flancer64.github.io/demo-di-app/)).**

This library is primarily designed to simplify the binding of code objects with minimal manual configuration required
for the object container. All instructions related to connections are encapsulated within the dependency identifiers
used in constructors or factory functions, as per the constructor injection scheme:

```js
export default class App_Main {
    constructor(
        {
            App_Config$: config,
            App_Logger$: logger,
            App_Service_Customer$: servCustomer,
            App_Service_Sale$: servSale,
        }
    ) { ... }

}
```

Corresponding files would look like this:

```
./src/
    ./Service/
        ./Customer.js
        ./Sale.js
    ./Config.js
    ./Logger.js
    ./Main.js
```

Setting up object mapping is fairly simple:

```js
import Container from '@teqfw/di';

const container = new Container();
const resolver = container.getResolver();
resolver.addNamespaceRoot('App_', '/path/to/src'); // or 'https://cdn.jsdelivr.net/npm/@vendor/pkg@latest/src'
const app = await container.get('App_Main$');
```

## Key Features

* **Late Binding**: Experience all the usual benefits of late binding at runtime including flexibility, testability,
  modularity, manageability, and a clear separation of concerns.
* **ES6 Modules Integration**: Seamlessly utilize singletons and instances based on ES6 module exports.
* **Interface Usage in Standard JavaScript**: Take advantage of "interfaces" in standard JavaScript, with the added
  benefit of dependency substitution.
* **Object Wrapping**: Enhance the functionality of created objects by adding wrappers (postprocessing).

## Installation

Installation instructions for Node.js:

```shell
$ npm i --save @teqfw/di
```

```js
import Container from '@teqfw/di';
import {platform} from 'node:process';

/** @type {TeqFw_Di_Container} */
const container = new Container();
/** @type {TeqFw_Di_Container_Resolver} */
const resolver = res.getResolver();
resolver.setWindowsEnv(platform === 'win32');
resolver.addNamespaceRoot('App_', '...');
const app = await container.get('App_Main$');
```

Installation instructions for Web as ESM (~5Kb):

```html

<script type="module">
    import {default as Container} from 'https://cdn.jsdelivr.net/npm/@teqfw/di@latest/+esm';

    /** @type {TeqFw_Di_Container} */
    const container = new Container();
    /** @type {TeqFw_Di_Container_Resolver} */
    const resolver = res.getResolver();
    resolver.addNamespaceRoot('App_', 'https://cdn.jsdelivr.net/npm/@flancer64/demo-di-app@0.2/src');
    resolver.addNamespaceRoot('Sample_Lib_', 'https://cdn.jsdelivr.net/npm/@flancer64/demo-di-lib@0.3/src');
    const app = await container.get('App_Main$');
    ...
</script>
```

Installation instructions for Web as UMD (~5Kb):

```html

<script src="https://cdn.jsdelivr.net/npm/@teqfw/di@latest/dist/umd.js"></script>
<script type="module">
    const {default: Container} = window.TeqFw_Di_Container;
    /** @type {TeqFw_Di_Container} */
    const container = new Container();
    ...
</script>
```

## Dependency ID Types

Different Dependency IDs can be used for different imports, such as:

* `App_Service`=> `import * as Service from './App/Service.js'` Import whole module as ES module.
* `App_Service.default` => `import {default} from './App/Service.js'` Import default export as is.
* `App_Service.name` => `import {name} from './App/Service.js'` Import named export as is.
* `App_Service$` => `import {default} from './App/Service.js'; return res ?? (res = default({...}));` Use default export
  as a singleton for container.
* `App_Service$$` => `import {default} from './App/Service.js'; return new default({...})` Create a new default
  export as Instance for each dependency.
* `App_Service.name$` => `import {name} from './App/Service.js'; return res ?? (res = name({...}));` Use named export as
  singleton.
* `App_Service.name$$` => `import {name} from './App/Service.js'; const res = new name({...})` Create a new named export
  as instance.
* `...(proxy,factory,...)`: Add custom wrappers to created objects in postprocessing.

```js
export default class App_Main {
  constructor(
          {
            App_Service: EsModule,
            'App_Service.default': defaultExportAsIs,
            'App_Service.name': namedExportAsIs,
            App_Service$: defaultExportAsSingleton,
            App_Service$$: defaultExportAsInstance,
            'App_Service.name$': namedExportAsSingleton,
            'App_Service.name$$': namedExportAsInstance,
            'App_Service.name(factory)': factoryToCreateInstancesFromNamedExport,
          }
  ) {
    const {default: SrvDef, name: SrvName} = EsModule; // deconstruct the module and access the exports 
  }

}
```

## Summary

The `@teqfw/di` module provides a Dependency Injection feature for JavaScript, which requires minimal manual setup. This
library is functional in both browser and Node.js settings. The module utilizes late binding and an object container
methodology in JavaScript applications. Furthermore, it equips users with the ability to alter object behaviors through
pseudo-interfaces and wrappers. As a result, architectural solutions from other programming languages - namely Java,
PHP, and C# - can be harnessed effectively. This also contributes significantly by maximizing the efficiency of npm
packages and ES6 modules in JavaScript applications, especially within the Node.js environment.