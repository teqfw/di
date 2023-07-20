# The Basics of Dependencies Specification

* [IoC](../ioc/README.md)

The essence of Inversion of Control is that we inject dependencies into an object during construction:

```javascript
class Service {
    constructor(dep1, dep2, ...) { }
}
```

There is a problem when trying to analyze function arguments in JavaScript. This language does not have good reflection
capabilities. Moreover, argument names can be minified during transpilation.

But JavaScript has a feature named "_Destructuring assignment_". So, we can use only one argument in the constructor (
name this argument as "_specification_"):

```javascript
class Service {
    constructor(spec) { }
}
```

And we can destructure this specification to obtain the parts (dependencies):

```javascript
class Service {
    constructor({logger, config}) { }
}
```

So, our composition root might look like this:

```javascript
import logger from './logger.js';
import config from './config.js';
import Service from './service.js';

const serv = new Service({logger, config});
```

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