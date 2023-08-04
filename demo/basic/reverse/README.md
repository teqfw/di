# The Basics of Spec Reversing

* [import](../import/README.md)

The main idea of dynamic imports is that we can use them to load all function factories and define paths to the ES6
modules in the composition root.

```javascript
const {default: fService} = await import('./service.js');
const serv = await fService({logger: './logger.js'});
```

Let's swap the key and value in the specification of the factory function:

```javascript
// from
export default async function Factory({logger: pathToLogger}) {}
// to
export default async function Factory({pathToLogger: logger}) {}
```

So, we can set path to the dependencies sources in the source code of the service (`'./logger.js'`) but use it as a
regular variable (`logger`):

```javascript
// ./service.js
export default async function Factory({['./logger.js']: logger}) {
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}
```

All we need is to created logger and to put it to the factory function of the service under suitable key:

```javascript
// ./main.js
// import and create dependency
const pathToLogger = './logger.js';
const {default: fLogger} = await import(pathToLogger);
const logger = await fLogger();

// import and create service
const {default: fService} = await import('./service.js');
const serv = await fService({[pathToLogger]: logger});
serv({name: 'The Basics of Spec Reverse'});
```

For what we need this reverting? Now we can programmatically analyze signatures of the factories and dynamically load
and create required dependencies. 