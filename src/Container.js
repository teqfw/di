/**
 * The Object Container (composition root).
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

// MAIN
/**
 * @implements TeqFw_Di_Api_Container
 */
export default class TeqFw_Di_Container {

    constructor() {
        // VARS
        let _composer = new Composer();
        let _debug = false;
        let _parser = new Parser();
        let _preProcessor = new PreProcessor();
        let _postProcessor = new PostProcessor();

        /**
         * Registry for paths for loaded es6 modules.
         *
         * @type {Object<string, string>}
         */
        const _regPaths = {};
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

        this.get = async function (runtimeDepId, stack = []) {
            return this.compose(runtimeDepId, stack);
        };

        /**
         * This method is 'private' for the npm package. It is used in the Composer only.
         *
         * @param {string} depId runtime dependency ID
         * @param {string[]} stack set of the depId to detect circular dependencies
         * @returns {Promise<*>}
         */
        this.compose = async function (depId, stack = []) {
            log(`Object '${depId}' is requested.`);
            // return container itself if requested
            if (
                (depId === Defs.ID) ||
                (depId === Defs.ID_FQN)
            ) {
                log(`Container itself is returned.`);
                return _regSingles[Defs.ID];
            }
            // parse the `objectKey` and get the structured DTO
            const parsed = _parser.parse(depId);
            // modify original key according to some rules (replacements, etc.)
            const key = _preProcessor.modify(parsed, stack);
            // return existing singleton
            if (key.life === Defs.LIFE_S) {
                const singleId = getSingletonId(key);
                if (_regSingles[singleId]) {
                    log(`Existing singleton '${singleId}' is returned.`);
                    return _regSingles[singleId];
                }
            }
            // resolve path to es6 module if not resolved before
            if (!_regPaths[key.moduleName]) {
                log(`ES6 module '${key.moduleName}' is not resolved yet`);
                // convert module name to the path to es6-module file with a sources
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
            // create object using the composer then modify it in post-processor
            let res = await _composer.create(key, module, stack, this);
            res = await _postProcessor.modify(res, key, stack);
            log(`Object '${depId}' is created.`);

            // save singletons
            if (key.life === Defs.LIFE_S) {
                const singleId = getSingletonId(key);
                _regSingles[singleId] = res;
                log(`Object '${depId}' is saved as singleton.`);
            }
            return res;
        };

        this.getParser = () => _parser;

        this.getPreProcessor = () => _preProcessor;

        this.getPostProcessor = () => _postProcessor;
        this.getResolver = () => _resolver;

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