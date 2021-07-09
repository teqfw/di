// MODULE'S CLASSES
/**
 * Data structure for TeqFW plugins scanner (@see TeqFw_Di_Back_Plugin_Scanner).
 */
export default class TeqFw_Di_Back_Api_Dto_Scanned {
    /** @type {Object} 'package.json' data */
    package;
    /** @type {String} absolute path to the root of the plugin package */
    path;
    /** @type {Object} 'teqfw.json' data */
    teqfw;
}
