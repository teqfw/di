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
    /**
     * Replacements for IDs:
     *  - {'Interface_Name': 'Impl_Name'}: replace es6-module 'Interface_Name' with 'Impl_Name' on injection;
     *  - {'front': {'Interface_Name': 'Impl_Name'}}: do the same for 'front' area only (should be implemented outside this plugin)
     * @type {Object<string, string>|Object<string, Object<string, string>>}
     */
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
    static namespace = NS;

    constructor(spec) {
        /** @type {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.Factory} */
        const fAutoload = spec['TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload#Factory$'];

        /**
         * @param {*} data
         * @return {TeqFw_Di_Back_Api_Dto_Plugin_Desc}
         */
        this.create = function (data = null) {

            // ENCLOSED FUNCS
            function parseReplace(data) {
                const res = {};
                if (typeof data === 'object')
                    for (const ns of Object.keys(data)) {
                        const node = data[ns];
                        if (typeof node === 'string') {
                            res[ns] = data[ns]; // {"interface": "impl"}
                        } else if (typeof node === 'object') {
                            res[ns] = {}; // {"interface": {"area": "impl"}}
                            for (const area of Object.keys(node))
                                if (typeof node[area] === 'string')
                                    res[ns][area] = node[area];
                        }
                    }
                return res;
            }

            // MAIN
            const res = new TeqFw_Di_Back_Api_Dto_Plugin_Desc();
            res.autoload = fAutoload.create(data?.autoload);
            res.replace = parseReplace(data?.replace);
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Di_Back_Api_Dto_Plugin_Desc);
