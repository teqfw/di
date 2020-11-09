export default class TeqFw_Di_Api_ParsedId {
    /**
     * Original identifier: 'dbConnection', 'Vendor_Project_Module$$'.
     *
     * @type {String}
     */
    id
    /**
     * 'true' if ID describes named singleton: 'dbConnection'.
     * @type {Boolean}
     */
    isNamedObject = false
    /**
     * Module name: 'Vendor_Project_Module'.
     *
     * @type {String}
     */
    moduleName
    /**
     * 'true' if ID describes module: 'Vendor_Project_Module'.
     * @type {Boolean}
     */
    isModule = false
    /**
     * 'true' if ID describes new object from default export: 'Vendor_Project_Module$'.
     * @type {Boolean}
     */
    isConstructor = false
    /**
     * 'true' if ID describes singleton object from default export ('Vendor_Project_Module$$') or describes
     * named singleton ('dbConnection').
     *
     * @type {Boolean}
     */
    isSingleton = false
}
