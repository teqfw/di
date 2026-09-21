// @ts-check

/**
 * @namespace TeqFw_Di_Container_ModuleLoader
 * @description Crosses the native dynamic-import boundary.
 */

/**
 * @typedef {object} TeqFw_Di_Container_ModuleLoader_Route
 * @property {string} specifier
 * @property {object} [mapping]
 */

/**
 * @typedef {object} TeqFw_Di_Container_ModuleLoader_Dependencies
 * @property {(specifier: string) => Promise<object>} [importFn]
 * @property {TeqFw_Di_Internal_Logger_Contract|null} [logger]
 */

/**
 * Accepts a route produced by ModuleRouter and delegates loading to the
 * JavaScript Runtime without introducing a Container-owned module cache.
 */
export default class TeqFw_Di_Container_ModuleLoader {
    /**
     * @param {TeqFw_Di_Container_ModuleLoader_Dependencies} [deps]
     */
    constructor({importFn = (specifier) => import(specifier), logger = null} = {}) {
        /** @type {(specifier: string) => Promise<object>} */
        const importModule = importFn;
        /** @type {TeqFw_Di_Internal_Logger_Contract|null} */
        const log = logger;

        /**
         * Loads the route namespace through native dynamic import.
         *
         * @param {TeqFw_Di_Container_ModuleLoader_Route} route
         * @returns {Promise<object>}
         */
        this.load = async function (route) {
            if (log) log.log(`ModuleLoader.import: '${route.specifier}'.`);
            return importModule(route.specifier);
        };
    }
}
