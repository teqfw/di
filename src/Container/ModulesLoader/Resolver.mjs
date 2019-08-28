/** Namespace parts separator. */
const NSS = "_";
/** Key to save sources data in "_namespace" registry. */
const KEY_SRC = ".src";

/**
 * Map namespaces to file structure. Resolve and cache "object ID to source path" mapping.
 * @class
 */
export default class TeqFw_Di_Container_ModulesLoader_Resolver {
    /**
     * Resolving details.
     *
     * @memberOf TeqFw_Di_Container_ModulesLoader_Resolver
     * @typedef {Object} TeqFw_Di_Container_ModulesLoader_Resolver.ResolveDetailsData
     * @property {string} path
     * @property {string} ext
     * @property {boolean} is_absolute 'true' if path is absolute.
     */
    /**
     * Tree-like structure of namespaces registry entry.
     *
     * @memberOf TeqFw_Di_Container_ModulesLoader_Resolver
     * @typedef {Object<string, TeqFw_Di_Container_ModulesLoader_Resolver.NamespaceData|TeqFw_Di_Container_ModulesLoader_Resolver.ResolveDetailsData>} TeqFw_Di_Container_ModulesLoader_Resolver.NamespaceData
     */

    constructor() {
        /**
         * Registry for namespaces. Tree-like structure to save root paths to sources for namespaces.
         *
         * TeqFw_Prj_App => ./path/to/app/files
         * TeqFw_Prj_App_Mod => ./another/path/to/mod/files
         * TeqFw_Prj_App_Mod_Rewrite => ./rewrite/path/to/part/of/mod/files
         *
         * @type {Object<string, TeqFw_Di_Container_ModulesLoader_Resolver.NamespaceData>}
         * @private
         */
        const _namespaces = {};

        /**
         * Registry root path for the namespace.
         *
         * @param {string} ns namespace (TeqFw_Di)
         * @param {string} path absolute or relative to `TeqFw_Di_Container` sources (see `is_absolute` param)
         * @param {string} [ext] extension to use in filename composition
         * @param {boolean} [is_absolute] default: true
         * @memberOf TeqFw_Di_Container_ModulesLoader_Resolver.prototype
         */
        this.addNamespaceRoot = function ({ns, path, ext = "js", is_absolute = true}) {
            /** @type {TeqFw_Di_Container_ModulesLoader_Resolver.ResolveDetailsData} */
            const entry = {path, ext, is_absolute};
            const spaces = ns.split(NSS);
            let pointer = _namespaces;
            for (const one of spaces) {
                if (!pointer[one]) {
                    pointer[one] = {};
                    pointer = pointer[one];
                } else {
                    pointer = pointer[one];
                }
            }
            // add source folder to the namespaces map
            pointer[KEY_SRC] = entry;
        };

        /**
         * Resolve path to module's source using `source_id`.
         *
         * @param {string} source_id
         * @return {*}
         * @memberOf TeqFw_Di_Container_ModulesLoader_Resolver.prototype
         */
        this.getSourceById = function (source_id) {
            let result;
            const parts = source_id.split(NSS);
            let ns_explored = ""; // explored part of the object's full name
            let pointer = _namespaces;
            for (const part of parts) {
                if (pointer[part]) {
                    pointer = pointer[part];
                    if (pointer[KEY_SRC]) {
                        const entry = pointer[KEY_SRC];
                        const {path, ext, is_absolute} = entry;
                        // compose path to NS default root
                        result = `${path}/../index.${ext}`;
                        if (!is_absolute) result = `./${result}`;
                    }
                } else {
                    const {path, ext, is_absolute} = pointer[KEY_SRC];
                    const ns_module = ns_explored.substring(1);
                    const ns_object = source_id.substring(ns_module.length + 1);
                    const path_object = ns_object.replace(new RegExp(NSS, 'g'), "/") + "." + ext;
                    result = `${path}/${path_object}`;
                    if (!is_absolute) result = `./${result}`;
                    break;
                }
                ns_explored += NSS + part;
            }
            if (result === undefined) throw new Error(`Cannot resolve path for id '${source_id}'.`);
            return result;
        };

        /**
         * @return {Object}
         * @memberOf TeqFw_Di_Container_ModulesLoader_Resolver.prototype
         */
        this.list = function () {
            const result = {};

            /**
             * Scan one level of mapping tree and save mapping data into results (if found) and/or dive deeper.

             * @param cur_path
             * @param level
             */
            function scan_level(cur_path, level) {
                for (const key of Object.keys(level)) {
                    if (key === KEY_SRC) {
                        result[cur_path] = level[KEY_SRC];
                    } else {
                        const sub_path = (cur_path) ? cur_path + NSS + key : key;
                        const sub = level[key];
                        scan_level(sub_path, sub);
                    }
                }
            }

            scan_level("", _namespaces);
            return result;
        }
    }
}