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
     * @param {TeqFw_Di_Resolver} [spec.namespaceResolver] custom resolver to map module names to file paths
     */
    constructor(spec = {}) {
        /** @type {TeqFw_Di_Resolver} Modules loader (given in constructor or empty one). */
        const _resolver = spec.namespaceResolver || new Resolver();
        /**
         * Storage for constructors (named or default exports of ES modules) to create new objects.
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

        // set default instance of the DI container (as named object and as ES module's singleton)
        _singletons.set('container', this);
        _singletons.set('TeqFw_Di_Container', this);

        /**
         * Internal function to get/create object|function|class|module by given `id`.
         *
         * @param {string} mainId main object ID (named singleton, module, new object, default export singleton)
         * @param {Object.<string, boolean>} uplineDeps dependencies registry to prevent circular loop.
         * @return {Promise<Object>}
         */
        async function getObject(mainId, uplineDeps) {

            // DEFINE INNER FUNCTIONS
            /**
             * Add 'spec' proxy as fnConstruct argument and create new object and all deps.
             *
             * @param {Function|Object} fnConstruct
             * @return {Promise<Object>} created object
             * @private
             */
            function _useConstructor(fnConstruct) {
                // This promise will be resolved after all dependencies in spec proxy will be created.
                return new Promise(function (resolve, reject) {
                    // MAIN FUNCTIONALITY
                    const constructorType = typeof fnConstruct;
                    if (constructorType === 'object') {
                        // `constructor` is an object, clone this fnConstruct and return cloned object
                        const objClone = Object.assign({}, fnConstruct);
                        resolve(objClone);
                    } else if (constructorType === 'function') {
                        // `constructor` is simple function or class

                        /**
                         * Create new function to resolve all deps and to create requested object.
                         * This function will be called from spec proxy for every failed dependency.
                         */
                        const fnCreate = function () {
                            try {
                                // https://stackoverflow.com/a/29094018/4073821
                                const proto = Object.getOwnPropertyDescriptor(constructor, 'prototype');
                                const isClass = proto && !proto.writable;
                                const instNew = (isClass) ? new fnConstruct(spec) : fnConstruct(spec);
                                // code line below will be inaccessible until all deps will be created in `spec`
                                // SpecProxy.EXCEPTION_TO_STEALTH will be thrown for every missed dep in `spec`
                                resolve(instNew);
                            } catch (e) {
                                // stealth constructor exceptions to prevent execution interrupt on missed dependency
                                // SpecProxy rejects `_useConstructor` promise on any error
                            }
                        };
                        // create spec proxy to analyze dependencies of the constructing object in current scope
                        const spec = new SpecProxy(mainId, uplineDeps, _singletons, fnCreate, getObject, reject);
                        // try to create object and start chain of deps resolving in SpecProxy
                        fnCreate();
                    } else {
                        throw new Error('Unexpected type of loaded module.');
                    }
                    // `resolve` for this promise is called from fnCreate
                    // (fnCreate is recalled from spec proxy on every dep failure)
                });
            }

            /**
             * Lookup for requested dependency in internal storages or create new one if dependency constructor
             * is available.
             * @param {TeqFw_Di_Api_ParsedId} parsed
             * @return {*}
             */
            async function getFromStorages(parsed) {
                let result;
                // get required instance from own registries or load sources and create new one
                if ((parsed.isSingleton) && (_singletons.get(parsed.mapKey) !== undefined)) {
                    // singleton was created before, just return it
                    result = _singletons.get(parsed.mapKey);
                } else if ((parsed.isModule) && (_modules.get(parsed.mapKey) !== undefined)) {
                    // module with required `id` was loaded before, just return it
                    result = _modules.get(parsed.mapKey);
                } else if ((parsed.isFactory) && (_constructors.get(parsed.mapKey) !== undefined)) {
                    // default export constructor with required `id` was loaded before, create & return new object
                    const construct = _constructors.get(parsed.mapKey);
                    result = await _useConstructor(construct);
                }
                return result;
            }

            // MAIN FUNCTIONALITY
            let result;
            /** @type {TeqFw_Di_Api_ParsedId} */
            const parsed = $parser.parse(mainId);
            // try to find requested dependency in local storages
            result = await getFromStorages(parsed);
            // if not found then try to load sources and create new one
            if (result === undefined) {
                // Sources for requested dependency are not imported before.
                // Get path to sources by module name then load ES module.
                const sourceFile = _resolver.getSourceById(parsed.nameModule);
                const module = await import(sourceFile);
                // save imported module in container storage
                _modules.set(parsed.mapKey, module);
                if (parsed.isModule) {
                    result = module;
                } else {
                    // use default export of loaded module as constructor
                    const construct = module.default;
                    _constructors.set(parsed.mapKey, construct);
                    const object = await _useConstructor(construct);
                    // save singleton object in container storage
                    if (parsed.isSingleton) _singletons.set(parsed.mapKey, object);
                    result = object;
                }
            }
            return result;
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
                _singletons.delete(parsed.mapKey);
            } else if (parsed.isFactory) {
                _constructors.delete(parsed.mapKey);
            } else if (parsed.isModule) {
                _modules.delete(parsed.mapKey);
            }
        };

        /**
         * Get/create object|function|class|module by dependency ID (wrapper for internal function).
         *
         * @param {string} depId 'namedDep', 'Vendor_Module', 'New_Object_From_Default$', 'Singleton_From_Default$$'
         * @return {Promise<Object>}
         */
        this.get = async function (depId) {
            return await getObject(depId, {});
        };

        /**
         * @return {TeqFw_Di_Resolver}
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
                return _singletons.has(parsed.mapKey);
            } else if (parsed.isFactory) {
                return _constructors.has(parsed.mapKey);
            } else if (parsed.isModule) {
                return _modules.has(parsed.mapKey);
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
                _singletons.set(parsed.mapKey, object);
            } else if (parsed.isFactory) {
                _constructors.set(parsed.mapKey, object);
            } else if (parsed.isModule) {
                _modules.set(parsed.mapKey, object);
            }
        };
    }
}
