import TeqFw_Di_Api_ResolveDetails from '../../Api/ResolveDetails.mjs';
/**
 * Tree-like structure of namespaces registry entry.
 *
 * @typedef {Object<string, NamespaceDetails|TeqFw_Di_Api_ResolveDetails>} NamespaceDetails
 */

/**
 * Namespace parts separator.
 *
 * @type {string}
 * @memberOf TeqFw_Di_Container_Loader_Resolver
 */
const NSS = '_';

/**
 * Key to save sources data in '_namespace' registry.
 *
 * @type {string}
 * @memberOf TeqFw_Di_Container_Loader_Resolver
 */
const KEY_DATA = '.data';

/**
 * Map codebase namespaces to files/URLs.
 */
export default class TeqFw_Di_Container_Loader_Resolver {
    /**
     * Registry for namespaces. Tree-like structure to save root paths (relative or absolute) to sources
     * by namespaces.
     *
     * TeqFw_Prj_App => ./path/to/app/files
     * TeqFw_Prj_App_Mod => ./another/path/to/mod/files
     * TeqFw_Prj_App_Mod_Rewrite => ./rewrite/path/to/part/of/mod/files
     *
     * @type {Object<string, NamespaceDetails>}
     * @private
     */
    namespaces = {}

    /**
     * Registry root path for the namespace.
     *
     * @param {string} ns namespace (`Vendor_Project`)
     * @param {string} path absolute or relative path to module sources (`https://vendor.com/lib/`)
     * @param {string} [ext] extension to use in filename composition (`mjs`|`js`)
     * @param {boolean} [isAbsolute] absolute or relative path (default: true)
     */
    addNamespaceRoot({ns, path, ext = 'mjs', isAbsolute = true}) {
        const entry = new TeqFw_Di_Api_ResolveDetails();
        Object.assign(entry, {ns, path, ext, isAbsolute});
        const spaces = ns.split(NSS);
        let pointer = this.namespaces;
        for (const one of spaces) {
            if (!pointer[one]) {
                pointer[one] = {};
                pointer = pointer[one];
            } else {
                pointer = pointer[one];
            }
        }
        // add source folder to the namespaces map
        pointer[KEY_DATA] = entry;
    }

    /**
     * Resolve path to module's source using `moduleId`:
     *  - Vendor_Project_Module => './relative/path/to/vendor/Project/Module.mjs'
     *  - Vendor_Project_Module => '/absolute/path/to/project/Module.js'
     *  - Vendor_Project_Module => 'https://vendor.com/lib/Project/Module.js'
     *
     * @param {string} moduleId
     * @return {*}
     */
    getSourceById(moduleId) {
        let result;
        const parts = moduleId.split(NSS);
        let nsExplored = ''; // explored part of the object's full name
        let pointer = this.namespaces;
        for (const part of parts) {
            if (pointer[part]) {
                pointer = pointer[part];
                if (pointer[KEY_DATA]) {
                    // compose path to root module of the current namespace (`index.[js|mjs]`)
                    /** @type {TeqFw_Di_Api_ResolveDetails} */
                    const entry = pointer[KEY_DATA];
                    // compose path to NS default root
                    result = `${entry.path}/../index.${entry.ext}`;
                    if (!entry.isAbsolute) result = `./${result}`;
                }
            } else {
                // compose path to requested module starting from namespace root
                if (pointer[KEY_DATA]) {
                    /** @type {TeqFw_Di_Api_ResolveDetails} */
                    const entry = pointer[KEY_DATA];
                    const nsModule = nsExplored.substring(1);
                    const nsObject = moduleId.substring(nsModule.length + 1);
                    const pathObject = nsObject.replace(new RegExp(NSS, 'g'), '/') + '.' + entry.ext;
                    result = `${entry.path}/${pathObject}`;
                    if (!entry.isAbsolute) result = `./${result}`;
                    break;
                }
            }
            nsExplored += NSS + part;
        }
        if (result === undefined) throw new Error(`Cannot resolve path for id '${moduleId}'.`);
        // strip '././' from result
        result = result.replace('././', './');
        return result;
    }

    /**
     * List all namespaces with resolving details.
     *
     * @return {Object.<string, TeqFw_Di_Api_ResolveDetails>}
     */
    list() {
        const result = {};

        /**
         * Scan one level of mapping tree and save mapping data into results (if found) and/or dive deeper.

         * @param {string} curPath
         * @param level
         */
        function scanLevel(curPath, level) {
            for (const key of Object.keys(level)) {
                if (key === KEY_DATA) {
                    result[curPath] = level[KEY_DATA];
                } else {
                    const subPath = (curPath) ? curPath + NSS + key : key;
                    const sub = level[key];
                    scanLevel(subPath, sub);
                }
            }
        }

        scanLevel('', this.namespaces);
        return result;
    }

}
