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
        let composer = new Composer();
        let parser = new Parser();
        /**
         * Registry for loaded es6 modules.
         * @type {Object<string, Module>}
         */
        const regModules = {};
        /**
         * Registry to store singletons.
         * @type {Object<string, *>}
         */
        const regSingles = {};
        let resolver = new Resolver();


        // INSTANCE METHODS
        this.get = async function (objectKey) {
            // return container itself if requested
            if (objectKey === Defs.KEY_CONTAINER) return regSingles[Defs.KEY_CONTAINER];
            // parse the `objectKey` and get the structured DTO
            const key = parser.parse(objectKey);
            // TODO: key preprocessing here (replacements)
            // return existing singleton
            if (key.life === Defs.LIFE_SINGLETON) {
                const singleId = getSingletonId(key);
                if (regSingles[singleId])
                    return regSingles[singleId];
            }
            // load es6 module if not loaded before
            if (!regModules[key.moduleName]) {
                // convert module name to the path to es6-module file with a sources
                const path = resolver.resolve(key.moduleName);
                regModules[key.moduleName] = await import(path);
            }
            // create object using the composer
            const res = await composer.create(key, regModules[key.moduleName], this);
            // TODO: wrappers should be here
            if (key.life === Defs.LIFE_SINGLETON) {
                const singleId = getSingletonId(key);
                regSingles[singleId] = res;
            }
            return res;
        };

        this.getParser = () => parser;

        this.getResolver = () => resolver;

        this.setParser = (data) => parser = data;

        this.setResolver = (data) => resolver = data;

        // MAIN
        regSingles[Defs.KEY_CONTAINER] = this;
    }
};