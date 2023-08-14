/**
 *
 */
import Defs from './Defs.js';
import specAnalyser from './SpecAnalyser.js';

// VARS


// MAIN
export default class TeqFw_Di_Composer {

    constructor() {
        // VARS

        // INSTANCE METHODS

        /**
         *
         * @param {TeqFw_Di_Api_ObjectKey} key
         * @param {Object} module
         * @param {TeqFw_Di_Container} container
         * @return {Promise<*>}
         */
        this.create = async function (key, module, container) {
            const {[key.exportName]: exp} = module;
            if (key.composition === Defs.COMPOSE_FACTORY) {
                if (typeof exp === 'function') {
                    // create deps for factory function
                    const deps = specAnalyser(exp);
                    const spec = {};
                    for (const dep of deps)
                        spec[dep] = await container.get(dep);
                    // create a new object with the factory function
                    // TODO: add await for Promises
                    return await exp(spec);
                } else
                    // just clone the export
                    return Object.assign({}, exp);
            } else
                return exp;
        };

        // MAIN
    }
};