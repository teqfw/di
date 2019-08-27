/**
 * `TeqFw/DI` container.
 *
 * Root object for the package.
 *
 * @namespace TeqFw_Di
 */
import ModulesLoader from "./ModulesLoader.mjs";
import Normalizer from "./Normalizer.mjs";

/**
 * Dependency Injection container.
 *
 * @param {Object} [spec]
 * @param {TeqFw_Di_ModulesLoader} [spec.modules_loader]
 * @memberOf TeqFw_Di
 */
class TeqFw_Di_Container {
    constructor(spec = {}) {
        /** Created instances (singletons) */
        const _instances = new Map();
        /** Modules loader (given in constructor or empty one) */
        const _modules_loader = spec.modules_loader || new ModulesLoader();

        // set default instance of the DI container
        _instances.set("TeqFw_Di_Container$", this);

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
            _modules_loader.addNamespaceRoot({ns: parsed.source_part, path, ext, is_absolute: true});
        }
        /**
         * Delete stored instance or import result (factory function or object) by `id` (if exist).
         *
         * @param {string} dep_id
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.delete = function (dep_id) {
            const parsed = Normalizer.parseId(dep_id);
            if (parsed.is_instance) {
                _instances.delete(parsed.id);
            } else {
                _modules_loader.delete(parsed.id);
            }
        };

        /**
         * Get/create object by given object ID.
         *
         * @param {string} id
         * @return {Promise<Object>}
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.get = async function get_object(id) {
            return new Promise(function (resolve, reject) {

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
                                    }).catch(err => {
                                        reject(err);
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
                 * Create new object using `imported` object (class or function) and `spec` proxy to resolve
                 * dependencies.
                 *
                 * @param {Function} imported
                 * @param {Proxy} spec
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
                        throw new Error("Is not implemented yet");
                    }
                } else {
                    // get imported object from `_imports` (or load sources) then create new object
                    _modules_loader.get(parsed.id)
                        .then((imported) => {
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
                                        const break_point = err;
                                    });
                                };
                                //register `make` function in the local context to re-call it later
                                // (when any un-existing dependency will be created)
                                create_funcs[parsed.id] = fn_make;
                                fn_make();
                            } else {
                                throw new Error("Unexpected type of loaded module.");
                            }
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
            });
        };

        /**
         * @return {TeqFw_Di_ModulesLoader}
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.getModulesLoader = function () {
            return _modules_loader;
        };

        /**
         * Check existence of created instance or imported data in container.
         *
         * @param {string} dep_id
         * @return {boolean}
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.has = function (dep_id) {
            const parsed = Normalizer.parseId(dep_id);
            if (parsed.is_instance) {
                return _instances.has(parsed.id);
            } else {
                return _modules_loader.has(parsed.id);
            }
        };

        /**
         * Get list of contained dependencies (created instances and loaded modules).
         *
         * @return {Array<string>}
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.list = function () {
            const instances = Array.from(_instances.keys());
            const modules = _modules_loader.list();
            const result = [...instances, ...modules];
            result.sort();
            return result;
        };
        /**
         * Place object instance into the container. Replace existing instance with the same ID.
         *
         * @param {string} dep_id - ID for (named) instance ("Vendor_Module_Object$", "Vendor_Module_Object$name").
         * @param {Object} object
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.set = function (dep_id, object) {
            const parsed = Normalizer.parseId(dep_id);
            if (parsed.is_instance) {
                _instances.set(parsed.id, object);
            } else {
                _modules_loader.set(parsed.id, object);
            }
        };


    }
}

export default TeqFw_Di_Container;