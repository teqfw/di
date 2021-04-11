// MODULE'S CLASSES
/**
 * Data structure for file paths resolver (@see TeqFw_Di_Resolver).
 */
class TeqFw_Di_Api_ResolveDetails {
    /** @type {String} extension for files in the namespace */
    ext;
    /** @type {Boolean} absolute or relative mapping is used in namespace */
    isAbsolute;
    /** @type {String} related namespace */
    ns;
    /** @type {String} path to the root of the namespace */
    path;
}

// MODULE'S EXPORT
export {
    TeqFw_Di_Api_ResolveDetails as default
}
