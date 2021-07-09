// MODULE'S CLASSES
/**
 * Load ES6 module sources and save it to internal registry.
 */
export default class TeqFw_Di_Shared_ModuleLoader {
    /** @type {TeqFw_Di_Shared_Resolver} */
    resolver

    /**
     * @param {TeqFw_Di_Shared_Resolver} resolver
     */
    constructor(resolver) {
        this.resolver = resolver;
        /**
         * Storage for loaded modules.
         * Module name ('Vendor_Project_Module') is a key in the map.
         */
        const _modules = new Map();

        this.getModule = async function (moduleId) {
            let result;
            if (_modules[moduleId]) {
                result = _modules[moduleId];
            } else {
                const sourceFile = this.resolver.resolveModuleId(moduleId);
                result = await import(sourceFile);
                _modules.set(moduleId, result);
            }
            return result;
        };
    }
}
