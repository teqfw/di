/**
 * The Resolver should convert ES6 module name into the path to the sources (file path or URL).
 *
 * This is a base resolver that considers that:
 *  - module name is Zend1-compatible ('Vendor_Package_Module')
 *  - every namespace is bound to some real path ('Vendor_Package_' => '.../node_modules/@vendor/package/src/...)
 *  - every package has sources with the same extensions (*.js, *.mjs, *.es6, ...)
 *  - namespaces can be nested (App_Web_ => ./@app/web/..., App_Web_Api_ => ./@app/web_api/...)
 */
import Defs from '../Defs.js';

// VARS
const KEY_EXT = 'ext';
const KEY_NS = 'ns';
const KEY_PATH = 'root';
/**
 * Namespace parts separator.
 *
 * @type {string}
 */
const NSS = '_';

// MAIN
export default class TeqFw_Di_Container_Resolver {

    constructor() {
        // VARS
        const _regNs = {};
        let _namespaces = [];
        let _ps = '/'; // web & unix path separator

        // INSTANCE METHODS

        this.addNamespaceRoot = function (ns, path, ext) {
            _regNs[ns] = {
                [KEY_EXT]: ext ?? Defs.EXT,
                [KEY_NS]: ns,
                [KEY_PATH]: path,
            };
            _namespaces = Object.keys(_regNs).sort((a, b) => b.localeCompare(a));
        };

        /**
         * Convert the module name to the path of the source files .
         * @param {string} moduleName 'Vendor_Package_Module'
         * @return {string} '/home/user/app/node_modules/@vendor/package/src/Module.js'
         */
        this.resolve = function (moduleName) {
            let root, ext, ns;
            for (ns of _namespaces) {
                if (moduleName.startsWith(ns)) {
                    root = _regNs[ns][KEY_PATH];
                    ext = _regNs[ns][KEY_EXT];
                    break;
                }
            }
            if (root && ext) {
                let tail = moduleName.replace(ns, '');
                if (tail.indexOf(NSS) === 0) tail = tail.replace(NSS, '');
                const file = tail.replaceAll(NSS, _ps);
                return `${root}${_ps}${file}.${ext}`;
            } else return moduleName;
        };
    }
};