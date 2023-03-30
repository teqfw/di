/**
 * DTO to represent plugin descriptor (teqfw.json) structure
 * that is related to 'di/autoload' node:
 */
// MODULE'S VARS
const NS = 'TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload';

// MODULE'S CLASSES
export default class TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload {
    /** @type {string} extension for files in the namespace */
    ext;
    /** @type {boolean} absolute or relative mapping is used in namespace */
    isAbsolute;
    /** @type {string} namespace ('Vnd_Project_Plugin') */
    ns;
    /** @type {string} path to the root of the namespace relative to npm package root ('./src') */
    path;
}

// attributes names to use as aliases in queries to object props
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.EXT = 'ext';
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.IS_ABSOLUTE = 'isAbsolute';
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.NS = 'ns';
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.PATH = 'path';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload
 */
export class Factory {
    static namespace = NS;

    constructor() {
        /**
         * @param {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload|null} data
         * @return {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload();
            res.ext = data?.ext ?? 'mjs';
            res.isAbsolute = data?.isAbsolute ?? false;
            res.ns = data?.ns;
            res.path = data?.path;
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload);
