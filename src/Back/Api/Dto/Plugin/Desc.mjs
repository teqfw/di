/**
 * DTO to represent plugin descriptor (teqfw.json) structure
 * that is related to 'di' node:
 */
// MODULE'S VARS
const NS = 'TeqFw_Di_Back_Api_Dto_Plugin_Desc';

// MODULE'S CLASSES
export default class TeqFw_Di_Back_Api_Dto_Plugin_Desc {
    /** @type {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload} */
    autoload;
}

// attributes names to use as aliases in queries to object props
TeqFw_Di_Back_Api_Dto_Plugin_Desc.AUTOLOAD = 'autoload';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Di_Back_Api_Dto_Plugin_Desc
 */
export class Factory {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {typeof TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload} */
        const DAutoload = spec['TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload#'];
        /** @type {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.Factory} */
        const fAutoload = spec['TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload#Factory$'];

        /**
         * @param {TeqFw_Di_Back_Api_Dto_Plugin_Desc|null} data
         * @return {TeqFw_Di_Back_Api_Dto_Plugin_Desc}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Di_Back_Api_Dto_Plugin_Desc();
            res.autoload = (data?.autoload instanceof DAutoload) ? data.autoload : fAutoload.create(data?.autoload);
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Di_Back_Api_Dto_Plugin_Desc);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
