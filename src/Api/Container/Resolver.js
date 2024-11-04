/**
 * Interface for the resolver to map a module name of the dependency ID into the path to the sources.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_Resolver {

    /**
     * Convert the module name to the path of the source files .
     * @param {string} moduleName 'Vendor_Package_Module'
     * @returns {string} '/home/user/app/node_modules/@vendor/package/src/Module.js'
     */
    resolve(moduleName) {}

}