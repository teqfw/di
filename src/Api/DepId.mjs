/**
 * This is a DTO that represents the ID for a runtime dependency.
 * @namespace Api
 */

/**
 * @memberOf Api
 */
export class DepId {
    /**
     * Use a wrapper (adapter) for the dependency. 'Proxy', for example.
     * @type {string}
     */
    adapter;
    /**
     * Is this dependency a whole module or an export from the module?
     * @type {boolean}
     */
    isExport;
    /**
     * Use the export as Factory or return as-is.
     * @type {boolean}
     */
    isFactory;
    /**
     * Use as Factory or return as-is.
     * @type {boolean}
     */
    isSingleton;
    /**
     * The name of an export of the module.
     * @type {string}
     */
    nameExport;
    /**
     * The code for ES6 module that can be converted to the path to this es6 module.
     * @type {string}
     */
    nameModule;
}