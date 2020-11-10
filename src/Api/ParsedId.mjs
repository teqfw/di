/**
 * Structure to store parsing results for dependency id:
 *  - 'namedSingleton': singleton object stored in container;
 *  - 'namedConstructor$': create new object using stored constructor;
 *  - 'Module': load and get ES module;
 *  - 'Module$': load ES module and create new object using module's default export as constructor;
 *  - 'Module$$': load ES module, create new object using module's default export and save as singleton in container;
 */
export default class TeqFw_Di_Api_ParsedId {
    /**
     * 'true' if dependency is a new object (Vendor_Module$, namedConstructor$).
     * @type {Boolean}
     */
    isConstructor = false
    /**
     * 'true' for ES module (Vendor_Module).
     * @type {Boolean}
     */
    isModule = false
    /**
     * 'true' for named singleton (namedSingleton) or named constructor (namedConstructor$).
     * @type {Boolean}
     */
    isNamedObject = false
    /**
     * 'true' for named singleton (namedSingleton) or singleton object from default export (Vendor_Module$$).
     * @type {Boolean}
     */
    isSingleton = false
    /**
     * Key to map object in container's store (singletons, constructors, modules) - original id w/o '$' chars.
     * @type {String}
     */
    mapKey
    /**
     * Module name: 'Vendor_Project_Module'.
     * @type {String}
     */
    moduleName
    /**
     * Original identifier: namedSingleton, namedConstructor$, Vendor_Module, Vendor_Module$, Vendor_Module$$.
     * @type {String}
     */
    orig
}
