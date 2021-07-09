# @teqfw/di

"_DI_" means both "_Dynamic Import_" and "_Dependency Injection_" here. This package allows defining logical namespaces
in your projects, dynamically importing ES6-modules from these namespaces, creating new objects from imported
functions/classes and resolving dependencies in constructors. It uses pure ECMAScript 2015+ (ES6+) and works both for
modern browsers &amp; nodejs apps.

The '_proxy object_' for `constructor` specification is inspired by [awilix](https://github.com/jeffijoe/awilix).
Thanks, guys.

## Installation

```
$ npm i @teqfw/di --save
```

## Introduction

Container
uses [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
to load source files. Each file must be a
valid [ES-module](https://nodejs.org/api/esm.html#esm_modules_ecmascript_modules). Every ES-module forms a namespace for
all nested components (constants, functions, classes). This namespace must have unique name across all other
namespaces (ES-modules) in the application - DI container uses these namespaces to lookup for files with sources.

```ecmascript 6
/**
 * @namespace Vendor_Package_Module_Name
 */
```

ES-modules can use regular import statements in their code:

```ecmascript 6
import ScanData from '../Api/Dto/Scanned.mjs';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
```

but DI container cannot process these imports. Function or class should have this form to be compatible with DI
container:

```ecmascript 6
export default function ObjectFactory(spec) {/* ... */}
export default class SomeClass {
    constructor(spec) {/* ... */}
}
``` 

Factory function or class constructor must have one only input argument - `spec` (specification). This `spec` argument
is a proxy that analyzes requests to `spec` props and creates dependencies on demand (
see [SpecProxy.mjs](src/Shared/SpecProxy.mjs)). So we can interrupt factory for every unresolved dependency, create
requested dependency and return it to the factory.

Typical code for ES-module compatible with DI container:

```ecmascript 6
export default class Vnd1_Pkg1_Prj1_Mod1 {
    constructor(spec) {
        const Mod2 = spec['Vnd2_Pkg2_Prj2_Mod2#']; // get as class
        const mod3 = spec['Vnd3_Pkg3_Prj3_Mod3$']; // get as singleton
        const mod4 = spec['Vnd4_Pkg4_Prj4_Mod4$$']; // get as new instance
    }
}
```

You don't need filenames anymore, use logical namespaces instead (like in
PHP [Zend 1](https://framework.zend.com/manual/2.4/en/migration/namespacing-old-classes.html)).

## Namespaces

[More](doc/namespaces.md)

To resolve namespace

```ecmascript 6
Demo_Main_Plugin_Path_To_Module
```

'_namespace-to-source_' mapping is used:

```ecmascript 6
// node js apps
container.addSourceMapping('Vnd_Pkg', '/.../node_modules/@vnd/package/src', true, 'mjs');
container.addSourceMapping('Vnd_Pkg_Plugin', '/.../node_modules/@vnd/plugin/src', true, 'mjs');
// browsers
container.addSourceMapping('Vnd_Pkg', 'https://.../node/@vnd/package/src', true, 'mjs');
container.addSourceMapping('Vnd_Pkg_Plugin', 'https://.../node/@vnd/plugin/src', true, 'mjs');
```

Using namespaces we can address any ES-module in our application (browser or nodes):

```
Vnd_Pkg_Plugin_Path_To_Module => /.../node_modules/@vnd/plugin/src/Path/To/Module.mjs
Vnd_Pkg_Plugin_Path_To_Module => https://.../node/@vnd/plugin/src/Path/To/Module.mjs
```



## Identifiers

[More](doc/identifiers.md)

ID for manually added dependencies:
```
dbConnection                // singleton
dbTransaction$$             // get new instance using saved factory
```

ID for dynamic imports:
```
Vnd_Pkg_Module              // import whole ES6 module
Vnd_Pkg_Module#             // get default export for ES6 module
Vnd_Pkg_Module#fnName       // get export with name 'fnName' for ES6 module
```

ID for singletons and instances:
```
Vnd_Pkg_Module$             // get singleton object created with default export factory
Vnd_Pkg_Module$$            // get new object created with default export factory
Vnd_Pkg_Module#fnName$      // get singleton object created with 'fnName' export factory
Vnd_Pkg_Module#fnName$$     // get new object created with 'fnName' export factory
```



## Usage in ES6 Modules

### Function
```ecmascript 6
export default function Vnd_Pkg_Plugin_Fn(spec) {
    const singleton = spec['dbConfig'];
    const newInstance = spec['dbTransaction$$'];
    const module = spec['Vnd_Pkg_Plugin_Shared_Util'];
    const defExport = spec['Vnd_Pkg_Plugin_Shared_Util#'];
    const defExportSingleton = spec['Vnd_Pkg_Plugin_Shared_Util$'];
    const defExportNewInstance = spec['Vnd_Pkg_Plugin_Shared_Util$$'];
    // ...
}
```

### Class
```ecmascript 6
export default class Vnd_Pkg_Plugin_Class {
    constructor(spec) {
        const singleton = spec['dbConfig'];
        // ...
    }
}
```


## Frontend Bootstrap

We need to proxy our `node_modules` scripts to browser (`express` example):
```ecmascript 6
// map all './node_modules/' requests to './node_modules/' folder as static resources requests
server.all('*/node_modules/*', function (req, res, next) {
    const urlParts = /^(\/node_modules\/)(.*)/.exec(req.url);
    // convert '/node/path' to './node_modules/path' to import DI container sources as is (w/o namespaces)
    const path = $path.join(pathNode, urlParts[2]);
    const mimeType = $mimeTypes.lookup(path);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', mimeType);
    res.sendFile(path);
    console.debug(`${req.method} ${req.url}`);
});
```

`index.html`:
```html
<script type="module">
    const baseUrl = location.href;
    // load DI container as ES6 module (w/o namespaces)
    import(baseUrl + 'node_modules/@teqfw/di/src/Container.mjs').then(async (modContainer) => {
        // init container and setup namespaces mapping
        /** @type {TeqFw_Di_Shared_Container} */
        const container = new modContainer.default();
        const pathMain = baseUrl + 'node_modules/@flancer64/demo_teqfw_di_mod_main/src';
        const pathPlugin = baseUrl + 'node_modules/@flancer64/demo_teqfw_di_mod_plugin/src';
        container.addSourceMapping('Vnd_Pkg', pathMain, true, 'mjs');
        container.addSourceMapping('Vnd_Pkg_Plugin', pathPlugin, true, 'mjs');
        // get main front as singleton
        /** @type {Vnd_Pkg_Front} */
        const frontMain = await container.get('Vnd_Pkg_Front$');
        frontMain.run();
    });
</script>
```



## Server Bootstrap

```ecmascript 6
import Container from '@teqfw/di';
// ...
const container = new Container();
const pathMain = $path.join(pathNode, '@flancer64/demo_teqfw_di_mod_main/src');
const pathPlugin = $path.join(pathNode, '@flancer64/demo_teqfw_di_mod_plugin/src');
container.addSourceMapping('Demo_Main', pathMain, true, 'mjs');
container.addSourceMapping('Demo_Main_Plugin', pathPlugin, true, 'mjs');
// ...
const mainHandler = await container.get('Demo_Main_Server$$');
const pluginHandler = await container.get('Demo_Main_Plugin_Server$$');
```

## Demo

[flancer64/demo_teqfw_di](https://github.com/flancer64/demo_teqfw_di)

## Class extending

It is not trivial, but it's possible.

Base class:

```ecmascript 6
export default class Test_BaseClass {
    name = 'base';
}
```

Use factory in child ES-module to load base class and to extend it:

```ecmascript 6
export default function Factory(spec) {
    const BaseClass = spec['Test_BaseClass#'];

    class Test_ChildClass extends BaseClass {}

    return Test_ChildClass;
}
```

Use it:

```ecmascript 6
const ChildClass = await container.get('Test_ChildClass$'); // create class definition and save it as singleton
const obj = new ChildClass();
console.log('name: ' + obj.name);
```
