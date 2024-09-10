# The Basics of Dependencies Specification

Previous:  [factory](../factory/README.md)

The main idea of factories is that all ES6 modules in our app are exported as asynchronous factories that accept a
dependencies as input arguments and create the required object:

```javascript
export default async function Factory(logger) {
    return /* something */;
}
```

There is a problem when trying to analyze function arguments in JavaScript. This language does not have good reflection
capabilities. Moreover, argument names can be minified during transpilation.

But JavaScript has a feature named "_Destructuring assignment_". So, we can use only one argument in the factory (
name this argument as "_specification_"):

```javascript
export default async function Factory(spec) {
    return /* something */;
}
```

And we can destructure this specification to obtain the parts (dependencies):

```javascript
export default async function Factory({logger}) {
    return /* something */;
}
```

In JavaScript, the key in an object can be any string:

```javascript
const obj = {'any string with spec. chars: !@#$%^&*()_+': prop};
```

When creating a service, we can put the path to the source of the dependency in the specification itself:

```javascript
// ./service.js
export default async function Factory({'./logger.js': logger}) {
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
const serv = await fService({'./logger.js': logger});
serv({name: 'The Basics of Spec'});
```

The main idea of the Dependencies Specification is that all our factory functions always have only one argument -
an object with dependencies, where keys are the paths to the sources:

```javascript
function Factory({'./path/to/dep1.js': dep1, './path/to/dep2.js': dep2}) { }
```

Next: [parser](../parser/README.md)