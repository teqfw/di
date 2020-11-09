import IdParser from './IdParser.mjs';
import ResolveDetails from './Api/ResolveDetails.mjs';
import Resolver from './Resolver.mjs';
import SpecProxy from './SpecProxy.mjs';

const $parser = new IdParser();

/**
 * Dependency Injection container.
 */
export default class TeqFw_Di_Container {
    /**
     * @param {Object} [spec]
     * @param {TeqFw_Di_Container_Resolver} [spec.namespaceResolver] custom resolver to map module names to file paths
     */
    constructor(spec = {}) {
        /** @type {TeqFw_Di_Container_Resolver} Modules loader (given in constructor or empty one). */
        const _resolver = spec.namespaceResolver || new Resolver();
        /**
         * Storage for default exports (functions & classes) to construct new objects.
         * Module name ('Vendor_Project_Module') is a key in the map.
         */
        const _constructors = new Map();
        /**
         * Storage for created instances (singletons).
         * Module name ('Vendor_Project_Module') or singleton name ('dbConnection') is a key in the map.
         */
        const _singletons = new Map();
        /**
         * Storage for loaded modules.
         * Module name ('Vendor_Project_Module') is a key in the map.
         */
        const _modules = new Map();

        // set default instance of the DI container (as named object and as default export singleton)
        _singletons.set('container', this);
        _singletons.set('TeqFw_Di_Container$$', this);

        /**
         * Internal function to get/create object|function|class|module by given `id`.
         *
         * @param {string} mainId main object ID (named singleton, module, new object, default export singleton)
         * @param {Object.<string, boolean>} depsReg dependencies registry to prevent circular loop.
         * @return {Promise<Object>}
         */
        function getObject(mainId, depsReg) {
            return new Promise(function (resolve, reject) {

                // DEFINE INNER FUNCTIONS
                /**
                 * Add 'spec' proxy as fnConstruct argument and create new object and all deps.
                 *
                 * @param {Function|Object} fnConstruct
                 * @return {Promise<Object>} created object
                 * @private
                 */
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
                    let result;
                    const constructorType = typeof fnConstruct;
                    if (constructorType === 'object') {
                        // `constructor` is an object, clone this object and return new one on every call
                        result = Object.assign({}, fnConstruct);
                    } else if (constructorType === 'function') {
                        // `constructor` is simple function or class
                        // create spec proxy to analyze dependencies of the constructing object in current scope
                        const spec = new SpecProxy(mainId, depsReg, _singletons, _constructors, _modules, createFuncs, getObject, reject);
                        // create new function to resolve all deps and to make requested object
                        const fnCreate = function () {
                            try {
                                const instNew = createInstance(fnConstruct, spec);
                                // `parsed` is an dependency ID structure from closure where this function is defined
                                if (parsed.isSingleton) {
                                    const key = parsed.isNamedObject ? parsed.id : parsed.moduleName;
                                    _singletons.set(key, instNew);
                                }
                                return instNew;
                            } catch (e) {
                                // stealth constructor exceptions (for absent deps that should be made asyncly)
                                if (e !== SpecProxy.EXCEPTION_TO_STEALTH) throw e;
                            }
                        };
                        //register `create` function in the local context to re-call it later
                        // (when any un-existing dependency will be created)
                        createFuncs[parsed.id] = fnCreate;
                        result = fnCreate();
                    } else {
                        throw new Error('Unexpected type of loaded module.');
                    }
                    return result;
                }

                // MAIN FUNCTIONALITY
                // local registry to save construct functions for main object & its dependencies
                const createFuncs = {};
                /** @type {TeqFw_Di_Api_ParsedId} */
                const parsed = $parser.parse(mainId);
                // get required instance from own registries or load sources and create new one
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
                    // Get path to sources by module name then load ES module
                    const sourceFile = _resolver.getSourceById(parsed.moduleName);
                    import(sourceFile)
                        .then((module) => {
                            _modules.set(parsed.moduleName, module);
                            if (parsed.isModule) {
                                resolve(module);
                            } else {
                                // use default export as constructor
                                const construct = module.default;
                                _constructors.set(parsed.moduleName, construct);
                                _useConstructor(construct).then((object) => {
                                    if (parsed.isSingleton) {
                                        _singletons.set(parsed.moduleName, object);
                                    }
                                    resolve(object);
                                }).catch((e) => {
                                    console.error('@teqfw/di: ' + JSON.stringify(e));
                                    throw e;
                                });
                            }
                        })
                        .catch((e) => {
                            console.error('@teqfw/di: ' + JSON.stringify(e));
                            throw e;
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
            const parsed = $parser.parse(namespace);
            if (!parsed.isModule) throw new Error('Namespace cannot contain \'$\' symbol.');
            const details = new ResolveDetails();
            Object.assign(details, {ns: namespace, path, ext, isAbsolute: is_absolute});
            _resolver.addNamespaceRoot(details);
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
         * Get/create object|function|class|module by dependency ID (wrapper for internal function).
         *
         * @param {string} depId 'namedDep', 'Vendor_Module', 'New_Object_From_Default$', 'Singleton_From_Default$$'
         * @return {Promise<Object>}
         */
        this.get = async function (depId) {
            return await getObject(depId, {[depId]: true});
        };

        /**
         * @return {TeqFw_Di_Container_Resolver}
         */
        this.getNsResolver = function () {
            return _resolver;
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
         * @return {{constructors: string[], singletons: string[], modules: string[]}}
         */
        this.list = function () {
            const singletons = Array.from(_singletons.keys()).sort();
            const constructors = Array.from(_constructors.keys()).sort();
            const modules = Array.from(_modules.keys()).sort();
            return {singletons, constructors, modules};
        };
        /**
         * Place object into the container. Replace existing instance with the same ID.
         *
         * 'object' should correlate with 'depId':
         *  - named singleton ('namedDep'): any object will be stored as singleton;
         *  - ES module ('Vendor_Module'): will be stored as ES module;
         *  - constructor ('New_Object_From_Default$'): will be stored as object constructor with key 'New_Object_From_Default';
         *  - instance ('Singleton_From_Default$$'): will be stored as singleton with key 'Singleton_From_Default';
         *
         * @param {string} depId 'namedDep', 'Vendor_Module', 'New_Object_From_Default$', 'Singleton_From_Default$$'.
         * @param {Object} object
         */
        this.set = function (depId, object) {
            const parsed = $parser.parse(depId);
            if (parsed.isSingleton) {
                // keys are without '$' chars: named object or module name
                const key = (parsed.isNamedObject) ? parsed.id : parsed.moduleName;
                _singletons.set(key, object);
            } else if (parsed.isConstructor) {
                _constructors.set(parsed.id, object);
            } else if (parsed.isModule) {
                _modules.set(parsed.id, object);
            }
        };
    }
}
