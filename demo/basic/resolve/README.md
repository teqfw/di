# The Basics of Resolver

Previous:  [container](../container/README.md)

The main idea behind the container is that our composition root is encapsulated within a special object that utilizes a
parser to extract paths to dependencies from string definitions of the factory functions. We use this special object (
the container) to obtain any objects in our application:

```javascript
// ./main.js
import container from './container.js';

const serv = await container.get('./service.js');
```

However, using paths to the sources is not very convenient. It is similar to static imports but less optimal. Can we use
simpler dependency keys instead? Something like this:

```javascript
export default async function Factory({logger, config}) {
    // ...
}
```

Yes, it is possible if we have a map that translates names into paths:

```javascript
const map = {
    service: './service.js',
    logger: './logger.js',
    config: './config.js',
};
```

For example, we can set our map to the container and then just convert dependencies keys into import paths:

```javascript
// ./container.js
const map = {}; // abstractions-to-details map


async function get(key) {
    if (deps[key]) return deps[key];
    else {
        const path = map[key];
        const {default: factory} = await import(path);
    ...
    }
}

export default {get, setMap: (data) => Object.assign(map, data)};
```

So now, we can use human-readable keys for dependencies (abstractions) and convert them to paths to ES6 modules with
sources (details). Moreover, we can have one set of dependencies and two resolvers - one for the
web (`logger` => `https://.../logger.js`) and one for Node.js (`logger` => `/path/to/logger.js`). Our code will adapt to
the environment (browser or server) with only the resolver. We can use one ES6 module both on the front end and the back
end.

"[That’s all I have to say about that.](https://www.youtube.com/watch?v=WJ_yQ02xwsM)" (c)