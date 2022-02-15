/**
 * Dependency Injection container for Tequila Framework.
 *
 * @namespace TeqFw_Di_Shared_Container
 */
// MODULE'S IMPORT
/* don't import ES-modules with nodejs dependencies (will not work in browsers) */
import DAutoload from './Api/Dto/Plugin/Desc/Autoload.mjs';
import IdParser from './IdParser.mjs';
import ModuleLoader from './ModuleLoader.mjs';
import ParsedId from './IdParser/Dto.mjs';
import Resolver from './Resolver.mjs';
import SpecProxy from './SpecProxy.mjs';

// MODULE'S VARS
const $parser = new IdParser();

// MODULE'S CLASSES
/**
 *
 */
export default class TeqFw_Di_Shared_Container {
    /**
     * @param {Object} [spec]
     * @param {TeqFw_Di_Shared_Resolver} [spec.namespaceResolver] custom resolver to map module names to file paths
     */
    constructor(spec = {}) {
        /** @type {TeqFw_Di_Shared_Resolver} Modules loader (given in constructor or empty one). */
        const resolver = spec.namespaceResolver || new Resolver();
        /** @type {TeqFw_Di_Shared_ModuleLoader} */
        const moduleLoader = new ModuleLoader(resolver);
        /**
         * Storage for constructors (named or default exports of ES modules) to create new objects.
         * Module name ('Vendor_Project_Module') is a key in the map.
         */
        const factories = new Map();
        /**
         * Storage for created instances (singletons).
         * Module name ('Vendor_Project_Module') or singleton name ('dbConnection') is a key in the map.
         */
        const singletons = new Map();
        /**
         * Storage for ES modules replacements (interface => implementation).
         * Sample: {['Vnd_Plug_Interface']:'Vnd_Plug_Impl', ...}
         * @type {Object<string, string>}
         */
        const replacements = {};

        // set default instance of the DI container
        singletons.set('container', this); // as singleton
        singletons.set('TeqFw_Di_Shared_Container', this); // as singleton of the class

        // pin itself for nested functions
        const me = this;

        /**
         * Internal function to get/create object|function|class|module by given `id`.
         *
         * @param {string} mainId main object ID (singleton, module, new object, default export singleton)
         * @param {string[]} uplineDeps dependencies registry to prevent circular loop.
         * @returns {Promise<*>}
         */
        async function getObject(mainId, uplineDeps) {

            // ENCLOSED FUNCS
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
                    // MAIN
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
                        const spec = new SpecProxy(mainId, uplineDeps, singletons, fnCreate, getObject, reject);
                        // try to create object and start chain of deps resolving in SpecProxy
                        fnCreate();
                    } else {
                        throw new Error(`Unexpected type of factory function for '${mainId}'.`);
                    }
                    // `resolve` for this promise is called from fnCreate
                    // (fnCreate is recalled from spec proxy on every dep failure)
                });
            }

            /**
             * Lookup for requested dependency in internal storages or create new one if dependency constructor
             * is available.
             * @param {TeqFw_Di_Shared_IdParser_Dto} parsed
             * @returns {*}
             */
            async function getFromStorages(parsed) {
                let result;
                // get required instance from own registries or load sources and create new one
                if ((parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) && (singletons.get(parsed.mapKey) !== undefined)) {
                    // singleton was created before, just return it
                    result = singletons.get(parsed.mapKey);
                } else if ((parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) && (factories.get(parsed.mapKey) !== undefined)) {
                    // factory with required `id` was loaded before, create & return new object
                    const factory = factories.get(parsed.mapKey);
                    result = await _useFactory(factory);
                }
                return result;
            }

            /**
             * Replace original ES6 module name (interface) with it's alternative (implementation).
             * @param {string} orig
             * @return {string}
             */
            function checkReplacements(orig) {
                while (replacements[orig]) orig = replacements[orig];
                return orig;
            }

            // MAIN
            let result;
            /** @type {TeqFw_Di_Shared_IdParser_Dto} */
            const parsed = $parser.parse(mainId);
            parsed.nameModule = checkReplacements(parsed.nameModule);
            // try to find requested dependency in local storages
            if (!parsed.isProxy) result = await getFromStorages(parsed);
            // if not found then try to load sources and create new one
            if (result === undefined) {
                // Sources for requested dependency are not imported or not set manually before.
                // Get ES6 module from loader.
                const moduleId = (parsed.typeId === ParsedId.TYPE_ID_FILEPATH) ?
                    parsed.namePackage + '!' + parsed.nameModule :
                    parsed.nameModule;
                const module = await moduleLoader.getModule(moduleId);
                if (parsed.typeTarget === ParsedId.TYPE_TARGET_MODULE) {
                    // result as ES6 module
                    result = module;
                } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_EXPORT) {
                    // result as ES6 module export
                    result = module[parsed.nameExport];
                } else {
                    // create new object (singleton or instance) using factory
                    if (parsed.isProxy) {
                        // we need to create proxy to resolve deps for the object later
                        const depId = parsed.orig.replace(/@/gi, '$');
                        result = new Proxy({dep: undefined, depId}, {
                            get: async function (base, name) {
                                if (name === 'create') base.dep = await me.get(base.depId);
                                return base.dep;
                            }
                        });
                    } else {
                        // we need use module export as factory for new object or singleton for the first time
                        const factory = module[parsed.nameExport];
                        factories.set(parsed.mapKey, factory);
                        const object = await _useFactory(factory);
                        // save singleton object in container storage
                        if (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) singletons.set(parsed.mapKey, object);
                        result = object;
                    }
                }
            }
            return result;
        }

        /**
         * Add replacement for ES6 modules.
         *
         * @param {string} orig ('Vnd_Plug_Interface')
         * @param {string} alter ('Vnd_Plug_Impl')
         */
        this.addModuleReplacement = function (orig, alter) {
            replacements[orig] = alter;
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
            const details = new DAutoload();
            Object.assign(details, {ns: namespace, path, ext, isAbsolute: is_absolute});
            resolver.addNamespaceRoot(details);
        };

        /**
         * Delete stored instance or import result (factory function or object) by `id` (if exist).
         *
         * @param {string} depId
         */
        this.delete = function (depId) {
            const parsed = $parser.parse(depId);
            if (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) {
                singletons.delete(parsed.mapKey);
            } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) {
                factories.delete(parsed.mapKey);
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
            return await getObject(depId, []);
        };

        /**
         * @returns {TeqFw_Di_Shared_Resolver}
         */
        this.getNsResolver = function () {
            return resolver;
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
                return singletons.has(parsed.mapKey);
            } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) {
                return factories.has(parsed.mapKey);
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
            const sItems = Array.from(singletons.keys()).sort();
            const fItems = Array.from(factories.keys()).sort();
            return {singletons: sItems, constructors: fItems};
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
                singletons.set(parsed.mapKey, object);
            } else if (parsed.typeTarget === ParsedId.TYPE_TARGET_FACTORY) {
                factories.set(parsed.mapKey, object);
            } else {
                const errMsg = `Dependency ID is not valid for factory or singleton: ${depId}. `
                    + 'See \'https://github.com/teqfw/di/blob/master/docs/identifiers.md\'.';
                throw new Error(errMsg);
            }
        };
    }
}
