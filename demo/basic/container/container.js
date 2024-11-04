import parser from './parser.js';

const deps = {}; // all created deps

/**
 * Get some object from the Container or import sources and create new one.
 * @param {string} key
 * @returns {Promise<*>}
 */
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