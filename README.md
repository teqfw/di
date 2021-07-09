# @teqfw/di

"_DI_" means both "_Dynamic Import_" and "_Dependency Injection_" here. This package allows defining logical namespaces
in your projects, dynamically importing ES6-modules from these namespaces, creating new objects from imported
functions/classes and resolving dependencies in constructors. It uses pure ECMAScript 2015+ (ES6+) and works both for
modern browsers &amp; nodejs apps. You can share the same code between your frontend (browser) and your backend (nodejs) without TypeScript and preprocessors. Code in the browser's debugger will be the same as in your editor. Finally, you even can use interfaces in you projects and replace it with implementations.

The '_proxy object_' for `constructor` specification is inspired by [awilix](https://github.com/jeffijoe/awilix).
Thanks guys.

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

ES-modules can use regular import statements in code:

```ecmascript 6
import ScanData from '../Api/Dto/Scanned.mjs';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
```

but DI container cannot process these imports. Function or class should have this interface to be compatible with DI container:

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



## More

[See more here.](https://github.com/teqfw/di/blob/main/README.md#namespaces)
