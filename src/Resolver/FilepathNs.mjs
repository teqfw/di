// MODULE'S IMPORT
import IdParser from '../IdParser.mjs';

// MODULE'S VARS
const $parser = new IdParser();

/**
 * Map codebase file path namespaces to files/URLs.
 */
class TeqFw_Di_Resolver_FilepathNs {
    /** @type {Object.<string, TeqFw_Di_Api_ResolveDetails>} */
    packages = {}

    /**
     * Register 'package to sources root' mapping.
     *
     * @param {TeqFw_Di_Api_ResolveDetails} details namespace resolving details
     */
    addNamespaceRoot(details) {
        this.packages[details.ns] = details;
    }

    /**
     * List all registered packages with resolving details.
     *
     * @returns {Object.<string, TeqFw_Di_Api_ResolveDetails>}
     */
    list() {
        return this.packages;
    }

    /**
     * Resolve module id to module source path.
     * @param {string} moduleId '@vendor/package!path/to/module'
     * @returns {string} './@vendor/package/dist/path/to/module.mjs'
     */
    resolveModuleId(moduleId) {
        let result;
        /** @type {TeqFw_Di_Api_ParsedId} */
        const parsed = $parser.parse(moduleId);
        const pkg = parsed.namePackage;
        if (this.packages[pkg]) {
            /** @type {TeqFw_Di_Api_ResolveDetails} */
            const details = this.packages[pkg];
            result = `${details.path}/${parsed.nameModule}.${details.ext}`;
        } else {
            throw new Error(`Cannot resolve path for id '${moduleId}'.`);
        }
        return result;
    }
}

// MODULE'S EXPORT
export {
    TeqFw_Di_Resolver_FilepathNs as default
}
