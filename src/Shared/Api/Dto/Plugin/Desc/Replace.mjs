/**
 * DTO to represent plugin descriptor (teqfw.json) structure
 * that is related to 'di/replace' node:
 */
// MODULE'S VARS
const NS = 'TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace';

// MODULE'S CLASSES
export default class TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace {
    /** @type {string} logical name for ES6 module with replacement code (Vnd_Plug_Implementation)  */
    alter;
    /** @type {string} logical name for original ES6 module (Vnd_Plug_Interface) */
    orig;
}

// attributes names to use as aliases in queries to object props
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace.ALTER = 'alter';
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace.ORIG = 'orig';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace|null} data
         * @return {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace();
            res.alter = data?.alter;
            res.orig = data?.orig;
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
