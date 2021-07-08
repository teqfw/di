// MODULE'S IMPORT
import IdParser from '../IdParser.mjs';

// MODULE'S VARS
const $parser = new IdParser();

/**
 * Map codebase file path namespaces to files/URLs.
 */
export default class TeqFw_Di_Shared_Resolver_FilepathNs {
    /** @type {Object.<string, TeqFw_Di_Back_Api_Dto_Resolve>} */
    packages = {}

    /**
     * Register 'package to sources root' mapping.
     *
     * @param {TeqFw_Di_Back_Api_Dto_Resolve} details namespace resolving details
     */
    addNamespaceRoot(details) {
        this.packages[details.ns] = details;
    }

    /**
     * List all registered packages with resolving details.
     *
     * @returns {Object.<string, TeqFw_Di_Back_Api_Dto_Resolve>}
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
        /** @type {TeqFw_Di_Shared_IdParser_Dto} */
        const parsed = $parser.parse(moduleId);
        const pkg = parsed.namePackage;
        if (this.packages[pkg]) {
            /** @type {TeqFw_Di_Back_Api_Dto_Resolve} */
            const details = this.packages[pkg];
            result = `${details.path}/${parsed.nameModule}.${details.ext}`;
        } else {
            throw new Error(`Cannot resolve path for id '${moduleId}'.`);
        }
        return result;
    }
}
