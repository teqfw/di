/**
 * This is a DTO that represents the structure of an ID for a runtime dependency.
 */
export default class TeqFw_Di_DepId {
    /**
     * The name of an export of the module.
     * @type {string}
     */
    exportName;
    /**
     * Composition type (see Defs.COMPOSE_): use the export as Factory (F) or return as-is (A).
     * @type {string}
     */
    composition;
    /**
     * Lifestyle type (see Defs.LIFE_): singleton (S) or instance (I).
     * @type {string}
     */
    life;
    /**
     * The code for ES6 module that can be converted to the path to this es6 module.
     * @type {string}
     */
    moduleName;
    /**
     * Object key value.
     * @type {string}
     */
    value;
    /**
     * List of wrappers to decorate the result.
     * @type {string[]}
     */
    wrappers = [];
}