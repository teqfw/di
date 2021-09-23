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
    /** @type {Object<string, TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace>} */
    replace;
}

// attributes names to use as aliases in queries to object props
TeqFw_Di_Back_Api_Dto_Plugin_Desc.AUTOLOAD = 'autoload';
TeqFw_Di_Back_Api_Dto_Plugin_Desc.REPLACE = 'replace';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Di_Back_Api_Dto_Plugin_Desc
 */
export class Factory {
    constructor(spec) {
        /** @type {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.Factory} */
        const fAutoload = spec['TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload#Factory$'];
        /** @type {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace.Factory} */
        const fReplace = spec['TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Replace#Factory$'];

        /**
         * @param {TeqFw_Di_Back_Api_Dto_Plugin_Desc|null} data
         * @return {TeqFw_Di_Back_Api_Dto_Plugin_Desc}
         */
        this.create = function (data = null) {

            // DEFINE INNER FUNCTIONS
            function parseReplace(data) {
                const res = {};
                if (typeof data === 'object')
                    for (const ns of Object.keys(data))
                        res[ns] = fReplace.create(data[ns]);
                return res;
            }

            // MAIN FUNCTIONALITY
            const res = new TeqFw_Di_Back_Api_Dto_Plugin_Desc();
            res.autoload = fAutoload.create(data?.autoload);
            res.replace = parseReplace(data?.replace);
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Di_Back_Api_Dto_Plugin_Desc);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
