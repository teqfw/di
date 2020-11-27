# @teqfw/di

<span style="color:red">**IT WORKS WITH ES6 MODULES WITH "\*.mjs" EXT ONLY AND DOES NOT SUPPORT 'extends' IN CLASSES.**</span>

"_DI_" means both "_Dynamic Import_" and "_Dependency Injection_". This package allows defining namespaces in your projects, dynamically importing ES6-modules from these namespaces, creating new objects from imported functions/classes and resolving dependencies in constructors. This works both for browsers &amp; nodejs apps.

The '_proxy object_' for `constructor` specification is inspired by [awilix](https://github.com/jeffijoe/awilix). Thanks, guys.



## Installation

```
$ npm i @teqfw/di --save
```



## The Problem

ES6 `import` statement does not work both in browser and nodes without changes. This works in a nodejs app:
```ecmascript 6
import ClassA from 'packageA/ClassA.mjs'
``` 
but will fail in a browser:
```
Uncaught (in promise) TypeError: Failed to resolve module specifier "packageA/ClassA.mjs". 
Relative references must start with either "/", "./", or "../".
```

This works in a browser:
```ecmascript 6
import ClassA from './packageA/ClassA.mjs'
```
but will fail in nodejs app because `packageA` is placed under `./node_modules/` folder.



## Solution

Use container to load ES6-modules, import modules stuff and create objects on demand.

We can use `factory` function to create objects with one argument only:
```ecmascript 6
export default function FactoryFn(spec) {/* ... */}
export default class FactoryClass {
    constructor(spec) {/* ... */}
}
```  

This `spec` argument is a proxy analyzes request to `spec` props and creates dependencies on demand (see [SpecProxy.mjs](./src/SpecProxy.mjs)). So we can interrupt factory for every unresolved dependency, create requested dependency and return it to the factory.



## Namespaces
[More](./docs/namespaces.md)

This library uses [Zend1-like](https://framework.zend.com/manual/2.4/en/migration/namespacing-old-classes.html) namespaces (old style):
```ecmascript 6
Demo_Main_Plugin_Path_To_Module
```

and 'namespace-to-source' mapping:
```ecmascript 6
container.addSourceMapping('Demo_Main', '/.../node_modules/@package1/main/src', true, 'mjs');
container.addSourceMapping('Demo_Main_Plugin', '/.../node_modules/@package2/plugin/src', true, 'mjs');
// or
container.addSourceMapping('Demo_Main', 'https://.../node/@package1/main/src', true, 'mjs');
container.addSourceMapping('Demo_Main_Plugin', 'https://.../node/@package2/plugin/src', true, 'mjs');
```

With namespaces we can address any ES6-module in our application (browser or nodes):
```
Demo_Main_Plugin_Path_To_Module => /.../node_modules/@package2/plugin/src/Path/To/Module.mjs
Demo_Main_Plugin_Path_To_Module => https://.../node/@package2/plugin/src/Path/To/Module.mjs
```



## Identifiers
[More](./docs/identifiers.md)

ID for dependencies being manually added to the container (w/o namespaces):
```
dbConnection                // singleton
dbTransaction$$             // get new instance using saved factory
```

ID for dynamic imports:
```
Demo_Main_Module              // import whole ES6 module
Demo_Main_Module#             // get default export for ES6 module
Demo_Main_Module#fnName       // get export with name 'fnName' for ES6 module
```

ID for dependency injection:
```
Demo_Main_Module$             // get singleton object created with default export factory
Demo_Main_Module$$            // get new object created with default export factory
Demo_Main_Module#fnName$      // get singleton object created with 'fnName' export factory
Demo_Main_Module#fnName$$     // get new object created with 'fnName' export factory
```



## Usage in ES6 Modules

### Function
```ecmascript 6
export default function Demo_Main_Plugin_Fn(spec) {
    const singleton = spec.dbConfig;
    const newInstance = spec.dbTransaction$$;
    const module = spec.Demo_Main_Plugin_Shared_Util;
    const defExport = spec['Demo_Main_Plugin_Shared_Util#'];
    const defExportSingleton = spec.Demo_Main_Plugin_Shared_Util$;
    const defExportNewInstance = spec.Demo_Main_Plugin_Shared_Util$$;
    // ...
}
```

### Class
```ecmascript 6
export default class Demo_Main_Plugin_Class {
    constructor(spec) {
        const singleton = spec.dbConfig;
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
        /** @type {TeqFw_Di_Container} */
        const container = new modContainer.default();
        const pathMain = baseUrl + 'node_modules/@flancer64/demo_teqfw_di_mod_main/src';
        const pathPlugin = baseUrl + 'node_modules/@flancer64/demo_teqfw_di_mod_plugin/src';
        container.addSourceMapping('Demo_Main', pathMain, true, 'mjs');
        container.addSourceMapping('Demo_Main_Plugin', pathPlugin, true, 'mjs');
        // get main front as singleton
        /** @type {Demo_Main_Front} */
        const frontMain = await container.get('Demo_Main_Front$');
        frontMain.out('#main', '#plugin');
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



## Limitations

### Class extending

This container cannot create instances for class with 'extends' statement:
```ecmascript 6
export default class Demo_Main_Mod extends Demo_Main_Base {}
```


### '*.mjs' extensions

We always need to use `*.mjs` extension to prevent this error: 
```
(node:506150) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
/home/alex/.../src/Server.js:2
import $path from 'path';
^^^^^^
```
