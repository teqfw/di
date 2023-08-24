# The Basics of Container

Previous:  [parser](../parser/README.md)

The main idea of the spec parser is to get dependencies from the text definition of a factory function:

```javascript
import parser from './parser.js';
import fService from './service.js';

const deps = parser(fService.toString());
```

So, we have an agreement on the format for specifying dependencies and how they are created (factories). We
can recursively load our modules and their dependencies:

```javascript
// ./container.js
import parser from './parser.js';

const deps = {}; // all created deps

async function get(key) {
    if (deps[key]) return deps[key];
    else {
        const {default: factory} = await import(key);
        const def = factory.toString();
        const paths = parser(def);
        const spec = {};
        for (const path of paths)
            spec[path] = await get(path);
        const res = factory(spec);
        deps[key] = res;
        return res;
    }
}

export default {get};
```

This container is our composition root now.

Next: [resolve](../resolve/README.md)