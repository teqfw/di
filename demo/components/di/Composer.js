/**
 * This function uses loaded ES6 modules and generates objects based on the provided objectKey.
 */

// VARS
/** @type {function(string):string[]} */
let specAnalyser;

// MAIN

/**
 *
 * @param {Di.Dto.ObjectKey} key
 * @param {Module} module
 * @param {Di.Container} container
 * @returns {Promise<*>}
 */
async function create(key, module, container) {
    if (key.exportName === undefined) {
        return module;
    } else {
        const exp = module[key.exportName];
        if (key.isFactory) {
            if (typeof exp === 'function') {
                // create deps for factory function
                const deps = specAnalyser(exp);
                const spec = {};
                for (const dep of deps)
                    spec[dep] = await container.get(dep);
                // create a new object with the factory function
                return exp(spec);
            } else
                // just clone the export
                return Object.assign({}, exp);
        } else {
            // just return the export itself
            return exp;
        }
    }
}

export default {
    create,
    setSpecAnalyzer: (data) => specAnalyser = data,
};