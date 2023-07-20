# The Basics of Factories

* [spec](../spec/README.md)

The main idea of the Dependencies Specification is that all our construction functions always have only one argument -
an object with dependencies:

```javascript
class Service {
    constructor({dep1, dep2, ...}) { }
}
```

or

```javascript
function Factory({dep1, dep2, ...}) {
    return function (opts) {/* use deps here */};
}
```

Let's imagine that all objects in our application, except for the composition root, are created by asynchronous factory
functions, which are the default export of modules:

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
// ./service.js
export default async function Factory({logger}) {
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
const serv = await fService({logger});
serv({name: 'The Basics of Factories'});
```

Next: [import](../import/README.md)