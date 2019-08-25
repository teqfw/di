/**
 * `TeqFw/DI` container.
 *
 * Root object for the package.
 *
 * @namespace TeqFw_Di
 */
import Normalizer from "./Normalizer.mjs";
import Resolver from "./Resolver.mjs";

/**
 * Dependency Injection container.
 *
 * @memberOf TeqFw_Di
 */
class TeqFw_Di_Container {
    constructor() {
        /** Defaults imported from the sources  */
        const _imports = new Map();
        /** Created instances (singletons) */
        const _instances = new Map();
        /** Namespace to path (filesystem or web) mapping */
        const _sources = new Map();
        /** Object to resolve path to source by dependency ID */
        const _resolver = new Resolver();

        // set default instance of the DI container
        _instances.set("TeqFw_Di_Container$", this);

        /**
         * Get/create object by given object ID.
         *
         * @param {string} id
         * @return {Promise<Object>}
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.get = async function get_object(id) {
            return new Promise(function (resolve) {

                function create_proxy_spec() {
                    // dependencies to create currently requested object (local cache)
                    const deps = {};
                    return new Proxy({}, {
                        get(target, dep_id) {
                            // analyze property name and create deps here...
                            if (deps[dep_id]) {
                                // return dependency from local cache
                                return deps[dep_id];
                            } else {
                                // look up dependency in container
                                const parsed = Normalizer.parseId(dep_id);
                                if (parsed.is_instance && _instances.has(dep_id)) {
                                    // requested dependency is an instance and is created already
                                    // save dependency to local cache & return
                                    deps[dep_id] = _instances.get(dep_id);
                                    return deps[dep_id];
                                } else {
                                    // create new instance
                                    get_object(dep_id).then((obj) => {
                                        deps[dep_id] = obj;
                                        // we need to call to failed function to create parent object
                                        // see "function create_object(id)"
                                        const fn_parent = create_funcs[id];
                                        fn_parent();
                                    });
                                }
                                // interrupt construction process until new dependency will be created
                                // and new construction process will be started
                                throw `There is no dependency with id '${dep_id}' yet.`;
                            }
                        }
                    });
                }

                /**
                 * Create new object using `imported` object (class or function).
                 *
                 * @param {Function} imported
                 * @param imported
                 * @return {Promise<Object>}
                 */
                async function create_instance(imported, spec) {
                    /**
                     *  Return "true" if `obj` is a class (not just a function).
                     *
                     *  https://stackoverflow.com/a/29094018/4073821
                     *
                     * @param {Function} obj
                     * @return {boolean}
                     */
                    function is_class(obj) {
                        const proto = Object.getOwnPropertyDescriptor(obj, 'prototype');
                        return !proto.writable;
                    }

                    if (is_class(imported)) {
                        return new imported(spec);
                    } else {
                        return imported(spec);
                    }
                }

                // local cache to save make-functions for main object & dependencies
                const create_funcs = {};
                const parsed = Normalizer.parseId(id);

                if (parsed.is_instance) {
                    // get required instance from `_instances` or check sources import and create new one
                    const inst_by_id = _instances.get(parsed.id);
                    if (inst_by_id !== undefined) {
                        // instance with required `id` was created before, just return it
                        resolve(inst_by_id);
                    } else {
                        // TODO: create new instance then save it to `_instance` registry.
                    }
                } else {
                    // get imported object from `_imports` (or load sources) then create new object
                    const imported = _imports.get(parsed.id);
                    const import_type = typeof imported;
                    if (import_type === "object") {
                        // imported data is an object, clone this object and return new one on every call
                        const result = Object.assign({}, imported);
                        resolve(result);
                    } else if (import_type === "function") {
                        // imported data is simple function or class
                        // create new function to resolve all deps and to make requested object
                        const spec = create_proxy_spec();
                        const fn_make = function () {
                            create_instance(imported, spec).then((obj) => {
                                resolve(obj);
                            }).catch((err) => {
                                // stealth constructor exceptions
                            });
                        };
                        //register `make` function in the local context to re-call it later
                        // (when any un-existing dependency will be created)
                        create_funcs[parsed.id] = fn_make;
                        fn_make();
                    } else if (import_type === "undefined") {
                        // we need to import sources before creating dependency
                    } else {
                        throw new Error("Unexpected type of stored import.");
                    }
                }
            });
        };

        /**
         * Check existence of singleton or imported data in container.
         *
         * @param {string} id
         * @return {boolean} 'true' if
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.has = function (id) {
        };

        /**
         * Delete stored object by `id` (if exist).
         *
         * @param {string} id
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.delete = function (id) {
        };

        /**
         * Place object instance (singleton) into the container. Replace existing object with the same ID.
         *
         * @param {string} id - ID for (named) singleton ("Vendor_Module_Object$", "Vendor_Module_Object$name").
         * @param {Object} object
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.put = function (id, object) {
            const parsed = Normalizer.parseId(id);
            if (parsed.is_instance) {
                _instances.set(parsed.id, object);
            } else {
                _imports.set(parsed.id, object);
            }
        };

        /**
         *
         * @param {string} namespace
         * @param {string} path
         * @param {string} [ext]
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.addSourceMapping = function (namespace, path, ext = "mjs") {
            const parsed = Normalizer.parseId(namespace);
            if (parsed.is_instance) throw new Error(`Namespace cannot contain '$' symbol.`);
            _resolver.addNamespaceRoot({ns: parsed.source_part, path, ext});
        }
    }
}

export default TeqFw_Di_Container;