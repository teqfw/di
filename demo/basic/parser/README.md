# The Basics of Specification Parser

Previous:  [spec](../spec/README.md)

The main idea of the Dependencies Specification is that all our factory functions always have only one argument -
an object with dependencies, where keys are the paths to import the sources:

```javascript
function Factory(
    {
        ['./path/to/dep1.js']: dep1,
        ['./path/to/dep2.js']: dep2
    }
) { }
```

We can transform a factory function to the string and get paths to the dependencies:

```javascript
// ./parser.js
export default function (def) {
    const res = [];
    const parts = /function Factory\s*\(\{(.*)}\).*/s.exec(def);
    if (parts?.[1]) {
        // ['./logger.js']: logger, ['./config.js']: config
        const deps = parts[1].split(',');
        for (const dep of deps) {
            const left = dep.split(':')[0];
            const path = left.trim()
                .replace(/'/g, '')
                .replace(/"/g, '')
                .replace('[', '')
                .replace(']', '');
            res.push(path);
        }
    }
    return res;
};
```

The composition root:

```javascript
// ./main.js
import parser from './parser.js';
import fService from './service.js';

// analyze service factory and create deps
const deps = parser(fService.toString());
const spec = {};
for (const dep of deps) {
    const {default: factory} = await import(dep);
    spec[dep] = await factory();
}

// create service itself
const serv = await fService(spec);
serv({name: 'The Basics of Parser'});
```

Next: [container](../container/README.md)