/**
 *
 */
import composer from './Composer.js';

// VARS
let creator;
/** @type {function(string):Di.Dto.ObjectKey} */
let parser;
let resolver;
/** @type {Object<string, Module>} */
const regModules = {};
/** @type {Object<string, *>} */
const regSingles = {};

// FUNCS
/**
 * ID to store singletons in the internal registry.
 * @param {Di.Dto.ObjectKey} key
 * @return {string}
 */
function getSingletonId(key) {
    return `${key.moduleName}#${key.exportName}`;
}

/**
 * @param {string} objectKey - identifier of the object to create and return
 * @return {Promise<*>}
 */
async function get(objectKey) {
    // parse the `objectKey` and get structured DTO
    const key = parser(objectKey);
    if (!regModules[key.moduleName])
        regModules[key.moduleName] = await resolver(key);
    const singleId = getSingletonId(key);
    if (key.isSingleton && regSingles[singleId]) return regSingles[singleId];
    const res = await composer.create(key, regModules[key.moduleName], this);
    if (key.isSingleton && !regSingles[singleId]) regSingles[singleId] = res;
    return res;
}


// MAIN
/**
 * @namespace Di.Container
 */
export default {
    get,
    setComposer: (data) => creator = data,
    setParser: (data) => parser = data,
    setResolver: (data) => resolver = data,
};