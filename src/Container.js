/**
 * The Object Container (composition root).
 * @namespace TeqFw_Di_Container
 */
import Composer from './Container/Composer.js';
import Defs from './Defs.js';
import Parser from './Container/Parser.js';
import PreProcessor from './Container/PreProcessor.js';
import NewReplace from './Container/PreProcessor/Replace.js';
import Resolver from './Container/Resolver.js';

// VARS

// FUNCS
/**
 * ID to store singletons in the internal registry.
 * @param {TeqFw_Di_DepId} key
 * @return {string}
 */
function getSingletonId(key) {
    return `${key.moduleName}#${key.exportName}`;
}

// MAIN
/**
 * @implements TeqFw_Di_Api_Container
 */
export default class TeqFw_Di_Container {

    constructor() {
        // VARS
        let _composer = new Composer();
        let _debug = false;
        /** @type {TeqFw_Di_Api_Container_Parser} */
        let _parser = new Parser();
        let _preProcessor = new PreProcessor();
        _preProcessor.addHandler(NewReplace()); // create new instance of the replacement handler

        /**
         * Registry for loaded es6 modules.
         *
         * TODO: should we have a registry for es6 modules? Perhaps we should cache just resolved paths to the modules.
         *
         * @type {Object<string, Module>}
         */
        const _regModules = {};
        /**
         * Registry to store singletons.
         * @type {Object<string, *>}
         */
        const _regSingles = {};
        let _resolver = new Resolver();

        // FUNCS

        function log() {
            if (_debug) console.log(...arguments);
        }

        // INSTANCE METHODS

        this.get = async function (runtimeDepId) {
            return this.getChained(runtimeDepId, []);
        };

        /**
         * This method is 'private' for the package.
         *
         * @param {string} depId runtime dependency ID
         * @param {string[]} stack set of the depId to detect circular dependencies
         * @return {Promise<*>}
         */
        this.getChained = async function (depId, stack = []) {
            log(`Object '${depId}' is requested.`);
            // return container itself if requested
            if (
                (depId === Defs.KEY_CONTAINER) ||
                (depId === Defs.KEY_CONTAINER_NS)
            ) {
                log(`Container itself is returned.`);
                return _regSingles[Defs.KEY_CONTAINER];
            }
            // parse the `objectKey` and get the structured DTO
            const parsed = _parser.parse(depId);
            // modify original key according to some rules (replacements, etc.)
            const key = _preProcessor.process(parsed);
            // return existing singleton
            if (key.life === Defs.LIFE_SINGLETON) {
                const singleId = getSingletonId(key);
                if (_regSingles[singleId]) {
                    log(`Existing singleton '${singleId}' is returned.`);
                    return _regSingles[singleId];
                }
            }
            // load es6 module if not loaded before
            if (!_regModules[key.moduleName]) {
                log(`ES6 module '${key.moduleName}' is not loaded yet`);
                // convert module name to the path to es6-module file with a sources
                const path = _resolver.resolve(key.moduleName);
                try {
                    _regModules[key.moduleName] = await import(path);
                    log(`ES6 module '${key.moduleName}' is loaded from '${path}'.`);
                } catch (e) {
                    console.error(
                        e?.message,
                        `Object key: "${depId}".`,
                        `Path: "${path}".`,
                        `Stack: ${JSON.stringify(stack)}`
                    );
                    throw e;
                }

            }
            // create object using the composer
            let res = await _composer.create(key, _regModules[key.moduleName], stack, this);
            log(`Object '${depId}' is created.`);

            // TODO: refactor this code to use wrappers w/o hardcode
            if (key.wrappers.includes(Defs.WRAP_PROXY)) {
                const me = this;
                res = new Proxy({dep: undefined, objectKey: depId}, {
                    get: async function (base, name) {
                        if (name === 'create') base.dep = await me.get(base.objectKey);
                        return base.dep;
                    }
                });
            }

            if (key.life === Defs.LIFE_SINGLETON) {
                const singleId = getSingletonId(key);
                _regSingles[singleId] = res;
                log(`Object '${depId}' is saved as singleton.`);
            }
            return res;
        };

        this.getParser = () => _parser;

        this.getPreProcessor = () => _preProcessor
        ;
        this.getResolver = () => _resolver;

        this.setDebug = function (data) {
            _debug = data;
            _composer.setDebug(data);
        };

        this.setParser = (data) => _parser = data;

        this.setPreProcessor = (data) => _preProcessor = data;

        this.setResolver = (data) => _resolver = data;

        // MAIN
        _regSingles[Defs.KEY_CONTAINER] = this;
    }
};