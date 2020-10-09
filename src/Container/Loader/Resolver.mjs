/**
 * Resolving details.
 *
 * @typedef {Object} TeqFw_Di_Container_Loader_Resolver.ResolveDetailsData
 * @property {string} path
 * @property {string} ext
 * @property {boolean} is_absolute 'true' if path is absolute.
 */
/**
 * Tree-like structure of namespaces registry entry.
 *
 * @memberOf TeqFw_Di_Container_Loader_Resolver
 * @typedef {Object<string, TeqFw_Di_Container_Loader_Resolver.NamespaceData|TeqFw_Di_Container_Loader_Resolver.ResolveDetailsData>} TeqFw_Di_Container_Loader_Resolver.NamespaceData
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
 * Map namespaces to files/URLs. Resolve and cache 'object ID to source path' mapping.
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
     * @type {Object<string, TeqFw_Di_Container_Loader_Resolver.NamespaceData>}
     * @private
     */
    namespaces = {}

    /**
     * Registry root path for the namespace.
     *
     * @param {string} ns namespace (TeqFw_Di)
     * @param {string} path absolute or relative to `TeqFw_Di_Container` sources (see `is_absolute` param)
     * @param {string} [ext] extension to use in filename composition
     * @param {boolean} [is_absolute] default: true
     */
    addNamespaceRoot({ns, path, ext = 'mjs', is_absolute = true}) {
        /** @type {TeqFw_Di_Container_Loader_Resolver.ResolveDetailsData} */
        const entry = {path, ext, is_absolute};
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
     * Resolve path to module's source using `source_id`.
     *
     * @param {string} sourceIid
     * @return {*}
     */
    getSourceById(sourceIid) {
        let result;
        const parts = sourceIid.split(NSS);
        let nsExplored = ''; // explored part of the object's full name
        let pointer = this.namespaces;
        for (const part of parts) {
            if (pointer[part]) {
                pointer = pointer[part];
                if (pointer[KEY_DATA]) {
                    const entry = pointer[KEY_DATA];
                    const {path, ext, is_absolute} = entry;
                    // compose path to NS default root
                    result = `${path}/../index.${ext}`;
                    if (!is_absolute) result = `./${result}`;
                }
            } else {
                const {path, ext, is_absolute} = pointer[KEY_DATA];
                const nsModule = nsExplored.substring(1);
                const nsObject = sourceIid.substring(nsModule.length + 1);
                const pathObject = nsObject.replace(new RegExp(NSS, 'g'), '/') + '.' + ext;
                result = `${path}/${pathObject}`;
                if (!is_absolute) result = `./${result}`;
                break;
            }
            nsExplored += NSS + part;
        }
        if (result === undefined) throw new Error(`Cannot resolve path for id '${sourceIid}'.`);
        return result;
    }

    /**
     * List all namespaces with mapping paths.
     *
     * @return {Object}
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
