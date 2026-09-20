// @ts-check

/**
 * @namespace TeqFw_Di_Container_ModuleLoader
 * @description Coordinates native module loading and namespace reuse.
 */

/**
 * @typedef {object} TeqFw_Di_Container_ModuleLoader_Route
 * @property {string} key
 * @property {string} specifier
 * @property {object} [mapping]
 */

/**
 * @typedef {object} TeqFw_Di_Container_ModuleLoader_Dependencies
 * @property {(specifier: string) => Promise<object>} [importFn]
 * @property {TeqFw_Di_Internal_Logger_Contract|null} [logger]
 */

/**
 * Owns in-flight and fulfilled native-load coordination. It accepts a route
 * produced by ModuleRouter and never interprets Address-Kind policy.
 */
export default class TeqFw_Di_Container_ModuleLoader {
    /**
     * @param {TeqFw_Di_Container_ModuleLoader_Dependencies} [deps]
     */
    constructor({importFn = (specifier) => import(specifier), logger = null} = {}) {
        /** @type {Map<string, Promise<object>>} */
        const cache = new Map();
        /** @type {(specifier: string) => Promise<object>} */
        const importModule = importFn;
        /** @type {TeqFw_Di_Internal_Logger_Contract|null} */
        const log = logger;

        /**
         * Reports whether the route has a coordinated native-load promise.
         *
         * @param {TeqFw_Di_Container_ModuleLoader_Route} route
         * @returns {'hit'|'miss'}
         */
        this.status = function (route) {
            return cache.has(route.key) ? 'hit' : 'miss';
        };

        /**
         * Loads the route namespace, converging concurrent calls and evicting
         * rejected promises.
         *
         * @param {TeqFw_Di_Container_ModuleLoader_Route} route
         * @returns {Promise<object>}
         */
        this.load = async function (route) {
            const existing = cache.get(route.key);
            if (existing) {
                if (log) log.log(`ModuleLoader.cache: hit key='${route.key}'.`);
                return existing;
            }

            if (log) log.log(`ModuleLoader.import: '${route.specifier}'.`);
            const promise = Promise.resolve().then(() => importModule(route.specifier));
            cache.set(route.key, promise);
            try {
                return await promise;
            } catch (error) {
                if (cache.get(route.key) === promise) cache.delete(route.key);
                if (log) log.error(`ModuleLoader.cache: evict key='${route.key}' after failure.`, error);
                throw error;
            }
        };
    }
}
