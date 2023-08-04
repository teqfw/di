# The Basics of Imports

* [factory](../factory/README.md)

The main idea of factories is that all ES6 modules in our app are exported as asynchronous factories that accept a
dependencies spec object and create the required object:

```javascript
export default async function Factory({dep1, dep2, ...}) {
    return function (opts) {/* use deps here */};
}
```

In JavaScript, the key in an object can be any string:

```javascript
const obj = {['any string with spec. chars: !@#$%^&*()_+']: prop};
```

When creating a service, we can put the path to the source of the dependency in the specification itself:

```javascript
// ./service.js
export default async function Factory({['./logger.js']: logger}) {
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}
```

The composition root for this case:

```javascript
// ./main.js 
import fLogger from './logger.js';
import fService from './service.js';

const logger = await fLogger();
const serv = await fService({['./logger.js']: logger});
serv({name: 'The Basics of Import'});
```



Next: [proxy](../proxy/README.md)