# @teqfw/di

A Dependency Injection container for regular JavaScript is provided, which can be used in both browser and Node.js
applications with JS, and in Node.js only with TS.

**This library exclusively supports ES6 modules.**

The primary objective of this library is the late binding for code objects with minimal manual configuration for the
object container. All linking instructions are encapsulated within the dependency identifiers and used in constructors
or factory functions (the constructor injection scheme):

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

The files corresponded to this case:

```
./src/
    ./Service/
        ./Customer.js
        ./Sale.js
    ./Config.js
    ./Logger.js
    ./Main.js
```

Just set up a mapping rules for the container:

```js
import Container from '@teqfw/di';

const container = new Container();
const resolver = container.getResolver();
resolver.addNamespaceRoot('App_', '/path/to/src'); // or 'https://cdn.jsdelivr.net/npm/@vendor/pkg@latest/src'
const app = await container.get('App_Main$');
```

That's all.

## The main benefits

* **Late Binding**: Enjoy all the typical advantages of late binding during runtime, including flexibility, testability,
  modularity, manageability, and clear separation of concerns.
* **Integration with ES6 Modules**: Seamlessly integrate singletons and instances based on ES6 module exports.
* **Interface Usage in Vanilla JS**: Utilize "interfaces" in standard JavaScript, along with dependency substitution (
  preprocessing).
* **Object Wrapping**: Add wrappers to created objects (postprocessing) for enhanced functionality.

## Installation

NodeJS:

```shell
$ npm i --save @teqfw/di
```

Web as ESM (~5Kb):

```html

<script type="module">
    import {default as Container} from 'https://cdn.jsdelivr.net/npm/@teqfw/di@latest/+esm';

    /** @type {TeqFw_Di_Container} */
    const container = new Container();
    ...
</script>
```

Web as UMD (~5Kb):

```html

<script src="https://cdn.jsdelivr.net/npm/@teqfw/di@latest/dist/umd.js"></script>
<script>
    const {default: Container} = window.TeqFw_Di_Container;
    /** @type {TeqFw_Di_Container} */
    const container = new Container();
    ...
</script>
```

## Types of Dependency ID

* `App_Service`=> `import * as Service from './App/Service.js'` as ES Module
* `App_Service.default` => `import {default} from './App/Service.js'` default export as-is
* `App_Service.name` => `import {name} from './App/Service.js'` named export as-is
* `App_Service$` => `import {default} from './App/Service.js'; return res ?? (res = default({...}));` as singleton for
  container
* `App_Service$$` => `import {default} from './App/Service.js'; return new default({...})` as instance for every
  dep
* `App_Service.name$` => `import {name} from './App/Service.js'; return res ?? (res = name({...}));` as singleton
* `App_Service.name$$` => `import {name} from './App/Service.js'; const res = new name({...})` as instance
* `...(proxy,factory,...)`: add custom wrappers on postprocessing

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
        const {default as SrvDef, name as SrvName} = EsModule; // deconstruct the module and access the exports 
    }

}
```

## Resume

`@teqfw/di` offers Dependency Injection for regular JavaScript with minimal manual configuration, supporting both
browser and Node.js environments. Its use of late binding and an object container in JavaScript applications, along with
the ability to modify the behavior of created objects (via pseudo-interfaces and wrappers), allows you to apply
architectural solutions from other languages (such as Java, PHP, C#) and fully harness the capabilities of npm packages
and ES6 modules in JavaScript applications, particularly in the Node.js environment.