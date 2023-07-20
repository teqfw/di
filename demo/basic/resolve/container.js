const DEP_KEY = 'depKey'; // key for exception to transfer dependency key (path for import)
const deps = {}; // all created deps
/** @type {IResolver} */
let resolver;

/** @interface */
class IResolver {
    /**
     * Convert dependency key to path to es6 modules with the sources.
     * @param {string} key
     * @return {string}
     */
    map(key) {}
}

const proxy = new Proxy({}, {
    get(target, prop) {
        if (deps[prop]) return deps[prop];
        else {
            const e = new Error('Unresolved dependency');
            e[DEP_KEY] = prop;
            throw e;
        }
    }
});

async function useFactory(fnFactory) {
    let res;
    // try to create the Object
    do {
        try {
            // Object is created when all deps are created
            res = await fnFactory(proxy);
        } catch (e) {
            if (e[DEP_KEY]) {
                // we need to import another module to create dependency
                const depKey = e[DEP_KEY];
                const path = resolver.map(depKey);
                const {default: factory} = await import(path);
                deps[depKey] = await useFactory(factory);
            } else {
                // this is a third-party exception, just re-throw
                throw e;
            }
        }
        // if Object is not created then retry (some dep was not imported yet)
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
        const res = await useFactory(factory);
        deps[key] = res;
        return res;
    },
    setResolver: function (data) {
        resolver = data;
    },
};