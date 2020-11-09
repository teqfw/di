/**
 * `TeqFw/DI` container.
 *
 * Root object for the package.
 */
import IdParser from './IdParser.mjs';
import Loader from './Container/Loader.mjs';
import SpecProxy from './Container/SpecProxy.mjs';
import Util from './Util.mjs';

const $util = new Util();
const $parser = new IdParser();

/**
 * Dependency Injection container.
 *
 * @param {Object} [spec]
 * @param {TeqFw_Di_Container_Loader} [spec.modules_loader]
 * @implements {TeqFw_Di_ContainerInterface}
 */
export default class TeqFw_Di_Container {
    constructor(spec = {}) {
        /** Storage for default exports (functions & classes) to construct new objects. */
        const _constructors = new Map();
        /** Storage for created instances (singletons). */
        const _singletons = new Map();
        /** Storage for loaded modules. **/
        const _modules = new Map();
        /** Modules loader (given in constructor or empty one). */
        const _modulesLoader = spec.modulesLoader || new Loader();

        // set default instance of the DI container
        _singletons.set('TeqFw_Di_Container$$', this);

        /**
         * Get/create object by given object ID.
         *
         * @param {string} id
         * @param {Set<string>} depsStack stack of dependencies to prevent circular loop.
         * @return {Promise<Object>}
         */
        function getObject(id, depsStack) {
            return new Promise(function (resolve, reject) {

                // DEFINE INNER FUNCTIONS
                async function _useConstructor(fnConstruct) {
                    // DEFINE INNER FUNCTIONS
                    /**
                     * Try to create new object using `constructor` (object, function or class) and `spec` proxy
                     * to resolve dependencies.
                     *
                     * @param {Object, Function} constructor
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

                    // MAIN FUNCTIONALITY
                    const constructorType = typeof fnConstruct;
                    if (constructorType === 'object') {
                        // `constructor` is an object, clone this object and return new one on every call
                        const result = Object.assign({}, fnConstruct);
                        resolve(result); // `getObject` result promise's resolve
                    } else if (constructorType === 'function') {
                        // `constructor` is simple function or class
                        // create spec proxy to analyze dependencies of the constructing object in current scope
                        const spec = new SpecProxy(id, depsStack, _singletons, _constructors, _modules, makeFuncs, getObject, reject);
                        // create new function to resolve all deps and to make requested object
                        const fnMake = function () {
                            try {
                                const instNew = createInstance(fnConstruct, spec);
                                // `parsed` is an dependency ID structure from closure where this function is defined
                                if (parsed.isSingleton) _singletons.set(parsed.id, instNew);
                                resolve(instNew); // `getObject` result promise's resolve
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
                }

                // local registry to save make-functions for main object & its dependencies
                const makeFuncs = {};
                /** @type {TeqFw_Di_Api_ParsedId} */
                const parsed = $parser.parse(id);
                // get required instance from `_instances` or check sources import and create new dependency
                if ((parsed.isSingleton) && (_singletons.get(parsed.id) !== undefined)) {
                    // instance with required `id` was created before, just return it
                    const instById = _singletons.get(parsed.id);
                    resolve(instById);
                } else if ((parsed.isModule) && (_modules.get(parsed.id) !== undefined)) {
                    // module with required `id` was loaded before, just return it
                    const modById = _modules.get(parsed.id);
                    resolve(modById);
                } else if ((parsed.isConstructor) && (_constructors.get(parsed.id) !== undefined)) {
                    // default export constructor with required `id` was loaded before, create & return new object
                    const construct = _constructors.get(parsed.id);
                    _useConstructor(construct).then(resolve).catch(err => reject(err));
                } else {
                    // get `constructor` object from Loader then create new object
                    _modulesLoader.get(parsed.id)
                        .then(_useConstructor)
                        .catch(err => reject(err));
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
            const parsed = $parser.parse(depId);
            if (parsed.isSingleton) {
                _singletons.delete(parsed.id);
            } else if (parsed.isConstructor) {
                _constructors.delete(parsed.id);
            } else if (parsed.isModule) {
                _modules.delete(parsed.id);
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
            const parsed = $parser.parse(depId);
            if (parsed.isSingleton) {
                return _singletons.has(parsed.id);
            } else if (parsed.isConstructor) {
                return _constructors.has(parsed.id);
            } else if (parsed.isModule) {
                return _modules.has(parsed.id);
            }
        };

        /**
         * Get list of contained dependencies (created instances and loaded modules).
         *
         * @return {Array<string>}
         */
        this.list = function () {
            const singletons = Array.from(_singletons.keys());
            const constructors = Array.from(_constructors.keys());
            const modules = Array.from(_modules.keys());
            const result = [...singletons, ...constructors, ...modules];
            result.sort();
            return result;
        };
        /**
         * Place object into the container. Replace existing instance with the same ID.
         *
         * @param {string} depId - ID for (named) instance ('Vendor_Module_Object$', 'Vendor_Module_Object$name').
         * @param {Object} object
         */
        this.set = function (depId, object) {
            const parsed = $parser.parse(depId);
            if (parsed.isSingleton) {
                _singletons.set(parsed.id, object);
            } else if (parsed.isConstructor) {
                _constructors.set(parsed.id, object);
            } else if (parsed.isModule) {
                _modules.set(parsed.id, object);
            }
        };
    }
}
