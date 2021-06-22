// MODULE'S IMPORT
/* don't import ES-modules with nodejs dependencies (will not work in browsers) */
import IdParser from './IdParser.mjs';
import ModuleLoader from './ModuleLoader.mjs';
import ParsedId from './Api/ParsedId.mjs';
import ResolveDetails from './Api/ResolveDetails.mjs';
import Resolver from './Resolver.mjs';
import SpecProxy from './SpecProxy.mjs';

// MODULE'S VARS
const $parser = new IdParser();

// MODULE'S CLASSES
/**
 * Dependency Injection container.
 */
class TeqFw_Di_Container {
    /**
     * @param {Object} [spec]
     * @param {TeqFw_Di_Resolver} [spec.namespaceResolver] custom resolver to map module names to file paths
     */
    constructor(spec = {}) {
        /** @type {TeqFw_Di_Resolver} Modules loader (given in constructor or empty one). */
        const _resolver = spec.namespaceResolver || new Resolver();
        /** @type {TeqFw_Di_ModuleLoader} */
        const _moduleLoader = new ModuleLoader(_resolver);
        /**
         * Storage for constructors (named or default exports of ES modules) to create new objects.
         * Module name ('Vendor_Project_Module') is a key in the map.
         */
        const _factories = new Map();
        /**
         * Storage for created instances (singletons).
         * Module name ('Vendor_Project_Module') or singleton name ('dbConnection') is a key in the map.
         */
        const _singletons = new Map();

        // set default instance of the DI container
        _singletons.set('container', this); // as singleton
        _singletons.set('TeqFw_Di_Container', this); // as singleton of the class

        /**
         * Internal function to get/create object|function|class|module by given `id`.
         *
         * @param {string} mainId main object ID (singleton, module, new object, default export singleton)
         * @param {Object.<string, boolean>} uplineDeps dependencies registry to prevent circular loop.
         * @returns {Promise<*>}
         */
        async function getObject(mainId, uplineDeps) {

            // DEFINE INNER FUNCTIONS
            /**
             * Add 'spec' proxy as fnConstruct argument and create new object and all deps.
             *
             * @param {Function|Object} fnConstruct
             * @returns {Promise<*>} created object
             * @private
             */
            function _useFactory(fnConstruct) {
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
                                const proto = Object.getOwnPropertyDescriptor(fnConstruct, 'prototype');
                                const isClass = proto && !proto.writable;
                                const instNew = (isClass) ? new fnConstruct(spec) : fnConstruct(spec);
                                // code line below will be inaccessible until all deps will be created in `spec`
                                // SpecProxy.EXCEPTION_TO_STEALTH will be thrown for every missed dep in `spec`
                                if (instNew instanceof Promise) {
                                    instNew
                                        .then((asyncInst) => {
                                                resolve(asyncInst)
                                            }
                                        ).catch((e) => {
                                            // SpecProxy rejects `_useFactory` promise on any error
                                            if (e === SpecProxy.EXCEPTION_TO_STEALTH) {
                                                // stealth constructor exceptions to prevent execution interrupt on missed dependency
                                            } else {
                                                throw e;
                                            }
                                        }
                                    );
                                } else {
                                    resolve(instNew);
                                }
                            } catch (e) {
                                // SpecProxy rejects `_useFactory` promise on any error
                                if (e === SpecProxy.EXCEPTION_TO_STEALTH) {
                                    // stealth constructor exceptions to prevent execution interrupt on missed dependency
                                } else {
                                    throw e;
                                }
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
             * @returns {*}
             */
            async function getFromStorages(parsed) {
                let result;
                // get required instance from own registries or load sources and create new one
                if ((parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) && (_singletons.get(parsed.mapKey) !== undefined)) {
                    // singleton was created before, just return it
                    result = _singletons.get(parsed.mapKey);
                } else if ((parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) && (_factories.get(parsed.mapKey) !== undefined)) {
                    // factory with required `id` was loaded before, create & return new object
                    const factory = _factories.get(parsed.mapKey);
                    result = await _useFactory(factory);
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
                // Sources for requested dependency are not imported or not set manually before.
                // Get ES6 module from loader.
                const moduleId = (parsed.typeId === ParsedId.TYPE_ID_FILEPATH) ?
                    parsed.namePackage + '!' + parsed.nameModule :
                    parsed.nameModule;
                const module = await _moduleLoader.getModule(moduleId);
                if (parsed.typeTarget === ParsedId.TYPE_TARGET_MODULE) {
                    // result as ES6 module
                    result = module;
                } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_EXPORT) {
                    // result as ES6 module export
                    result = module[parsed.nameExport];
                } else {
                    // we need use module export as factory for new object or singleton for the first time
                    const factory = module[parsed.nameExport];
                    _factories.set(parsed.mapKey, factory);
                    const object = await _useFactory(factory);
                    // save singleton object in container storage
                    if (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) _singletons.set(parsed.mapKey, object);
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
            let parsed = $parser.parseLogicalNsId(namespace);
            if (!parsed) parsed = $parser.parseFilepathId(namespace);
            if (
                (parsed.typeTarget !== ParsedId.TYPE_TARGET_MODULE) &&
                (parsed.typeTarget !== ParsedId.TYPE_TARGET_PACKAGE)
            )
                throw new Error('Namespace cannot contain \'$\' symbol.');
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
            if (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) {
                _singletons.delete(parsed.mapKey);
            } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) {
                _factories.delete(parsed.mapKey);
            } else {
                const errMsg = `Dependency ID is not manually inserted factory or singleton: ${depId}. `
                    + 'See \'https://github.com/teqfw/di/blob/master/docs/identifiers.md\'.';
                throw new Error(errMsg);
            }
        };

        /**
         * Get/create object|function|class|module by dependency ID (wrapper for internal function).
         *
         * @param {string} depId 'namedDep', 'Vendor_Module', 'New_Object_From_Default$', 'Singleton_From_Default$$'
         * @param {String} context ID of the main object for whom container retrieves the dependency (TODO)
         * @returns {Promise<*>}
         *
         * TODO: we can use context to get significant info from requester (requester depId or prepared deps
         * TODO: /bootstrap path, for example/).
         */
        this.get = async function (depId, context = null) {
            return await getObject(depId, {});
        };

        /**
         * @returns {TeqFw_Di_Resolver}
         */
        this.getNsResolver = function () {
            return _resolver;
        };
        /**
         * Check existence of created instance or imported data in container.
         *
         * @param {string} depId
         * @returns {boolean}
         */
        this.has = function (depId) {
            const parsed = $parser.parse(depId);
            if (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) {
                return _singletons.has(parsed.mapKey);
            } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) {
                return _factories.has(parsed.mapKey);
            } else {
                const errMsg = `Dependency ID is not manually inserted factory or singleton: ${depId}. `
                    + 'See \'https://github.com/teqfw/di/blob/master/docs/identifiers.md\'.';
                throw new Error(errMsg);
            }
        };

        /**
         * Get list of contained dependencies (created instances and loaded modules).
         * @returns {{constructors: string[], singletons: string[], modules: string[]}}
         */
        this.list = function () {
            const singletons = Array.from(_singletons.keys()).sort();
            const constructors = Array.from(_factories.keys()).sort();
            return {singletons, constructors};
        };
        /**
         * Place object into the container. Replace existing instance with the same ID.
         *
         * 'object' should correlate with 'depId':
         *  - singleton ('namedDep'): any object will be stored as singleton;
         *  - ES module ('Vendor_Module'): will be stored as ES module;
         *  - constructor ('New_Object_From_Default$'): will be stored as object constructor with key 'New_Object_From_Default';
         *  - instance ('Singleton_From_Default$$'): will be stored as singleton with key 'Singleton_From_Default';
         *
         * @param {string} depId 'namedDep', 'Vendor_Module', 'New_Object_From_Default$', 'Singleton_From_Default$$'.
         * @param {Object} object
         */
        this.set = function (depId, object) {
            const parsed = $parser.parse(depId);
            if (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) {
                _singletons.set(parsed.mapKey, object);
            } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) {
                _factories.set(parsed.mapKey, object);
            } else {
                const errMsg = `Dependency ID is not valid for factory or singleton: ${depId}. `
                    + 'See \'https://github.com/teqfw/di/blob/master/docs/identifiers.md\'.';
                throw new Error(errMsg);
            }
        };
    }
}

// MODULE'S EXPORT
export {
    TeqFw_Di_Container as default
}
