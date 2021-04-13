// MODULE'S CLASSES
/**
 * Data structure for TeqFW plugins scanner (@see TeqFw_Di_Util_PluginScanner).
 */
class TeqFw_Di_Api_ScanData {
    /** @type {Object} 'package.json' data */
    package;
    /** @type {String} absolute path to the root of the plugin package */
    path;
    /** @type {Object} 'teqfw.json' data */
    teqfw;
}

// MODULE'S EXPORT
export {
    TeqFw_Di_Api_ScanData as default
}
