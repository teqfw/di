const DEP_KEY = 'depKey'; // key for exception to transfer dependency key (path for import)
const deps = {}; // all created deps

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
                const {default: factory} = await import(depKey);
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
        const {default: factory} = await import(key);
        const res = await useFactory(factory);
        deps[key] = res;
        return res;
    }
};