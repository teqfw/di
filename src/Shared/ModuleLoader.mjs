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
            let result, sourceFile;
            if (_modules[moduleId]) {
                result = _modules[moduleId];
            } else {
                try {
                    sourceFile = this.resolver.resolveModuleId(moduleId);
                    result = await import(sourceFile);
                    _modules.set(moduleId, result);
                } catch (e) {
                    let msg = `Cannot load source file '${sourceFile}' (module id: ${moduleId}).`;
                    if (e.message) msg = `${msg} Error: ${e.message}`;
                    throw new Error(msg);
                }
            }
            return result;
        };
    }
}
