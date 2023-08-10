/**
 * This is a DTO that represents the structure of `objectKey` identifiers used in this demo container.
 * @namespace Di.Dto
 * @memberOf Di.Dto
 */
export default class ObjectKey {
    /**
     * The name of an export of the module.
     * @type {string}
     */
    exportName;
    /**
     * Use the export as Factory or return as-is.
     * @type {boolean}
     */
    isFactory;
    /**
     * Use as Factory or return as-is.
     * @type {boolean}
     */
    isSingleton;
    /**
     * The code for ES6 module that can be converted to the path to this es6 module.
     * @type {string}
     */
    moduleName;
}