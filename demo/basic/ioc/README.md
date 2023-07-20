# The Basics of IoC

There is a lot of information on the Internet about the "Inversion of Control" principle. Here, I will briefly discuss
IoC in JavaScript (ES6+).

## What is "direct control"?

This is the regular way of composing JS code with the `import` statement (
see [./direct/service.js](direct/service.js)):

```javascript
import logger from './logger.js';

export default class Service {
    exec(opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    }
}
```

All dependencies for the service are directly loaded in the service's source with the static `import`.

## What is "inversion of control"?

The service does not load dependencies itself but provides the ability to inject dependencies into itself (
see [./inverted/service.js](inverted/service.js)).

```javascript
export default class Service {
    #logger;

    constructor(logger) {
        this.#logger = logger;
    }

    exec(opts) {
        this.#logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    }
}
```

The main difference is that inverted ES6 modules don't have import statements at all.

## Composition root

How do we assemble all modules into one program in this case? It occurs in one place, which is named the "_composition
root_" (see [inverted.js](inverted.js)):

```javascript
import logger from './logger.js';
import Service from './service.js';

const srv = new Service(logger);
srv.exec({name: 'The Basics of IoC'});
```

In the composition root, all services and their dependencies are imported, and all dependencies are injected into their
respective services. The composition root is the (almost) only place where the `import` statement can be used.

Next: [spec](../spec/README.md)