# The Basics of Factories

Previous: [root](../root/README.md)

The essence of Inversion of Control is that we inject dependencies into an object during construction:

```javascript
class Service {
    constructor(dep1, dep2) { }
}
```

Classes are syntactic sugar, and object creation can be done with normal functions (factories):

```javascript
function Factory(dep1, dep2) {
    return /* something */;
}
```

Let's imagine that all objects in our application, except for the composition root, are created by asynchronous factory
functions, which are the default export of modules:

```javascript
// ./service.js
export default async function Factory(logger) {
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}
```

Using factories, we now have a common method to create any object in our application:

```javascript
// ./main.js
import fLogger from './logger.js';
import fService from './service.js';

const logger = await fLogger();
const serv = await fService(logger);
serv({name: 'The Basics of Factories'});
```

Next: [spec](../spec/README.md)