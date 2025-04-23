/**
 * The Object Container (composition root).
 * We can use static imports in the Container.
 *
 * @namespace TeqFw_Di_Container
 */
import Composer from './Container/A/Composer.js';
import Defs from './Defs.js';
import Parser from './Container/Parser.js';
import PreProcessor from './Container/PreProcessor.js';
import PostProcessor from './Container/PostProcessor.js';
import Resolver from './Container/Resolver.js';

// FUNCS
/**
 * ID to store singletons in the internal registry.
 * @param {TeqFw_Di_DepId} key
 * @returns {string}
 */
function getSingletonId(key) {
    return `${key.moduleName}#${key.exportName}`;
}

/**
 * Determines if an object, function, or primitive can be safely frozen.
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value can be safely frozen.
 */
function canBeFrozen(value) {
    // Primitives (except objects and functions) cannot be frozen
    if (value === null || typeof value !== 'object' && typeof value !== 'function') return false;
    // // ES modules cannot be frozen
    if (Object.prototype.toString.call(value) === '[object Module]') return false;
    // check is Object is already frozen
    return !Object.isFrozen(value);
}

// MAIN
export default class TeqFw_Di_Container {

    constructor() {
        // VARS
        let _composer = new Composer();
        let _debug = false;
        let _parser = new Parser();
        let _postProcessor = new PostProcessor();
        let _preProcessor = new PreProcessor();
        let _testMode = false;

        /**
         * Registry for paths for loaded es6 modules.
         *
         * @type {Object<string, string>}
         */
        const _regPaths = {};
        /**
         * Registry to store singletons.
         * @type {Object<string, object>}
         */
        const _regSingles = {};
        let _resolver = new Resolver();

        // FUNCS

        function log() {
            if (_debug) console.log(...arguments);
        }

        // INSTANCE METHODS

        this.get = async function (depId, stack = []) {
            log(`Object '${depId}' is requested.`);
            // return the container itself if requested
            if (
                (depId === Defs.ID) ||
                (depId === Defs.ID_FQN)
            ) {
                log('Container itself is returned.');
                return _regSingles[Defs.ID];
            }
            // parse the `objectKey` and get the structured DTO
            const parsed = _parser.parse(depId);
            // modify the original key according to some rules (replacements, etc.)
            const key = _preProcessor.modify(parsed, stack);
            // return existing singleton
            if (key.life === Defs.LS) {
                const singleId = getSingletonId(key);
                if (_regSingles[singleId]) {
                    log(`Existing singleton '${singleId}' is returned.`);
                    return _regSingles[singleId];
                }
            }
            // resolve a path to es6 module if not resolved before
            if (!_regPaths[key.moduleName]) {
                log(`ES6 module '${key.moduleName}' is not resolved yet`);
                // convert the module name to the path to an es6-module file with a source
                _regPaths[key.moduleName] = _resolver.resolve(key.moduleName);
            }

            // load es6 module
            let module;
            const path = _regPaths[key.moduleName];
            try {
                module = await import(path);
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
            // create an object using the composer, then modify it in post-processor
            let res = await _composer.create(key, module, stack, this);
            // freeze the result to prevent modifications
            if (canBeFrozen(res)) Object.freeze(res);
            res = await _postProcessor.modify(res, key, stack);
            log(`Object '${depId}' is created.`);

            // save singletons
            if (key.life === Defs.LS) {
                const singleId = getSingletonId(key);
                _regSingles[singleId] = res;
                log(`Object '${depId}' is saved as singleton.`);
            }
            return res;
        };

        /**
         * Enables test mode, allowing manual singleton registration.
         */
        this.enableTestMode = function () {
            _testMode = true;
            log('Test mode enabled');
        };

        this.getParser = () => _parser;

        this.getPreProcessor = () => _preProcessor;

        this.getPostProcessor = () => _postProcessor;

        this.getResolver = () => _resolver;

        /**
         * Registers a new singleton object in the Container.
         *
         * @param {string} depId - Dependency identifier. Must be a singleton identifier.
         * @param {object} obj - The object to register.
         */
        this.register = function (depId, obj) {
            if (!_testMode)
                throw new Error('Use enableTestMode() to allow it');

            if (!depId || !obj)
                throw new Error('Both params are required');

            const key = _parser.parse(depId);
            if (key.life !== Defs.LS)
                throw new Error(`Only singletons can be registered: '${depId}'`);

            const singleId = getSingletonId(key);
            if (_regSingles[singleId])
                throw new Error(`'${depId}' is already registered`);

            _regSingles[singleId] = obj;
            log(`'${depId}' is registered`);
        };

        this.setDebug = function (data) {
            _debug = data;
            _composer.setDebug(data);
        };

        this.setParser = (data) => _parser = data;

        this.setPreProcessor = (data) => _preProcessor = data;

        this.setPostProcessor = (data) => _postProcessor = data;

        this.setResolver = (data) => _resolver = data;

        // MAIN
        _regSingles[Defs.ID] = this;
    }
};