# The Basics of Container

The Container is a place where all code objects are stored. We can put some objects into the Container and get some
objects from the Container.

```javascript
/**
 * @interface
 */
class Container {
    /**
     * Get some object from the Container.
     * @param {string} key
     * @return {Object}
     */
    get(key) {}

    /**
     * Put some object into the Container.
     * @param {string} key
     * @param {Object} obj
     */
    put(key, obj) {}
}
```

The main goal of the Container is to inject dependencies into services. If we take an example
from [inversion basics](../ioc/README.md), then the use of the Container can be represented as follows:

```javascript
import logger from './logger.js';
import Service from './service.js';

// initialize the Container
const container = new Container();
container.put('logger', logger);
container.put('service', Service);

// use the Container
/** @type {Service} */
const serv = container.get('service');
serv.exec({name: 'Container'});
```

This example is not programmatically correct, but it demonstrates the idea of using the Container:

```javascript
const obj = container.get('some identificator');
```

The task of the Container after initialization is to provide us with the objects we need. If the objects have
dependencies, then the task of the container is to inject the required dependencies into them.