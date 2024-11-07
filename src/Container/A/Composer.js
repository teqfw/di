/**
 * The composer creates requested objects. It uses the container to create dependencies.
 *
 * @namespace TeqFw_Di_Container_A_Composer
 */
import Defs from '../../Defs.js';
import specParser from './Composer/A/SpecParser.js';

export default class TeqFw_Di_Container_A_Composer {

    constructor() {
        // VARS
        let _debug = false;

        // FUNCS
        function log(msg) {
            if (_debug) console.log(msg);
        }

        // INSTANCE METHODS

        /**
         * Returns or creates and returns the requested object.
         *
         * @param {TeqFw_Di_DepId} depId
         * @param {Object} module - imported es6 module
         * @param {string[]} stack - array of the parent objects IDs to prevent dependency loop
         * @param {TeqFw_Di_Container} container - to create dependencies for requested object
         * @returns {Promise<*>}
         */
        this.create = async function (depId, module, stack, container) {
            if (stack.includes(depId.value))
                throw new Error(`Circular dependency for '${depId.value}'. Parents are: ${JSON.stringify(stack)}`);
            if (depId.exportName) {
                // use export from the es6-module
                const stackNew = [...stack, depId.value];
                const {[depId.exportName]: exp} = module;
                if (depId.composition === Defs.COMP_F) {
                    if (typeof exp === 'function') {
                        // create deps for factory function
                        const deps = specParser(exp);
                        if (deps.length) log(`Deps for object '${depId.value}' are: ${JSON.stringify(deps)}`);
                        const spec = {};
                        for (const dep of deps)
                            spec[dep] = await container.compose(dep, stackNew);
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
                    // just return the export (w/o factory function)
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