/**
 * DTO to represent plugin descriptor (teqfw.json) structure
 * that is related to 'di/replace' node:
 */
// MODULE'S IMPORT
import AREA from '../../../Enum/Area.mjs';
// MODULE'S VARS
const NS = 'TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace';

// MODULE'S CLASSES
export default class TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace {
    /**
     * App area to use replacement ('back', 'front', 'shared').
     * @type {string}
     */
    area;
    /**
     * Logical name for ES6 module with replacement code (Vnd_Plug_Implementation).
     * @type {string}
     */
    ns;
}

// attributes names to use as aliases in queries to object props
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace.AREA = 'area';
TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace.NS = 'ns';

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
            res.ns = data?.ns;
            res.area = ((data?.area === AREA.BACK) || (data?.area === AREA.FRONT))
                ? data.area : AREA.SHARED;
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
