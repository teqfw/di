# The Basics of Specification Proxy

* [import](../import/README.md)

The main idea of dynamic imports is that we can use them to load all function factories and define paths to the ES6
modules in the composition root.

```javascript
const {default: fService} = await import('./service.js');
const serv = await fService({logger: './logger.js'});
```

To analyze dependencies in the spec, the guys from [awilix](https://github.com/jeffijoe/awilix) offered to use a Proxy:

```javascript
export default new Proxy({}, {
    get(target, prop) {
        console.log(`proxy: ${prop}`);
        return target[prop];
    }
});
```

With this proxy, we can use it as a `spec` object in all factories and know which dependency is requested. For example,
in a service factory with the `logger` dependency from the module `./logger.js`:

```javascript
// ./service.js
export default async function Factory({['./logger.js']: logger}) {
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}
```

To preload `./logger.js` and create the `logger` object on proxy initialization, we can modify our spec proxy as
follows:

```javascript
// ./spec.js
// workaround to load 'logger' dep
import fLogger from './logger.js';

const logger = await fLogger();
// end of workaround
export default new Proxy({}, {
    get(target, prop) {
        return (prop === './logger.js') ? logger : target[prop];
    }
});
```

Now, in our composition root, we import the spec proxy and the service factory, then request the creation of a service
with the `proxy` as a spec for the factory function:

```javascript
import spec from './spec.js';
import fService from './service.js';

const serv = await fService(spec);
serv({name: 'The Basics of Spec Proxy'});
```

When f`Service` destructs the spec proxy, it will call for the `./logger.js` property:

```javascript
function Factory({['./logger.js']: logger}) {}
```

The spec proxy will return the dependency related to this path:

```javascript
Proxy({}, {
    get(target, prop) {
        console.log(`proxy: ${prop}`);
        return (prop === './logger.js') ? logger : target[prop];
    }
});
```

We can imagine that all dependencies in all factories are represented as paths to other ES6 modules, and the proxy can
replace these paths with real dependencies in the same way (the actual loading of modules and creation of necessary
objects is yet to be considered).

Ideally, we can end up with a situation where the proxy parses dependency paths through factory function specifications,
dynamically imports the required modules, creates the necessary dependencies, and returns them to the factory functions.