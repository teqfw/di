/** Namespace parts separator. */
const NSS = "_";
/** Key to save sources data in "_namespace" registry. */
const KEY_SRC = ".src";

/**
 * Map namespaces to file structure. Resolve and cache "object ID to source path" mapping.
 * @class
 */
export default class TeqFw_Di_Resolver {
    /**
     * Resolving details.
     *
     * @memberOf TeqFw_Di_Resolver
     * @typedef {Object} TeqFw_Di_Resolver.ResolveDetailsData
     * @property {string} path
     * @property {string} ext
     */
    /**
     * Tree-like structure of namespaces registry entry.
     *
     * @memberOf TeqFw_Di_Resolver
     * @typedef {Object<string, TeqFw_Di_Resolver.NamespaceData|TeqFw_Di_Resolver.ResolveDetailsData>} TeqFw_Di_Resolver.NamespaceData
     */

    constructor() {
        /**
         * Registry for namespaces. Tree-like structure to save root paths to sources for namespaces.
         *
         * TeqFw_Prj_App => ./path/to/app/files
         * TeqFw_Prj_App_Mod => ./another/path/to/mod/files
         * TeqFw_Prj_App_Mod_Rewrite => ./rewrite/path/to/part/of/mod/files
         *
         * @type {Object<string, TeqFw_Di_Resolver.NamespaceData>}
         * @private
         */
        const _namespaces = {};
        /**
         *
         * @type {{}}
         * @private
         */
        const _objects = {};

        /**
         * Registry root path for the namespace.
         *
         * @param {string} ns namespace (TeqFw_Di)
         * @param {string} path path (absolute or relative to `TeqFw_Di_Container` sources)
         * @param {string} ext extension to use in filename composition
         * @memberOf TeqFw_Di_Resolver.prototype
         */
        this.addNamespaceRoot = function ({ns, path, ext}) {
            /** @type {TeqFw_Di_Resolver.ResolveDetailsData} */
            const entry = {path, ext};
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
         *
         * @param object_id
         * @return {*}
         * @memberOf TeqFw_Di_Resolver.prototype
         */
        this.getSourceById = function (object_id) {
            let result = object_id;
            if (_objects[object_id]) {
                result = _objects[object_id];
            } else {
                const parts = object_id.split(NSS);
                let ns_explored = ""; // explored part of the object's full name
                let pointer = _namespaces;
                for (const part of parts) {
                    if (pointer[part]) {
                        pointer = pointer[part];
                        if (pointer[KEY_SRC]) {
                            const entry = pointer[KEY_SRC];
                            const path = entry.path;
                            const ext = entry.ext;
                            // compose path to NS default root
                            result = `${path}/../index.${ext}`;
                        }
                    } else {
                        const {path, ext} = pointer[KEY_SRC];
                        const ns_module = ns_explored.substring(1);
                        const ns_object = object_id.substring(ns_module.length + 1);
                        const path_object = ns_object.replace(new RegExp(NSS, 'g'), "/") + "." + ext;
                        result = `${path}/${path_object}`;
                        break;
                    }
                    ns_explored += NSS + part;
                }
                // save source path mapping for object_id
                _objects[object_id] = result;
            }
            return "./" + result;
        };
    }
}