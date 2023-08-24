/**
 *
 */
import Defs from './Defs.js';
import specAnalyser from './SpecAnalyser.js';

// FUNCS

// MAIN
export default class TeqFw_Di_Composer {

    constructor() {
        // VARS
        let _debug = false;

        // FUNCS
        function log(msg) {
            if (_debug) console.log(msg);
        }

        // INSTANCE METHODS

        /**
         *
         * @param {TeqFw_Di_Api_ObjectKey} key
         * @param {Object} module
         * @param {string[]} stack array of the parent objects to prevent dependency loop
         * @param {TeqFw_Di_Container} container
         * @return {Promise<*>}
         */
        this.create = async function (key, module, stack, container) {
            if (stack.includes(key.value))
                throw new Error(`Circular dependency for '${key.value}'. Parents are: ${JSON.stringify(stack)}`);
            if (key.exportName) {
                // use export from the es6-module
                const stackNew = [...stack, key.value];
                const {[key.exportName]: exp} = module;
                if (key.composition === Defs.COMPOSE_FACTORY) {
                    if (typeof exp === 'function') {
                        // create deps for factory function
                        const deps = specAnalyser(exp);
                        if (deps.length) log(`Deps for object '${key.value}' are: ${JSON.stringify(deps)}`);
                        const spec = {};
                        for (const dep of deps)
                            spec[dep] = await container.get(dep, stackNew);
                        // create a new object with the factory function
                        const res = (Defs.isClass(exp)) ? new exp(spec) : exp(spec);
                        if (res instanceof Promise)
                            return await res;
                        else
                            return res;
                    } else
                        // just clone the export
                        return Object.assign({}, exp);
                } else
                    return exp;
            } else {
                return module;
            }
        };

        this.setDebug = function (data) {
            _debug = data;
        };

        // MAIN
    }
};