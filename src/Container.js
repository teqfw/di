/**
 * The Object Container (composition root).
 */
import Composer from './Composer.js';
import Defs from './Defs.js';
import Parser from './Parser.js';
import Resolver from './Resolver.js';

// VARS

// FUNCS
/**
 * ID to store singletons in the internal registry.
 * @param {TeqFw_Di_Api_ObjectKey} key
 * @return {string}
 */
function getSingletonId(key) {
    return `${key.moduleName}#${key.exportName}`;
}

// MAIN
export default class TeqFw_Di_Container {

    constructor() {
        // VARS
        let _composer = new Composer();
        let _debug = false;
        let _parser = new Parser();
        /**
         * Registry for loaded es6 modules.
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
        function log(msg) {
            if (_debug) console.log(msg);
        }


        // INSTANCE METHODS

        this.get = async function (objectKey) {
            log(`Object '${objectKey}' is requested.`);
            // return container itself if requested
            if (objectKey === Defs.KEY_CONTAINER) {
                log(`Container itself is returned.`);
                return _regSingles[Defs.KEY_CONTAINER];
            }
            // parse the `objectKey` and get the structured DTO
            const key = _parser.parse(objectKey);
            // TODO: key preprocessing here (replacements)
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
                _regModules[key.moduleName] = await import(path);
                log(`ES6 module '${key.moduleName}' is loaded from '${path}'.`);

            }
            // create object using the composer
            const res = await _composer.create(key, _regModules[key.moduleName], this);
            log(`Object '${objectKey}' is created.`);
            // TODO: wrappers should be here
            if (key.life === Defs.LIFE_SINGLETON) {
                const singleId = getSingletonId(key);
                _regSingles[singleId] = res;
                log(`Object '${objectKey}' is saved as singleton.`);
            }
            return res;
        };

        this.getParser = () => _parser;

        this.getResolver = () => _resolver;

        this.setDebug = function (data) {
            _debug = data;
            _composer.setDebug(data);
        };

        this.setParser = (data) => _parser = data;

        this.setResolver = (data) => _resolver = data;

        // MAIN
        _regSingles[Defs.KEY_CONTAINER] = this;
    }
};