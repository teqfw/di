/**
 *  DTO representing a dependency identifier in the container.
 * @namespace TeqFw_Di_DepId
 */
export default class TeqFw_Di_DepId {
    /**
     * The name of an export from the module.
     * Example: 'default', 'logger', 'DbClient'.
     * @type {string}
     */
    exportName;
    /**
     * Defines how the export should be used:
     * - 'F' (Factory): The export is a factory function, call it to get an instance.
     * - 'A' (As-Is): The export is returned as-is, without calling.
     * Example: 'F', 'A'.
     * @type {string}
     */
    composition;
    /**
     * Defines if the dependency is a Node.js module.
     * @type {boolean}
     */
    isNodeModule;
    /**
     * Defines the lifecycle of the resolved dependency:
     * - 'S' (Singleton): A single instance is created and reused.
     * - 'I' (Instance): A new instance is created on each request.
     * Example: 'S', 'I'.
     * @type {string}
     */
    life;
    /**
     * ES6 module identifier, which can be transformed into a file path.
     * This value is processed by the Resolver to determine the module's location.
     * Example: 'TeqFw_Core_Shared_Api_Logger'.
     * @type {string}
     */
    moduleName;
    /**
     * The original identifier string provided to the container.
     * This is the unprocessed dependency key.
     * Example: 'TeqFw_Core_Shared_Api_Logger$$'.
     * @type {string}
     */
    origin;
    /**
     * List of wrappers to decorate the result.
     * @type {string[]}
     */
    wrappers = [];
}