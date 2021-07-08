// MODULE'S CLASSES
/**
 * Data structure for file paths resolver (@see TeqFw_Di_Shared_Resolver).
 */
export default class TeqFw_Di_Back_Api_Dto_Resolve {
    /** @type {String} extension for files in the namespace */
    ext;
    /** @type {Boolean} absolute or relative mapping is used in namespace */
    isAbsolute;
    /** @type {String} related namespace */
    ns;
    /** @type {String} path to the root of the namespace */
    path;
}
