/**
 * `TeqFw/DI` container.
 *
 * Root object for the package.
 *
 * @namespace TeqFw_Di
 */
import ModulesLoader from "./ModulesLoader.mjs";
import Normalizer from "./Normalizer.mjs";
import SpecProxy from "./Container/SpecProxy.mjs";

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
         * @param {Array<string>} deps_stack stack of dependencies to prevent circular loop.
         * @return {Promise<Object>}
         * @memberOf TeqFw_Di_Container.prototype
         */
        function get_object(id, deps_stack) {
            return new Promise(function (resolve, reject) {

                /**
                 * Create new object using `imported` object (class or function) and `spec` proxy to resolve
                 * dependencies.
                 *
                 * @param {Function} constructor
                 * @param {TeqFw_Di_Container_SpecProxy} spec
                 * @return {Object}
                 */
                function create_instance(constructor, spec) {
                    // https://stackoverflow.com/a/29094018/4073821
                    const proto = Object.getOwnPropertyDescriptor(constructor, 'prototype');
                    const is_class = !proto.writable;
                    if (is_class) {
                        return new constructor(spec);
                    } else {
                        return constructor(spec);
                    }
                }

                // local registry to save make-functions for main object & its dependencies
                const make_funcs = {};
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
                    // get `constructor` object from ModulesLoader then create new object
                    _modules_loader.get(parsed.id)
                        .then((constructor) => {
                            const constructor_type = typeof constructor;
                            if (constructor_type === "object") {
                                // `constructor` is an object, clone this object and return new one on every call
                                const result = Object.assign({}, constructor);
                                resolve(result);
                            } else if (constructor_type === "function") {
                                // `constructor` is simple function or class
                                // create spec proxy to analyze dependencies of the construction object in current scope
                                const spec = new SpecProxy(id, deps_stack, _instances, make_funcs, get_object, reject);
                                // create new function to resolve all deps and to make requested object
                                const fn_make = function () {
                                    try {
                                        const inst_new = create_instance(constructor, spec);
                                        resolve(inst_new);
                                    } catch (e) {
                                        // stealth constructor exceptions (for absent deps that should be made asyncly)
                                        if (e !== SpecProxy.EXCEPTION_TO_STEALTH) throw e;
                                    }
                                };
                                //register `make` function in the local context to re-call it later
                                // (when any un-existing dependency will be created)
                                make_funcs[parsed.id] = fn_make;
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
         * Get/create object by ID.
         *
         * @param {string} id
         * @return {Promise<Object>}
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.get = async function (id) {
            const deps_stack = [id];
            try {
                const result = await get_object(id, deps_stack);
                return result;
            } catch (e) {
                throw e;
            }
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