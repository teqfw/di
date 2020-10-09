/**
 * `TeqFw/DI` container.
 *
 * Root object for the package.
 */
import Loader from './Container/Loader.mjs';
import Util from './Util.mjs';
import SpecProxy from './Container/SpecProxy.mjs';

const $util = new Util();

/**
 * Dependency Injection container.
 *
 * @param {Object} [spec]
 * @param {TeqFw_Di_Container_Loader} [spec.modules_loader]
 * @implements {TeqFw_Di_ContainerInterface}
 */
export default class TeqFw_Di_Container {
    constructor(spec = {}) {
        // super();
        /** Created instances (singletons) */
        const _instances = new Map();
        /** Modules loader (given in constructor or empty one) */
        const _modulesLoader = spec.modules_loader || new Loader();

        // set default instance of the DI container
        _instances.set('TeqFw_Di_Container$', this);

        /**
         * Get/create object by given object ID.
         *
         * @param {string} id
         * @param {Set<string>} depsStack stack of dependencies to prevent circular loop.
         * @return {Promise<Object>}
         */
        function getObject(id, depsStack) {
            return new Promise(function (resolve, reject) {

                /**
                 * Create new object using `imported` object (class or function) and `spec` proxy to resolve
                 * dependencies.
                 *
                 * @param {Function} constructor
                 * @param {TeqFw_Di_Container_SpecProxy} spec
                 * @return {Object}
                 */
                function createInstance(constructor, spec) {
                    // https://stackoverflow.com/a/29094018/4073821
                    const proto = Object.getOwnPropertyDescriptor(constructor, 'prototype');
                    const isClass = proto && !proto.writable;
                    if (isClass) {
                        return new constructor(spec);
                    } else {
                        return constructor(spec);
                    }
                }

                // local registry to save make-functions for main object & its dependencies
                const makeFuncs = {};
                const parsed = $util.parseId(id);
                // get required instance from `_instances` or check sources import and create new dependency
                if (
                    (parsed.is_instance) &&
                    (_instances.get(parsed.id) !== undefined)
                ) {
                    const instById = _instances.get(parsed.id);
                    // instance with required `id` was created before, just return it
                    resolve(instById);
                } else {
                    // get `constructor` object from Loader then create new object
                    _modulesLoader.get(parsed.id)
                        .then((constructor) => {
                            const constructorType = typeof constructor;
                            if (constructorType === 'object') {
                                // `constructor` is an object, clone this object and return new one on every call
                                const result = Object.assign({}, constructor);
                                resolve(result);
                            } else if (constructorType === 'function') {
                                // `constructor` is simple function or class
                                // create spec proxy to analyze dependencies of the construction object in current scope
                                const spec = new SpecProxy(id, depsStack, _instances, makeFuncs, getObject, reject);
                                // create new function to resolve all deps and to make requested object
                                const fnMake = function () {
                                    try {
                                        const instNew = createInstance(constructor, spec);
                                        if (parsed.is_instance) _instances.set(parsed.id, instNew);
                                        resolve(instNew);
                                    } catch (e) {
                                        // stealth constructor exceptions (for absent deps that should be made asyncly)
                                        if (e !== SpecProxy.EXCEPTION_TO_STEALTH) throw e;
                                    }
                                };
                                //register `make` function in the local context to re-call it later
                                // (when any un-existing dependency will be created)
                                makeFuncs[parsed.id] = fnMake;
                                fnMake();
                            } else {
                                throw new Error('Unexpected type of loaded module.');
                            }
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
            });
        }

        /**
         *
         * @param {string} namespace
         * @param {string} path
         * @param {boolean} [is_absolute]
         * @param {string} [ext]
         */
        this.addSourceMapping = function (namespace, path, is_absolute = false, ext = 'mjs') {
            const parsed = $util.parseId(namespace);
            if (parsed.is_instance) throw new Error('Namespace cannot contain \'$\' symbol.');
            _modulesLoader.addNamespaceRoot({ns: parsed.source_part, path, ext, is_absolute});
        };

        /**
         * Delete stored instance or import result (factory function or object) by `id` (if exist).
         *
         * @param {string} depId
         */
        this.delete = function (depId) {
            const parsed = $util.parseId(depId);
            if (parsed.is_instance) {
                _instances.delete(parsed.id);
            } else {
                _modulesLoader.delete(parsed.id);
            }
        };

        /**
         * Get/create object by ID.
         *
         * @param {string} depId
         * @return {Promise<Object>}
         */
        this.get = async function (depId) {
            const depsStack = new Set([depId]);
            return await getObject(depId, depsStack);
        };

        /**
         * @return {TeqFw_Di_Container_Loader}
         */
        this.getLoader = function () {
            return _modulesLoader;
        };
        /**
         * Check existence of created instance or imported data in container.
         *
         * @param {string} depId
         * @return {boolean}
         */
        this.has = function (depId) {
            const parsed = $util.parseId(depId);
            if (parsed.is_instance) {
                return _instances.has(parsed.id);
            } else {
                return _modulesLoader.has(parsed.id);
            }
        };

        /**
         * Get list of contained dependencies (created instances and loaded modules).
         *
         * @return {Array<string>}
         */
        this.list = function () {
            const instances = Array.from(_instances.keys());
            const modules = _modulesLoader.list();
            const result = [...instances, ...modules];
            result.sort();
            return result;
        };
        /**
         * Place object instance into the container. Replace existing instance with the same ID.
         *
         * @param {string} depId - ID for (named) instance ('Vendor_Module_Object$', 'Vendor_Module_Object$name').
         * @param {Object} object
         */
        this.set = function (depId, object) {
            const parsed = $util.parseId(depId);
            if (parsed.is_instance) {
                _instances.set(parsed.id, object);
            } else {
                _modulesLoader.set(parsed.id, object);
            }
        };
    }
}
