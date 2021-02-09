import FilepathNs from './Resolver/FilepathNs.mjs';
import LogicalNs from './Resolver/LogicalNs.mjs';

/** @type {RegExp} expression for logical namespace IDs w/o dep. injection fraction (Ns_Module) */
const LOGICAL_NS = /^((([A-Z])[A-Za-z0-9_]*)?)$/;
/**
 * Map codebase namespaces to files/URLs.
 */
export default class TeqFw_Di_Resolver {
    /** @type {TeqFw_Di_Resolver_LogicalNs} */
    logicalNs = new LogicalNs()
    /** @type {TeqFw_Di_Resolver_FilepathNs} */
    filepathNs = new FilepathNs()

    /**
     * Registry sources path mapping details for namespace.
     *
     * @param {TeqFw_Di_Api_ResolveDetails} details namespace resolving details
     */
    addNamespaceRoot(details) {
        const parsed = LOGICAL_NS.exec(details.ns);
        if (parsed) {
            // this is logical namespace
            this.logicalNs.addNamespaceRoot(details);
        } else {
            // this is file path based namespace
            this.filepathNs.addNamespaceRoot(details);
        }
    }

    /**
     * Resolve path to module's source using `moduleId`:
     *  - '@vendor/package!path/to/module' => './@vendor/package/dist/path/to/module.mjs'
     *  - 'Vendor_Project_Module' => 'https://vendor.com/lib/Project/Module.js'
     *
     * @param {string} moduleId
     * @returns {string}
     */
    resolveModuleId(moduleId) {
        let result;
        const parsed = LOGICAL_NS.exec(moduleId);
        if (parsed) {
            // this is logical namespace
            result = this.logicalNs.resolveModuleId(moduleId);
        } else {
            // this is file path based namespace
            result = this.filepathNs.resolveModuleId(moduleId);
        }
        return result;
    }

    /**
     * List all namespaces with resolving details.
     *
     * @returns {{filepathNs: Object<string, TeqFw_Di_Api_ResolveDetails>, logicalNs: Object<string, TeqFw_Di_Api_ResolveDetails>}}
     */
    list() {
        const filepathNs = this.filepathNs.list();
        const logicalNs = this.logicalNs.list();
        return {filepathNs, logicalNs};
    }

}
