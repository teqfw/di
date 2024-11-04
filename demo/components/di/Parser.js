/**
 * This function converts `objectKey` string into DTO.
 */
import ObjectKey from './Dto/ObjectKey.mjs';

// VARS
const KEY = /([a-zA-Z\d.]+)(\?(mod|inst|(export=([a-zA-Z\d]+)(&(inst))?)))?/s;

// MAIN
/**
 * General format of the `objectKey` for this demo:
 * `package.Module[?(export=name[&inst])|(mod)]`
 *
 * Samples:
 *  - `package.Module`: uses the default export as a Factory to create the singleton object (the most commonly used pattern);
 *  - `package.Module?mod`: return ES6 module itself;
 *  - `package.Module?inst`: uses the default export as a Factory to create the instance;
 *  - `package.Module?export=name&inst`: uses the named export as a Factory to create the instance;
 *
 * @param {string} objectKey
 * @returns {Di.Dto.ObjectKey}
 */
export default function (objectKey) {
    const res = new ObjectKey();
    const parts = KEY.exec(objectKey);
    res.moduleName = parts[1];
    if (parts[3] === 'mod') {
        // do nothing
    } else if (parts[3] === 'inst') {
        res.exportName = 'default';
        res.isFactory = true;
        res.isSingleton = false;
    } else if (parts[3] === undefined) {
        res.exportName = 'default';
        res.isFactory = true;
        res.isSingleton = true;
    } else {
        res.exportName = parts[5];
        res.isFactory = true;
        res.isSingleton = parts[7] !== 'inst';
    }
    return res;
};