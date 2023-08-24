# Dependency Identifiers

## ES6+ Exports

Each ES6 module typically exports data using the following syntax:

```javascript
export const obj = {};
export default class Clazz {}

export function Factory() {}
```

Alternatively, exports can be written in the following form:

```javascript
export {
    obj,
    Clazz as default,
    Factory,
}
```

This is an example as these exports could be used in other module:

```javascript
import Clazz from './es6.mjs';
import {Factory} from './es6.mjs';
import {obj} from './es6.mjs';

const instClass = new Clazz();
const instFact = Factory();
const instTmpl = Object.assign({}, obj);
```

## DI Identifiers

The TeqFW DI Container can export ES6 modules and inject dependencies into constructors or functions using identifiers:

```javascript
class Clazz {
    constructor(spec) {
        const exp = spec['App_Space_Module.exportName']; // inject as a single export
    }
}

function Factory(spec) {
    const mod = spec['App_Space_Module']; // inject as a whole module
}
```

Possible ID values for injecting dependencies are:

* **App_Space_Module**: inject as a whole module;
* **App_Space_Module.exp** or **App_Space_Module#exp**: inject the `exp` export of module `App_Space_Module`;
* **App_Space_Module#** or **App_Space_Module#default** or **App_Space_Module.default**: inject the `default` export of
  the module;
* **App_Space_Module$**: inject a singleton created with the default export (class, function, or object) of the module;
* **App_Space_Module$$**: inject a new instance created with the default export of the module;
* **App_Space_Module.exp$**: inject a singleton created with the `exp` export of the module;
* **App_Space_Module.exp$$**: inject a new instance created with the `exp` export of the module;
