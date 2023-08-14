/**
 *
 */

// VARS


// MAIN
export default class TeqFw_Di_Resolver {

    constructor() {
        // VARS

        // INSTANCE METHODS

        /**
         * Convert the module name to the path of the source files .
         * @param {string} moduleName 'Vendor_Package_Module'
         * @return {string} '/home/user/app/node_modules/@vendor/package/src/Module.js'
         */
        this.resolve = function (moduleName) {
            return '/home/alex/work/teqfw/di/demo/components/app/Service.js';
        };

        // MAIN
    }
};