# The Basics of Imports

* [factory](./factory/README.md)

The main idea of factories is that all ES6 modules in our app are exported as asynchronous factories that accept a
dependencies spec object and create the required object:

```javascript
export default async function Factory({dep1, dep2, ...}) {
    return function (opts) {/* use deps here */};
}
```

Let's imagine that each dependency in the spec is represented by a path through which the module containing this
dependency can be imported:

```javascript
const spec = {
    dep1: './path/to/the/dep1/module.js',
    dep2: './path/to/the/dep2/module.js',
    ...
};
```

The factory when we don't have any dependencies:

```javascript
// ./logger.js
export default async function Factory() {
    return {
        error: (msg) => console.error(msg),
        info: (msg) => console.info(msg),
    };
};
```

The factory when we have some dependencies:

```javascript
// ./service.js
export default async function Factory({logger: pathToLogger}) {
    // begin of DI functionality workaround
    const {default: fLogger} = await import(pathToLogger);
    const logger = await fLogger();
    // end of DI functionality workaround
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}
```

So, now we have code without any static imports:

```javascript
// ./main.js - composition root
const {default: fService} = await import('./service.js');
const serv = await fService({logger: './logger.js'});
serv({name: 'The Basics of Import'});
```

When the export of our modules is unified, we can pass to factory functions not dependencies, but paths to ES6 modules
that contain our dependencies. All paths are defined in the composition root (which is good), but the DI code is
distributed across all modules with dependencies (which is not good).

Next: [proxy](../proxy/README.md)