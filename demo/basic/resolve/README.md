# The Basics of Resolver

* [container](../container/README.md)

The main idea of the imports is that we can use ES6 module paths as dependency keys to load sources and create
dependencies with the `useFactory` in a loop until all deps will be created.

However, using paths to the sources is not very convenient. It is similar to static imports but less optimal. Can we use
simpler dependency keys instead? Something like this:

```javascript
export default async function Factory({logger, config}) {
    // ...
}
```

Yes, it is possible if we have a path resolver that translates names into paths:

```javascript
/** @interface */
class IResolver {
    /**
     * Convert the dependency key to a path to an ES6 module with the sources.
     * @param {string} key
     * @return {string}
     */
    map(key) {}
}
```

For example, we can implement a resolver for our app like this:

```javascript
// ./resolve.js
/** @implements IResolver */
export default {
    map: function (key) {
        if (key === 'service') return './service.js';
        else if (key === 'logger') return './logger.js';
        else if (key === 'config') return './config.js';
        else return key;
    }
};
```

And set the resolver to the container before usage:

```javascript
// ./main.js
import resolver from './resolver.js';
import container from './container.js';

container.setResolver(resolver);
```

Here are the changes in the container:

```javascript
// ./container.js
/** @type {IResolver} */
let resolver;

async function useFactory(fnFactory) {
    let res;
    do {
        try {
        ...
        } catch (e) {
            if (e[DEP_KEY]) {
                // we need to import another module to create dependency
                const depKey = e[DEP_KEY];
                const path = resolver.map(depKey);
                const {default: factory} = await import(path);
            ...
            } else {
            ...
            }
        }
    } while (!res);
    return res;
}

export default {
    /**
     * Get some object from the Container.
     * @param {string} key
     * @return {Promise<*>}
     */
    get: async function (key) {
        const path = resolver.map(key);
        const {default: factory} = await import(path);
    ...
    },
    setResolver: function (data) {
        resolver = data;
    },
};
```

So, now we can use human-readable keys for dependencies and convert them to paths to ES6 modules with sources. Moreover,
we can have one set of sources and two resolvers - one for the web and one for Node.js. Our code will adapt to the
environment (browser or server) with the resolver only. We can use one ES6 module both on the front-end and the
back-end.

"[That’s all I have to say about that.](https://www.youtube.com/watch?v=WJ_yQ02xwsM)" (c)