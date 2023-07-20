# The Basics of Container

* [proxy](./proxy/README.md)

The main idea of the spec proxy is to replace all dependencies in the factories that are represented as `import` paths
with the actual dependencies.

Let's consider a scenario with one `service` that has two dependencies (`logger` and `config`).

```javascript
// ./service.js
export default async function Factory({['./logger.js']: logger, ['./config.js']: config}) {
    return function (opts) {
        logger.info(`Service '${config.appName}' is running with: ${JSON.stringify(opts)}`);
    };
}
```

These are the dependencies:

```javascript
// ./logger.js
export default async function Factory() {
    return {
        error: (msg) => console.error(msg),
        info: (msg) => console.info(msg),
    };
};
```

```javascript
// ./config.js
export default async function Factory() {
    return {
        appName: 'Test App',
    };
};
```

In the composition root, we have a single static import - the container:

```javascript
// ./main.js
import container from './container.js';

/** @type {function(Object)} */
const serv = await container.get('./service.js');
serv({name: 'The Basics of Container'});
```

To achieve the main functionality of the container, we use the following code:

```javascript
// ./container.js
export default {
    /**
     * Get some object from the Container.
     * @param {string} key
     * @return {Promise<*>}
     */
    get: async function (key) {
        const {default: factory} = await import(key);
        const res = await useFactory(factory);
        deps[key] = res;
        return res;
    }
};
```

The container's `get` method imports the factory function for the requested object specified by `key` (
e.g., `./service.js`). It then uses the use`Factory` function to create the requested object using the extracted
factory. The use`Factory` function is designed to handle the object creation process with all its dependencies and uses
the spec `proxy` to resolve those dependencies:

```javascript
// ./container.js
const DEP_KEY = 'depKey'; // key for an exception to transfer dependency key (path for import)
async function useFactory(fnFactory) {
    let res;
    // try to create the Object
    do {
        try {
            // Object is created when all deps are created
            res = await fnFactory(proxy);
        } catch (e) {
            if (e[DEP_KEY]) {
                // we need to import another module to create dependency
                const depKey = e[DEP_KEY];
                const {default: factory} = await import(depKey);
                deps[depKey] = await useFactory(factory);
            } else {
                // this is a third-party exception, just re-throw
                throw e;
            }
        }
        // if Object is not created then retry (some dep was not imported yet)
    } while (!res);
    return res;
}
```

The spec proxy plays a crucial role in handling the resolution of dependencies:

```javascript
// ./container.js
const deps = {}; // all created deps

const proxy = new Proxy({}, {
    get(target, prop) {
        if (deps[prop]) return deps[prop];
        else {
            const e = new Error('Unresolved dependency');
            e[DEP_KEY] = prop;
            throw e;
        }
    }
});
```

That's all!

* The Container imports the factory function for the requested object using the provided `key` (e.g., `./service.js`).
* The Container calls the use`Factory` function with the extracted factory as an argument.
* The use`Factory` function attempts to create the requested object using the factory function in a loop. The `proxy` is
  used as a spec argument for the factory function to resolve dependencies dynamically.
* The `proxy` looks up the loaded es6 module in the local cache (`deps`) using the dependency key (e.g., `./logger.js`
  or `./config.js`). If the requested es6 module is not loaded yet, the `proxy` throws an exception and adds the
  dependency key to it.
* The `useFactory` function catches the exception, imports the es6 module for the missing dependency, extracts the
  factory function for that dependency, and runs `useFunction` with the dependency factory. The resolved dependency is
  then stored in the local cache (`deps`). The useFactory function then attempts to create the requested object again.
* If all dependencies are successfully created, the factory function runs without any exceptions, and the requested
  object is created with all its dependencies.

So, at this point, we can use ES6 module paths as dependency keys to dynamically load sources and create dependencies:

```javascript
export default async function Factory({['./logger.js']: logger, ['./config.js']: config}) {
    // ...
}
```

Next: [resolve](../resolve/README.md)