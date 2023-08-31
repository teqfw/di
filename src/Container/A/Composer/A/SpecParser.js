/**
 * This function analyses specification of dependencies extracted from the text definition of the function itself.
 *
 * This is a local module and is used only inside the `TeqFw_Di_Container_A_Composer` space.
 *
 * @namespace TeqFw_Di_Container_A_Composer_A_SpecParser
 */
import Defs from '../../../../Defs.js';

// VARS
const FUNC = /(function)*\s*\w*\s*\(\s*\{([^\}]*)\}/s;
const CLASS = /constructor\s*\(\s*\{([^\}]*)\}/s;

// FUNCS

/**
 * Internal function to analyze extracted parameters.
 *
 * @param {string} params
 * @return {string[]}
 * @private
 */
function _analyze(params) {
    const res = [];
    // create wrapper for arguments and collect dependencies using Proxy
    try {
        const fn = new Function(`{${params}}`, 'return');
        const spec = new Proxy({}, {
            get: (target, prop) => res.push(prop),
        });
        // run wrapper and return dependencies
        fn(spec);
    } catch (e) {
        const msg = `Cannot analyze the deps specification:${params}\n`
            + `\nPlease, be sure that spec does not contain extra ')' in a comments.`
            + `\n\nError: ${e}`;
        throw new Error(msg);
    }
    return res;
}

/**
 * @param {Function|Object} exp
 * @return {string[]}
 */
function _analyzeClass(exp) {
    const res = [];
    // extract arguments from constructor
    const def = exp.toString();
    const parts = CLASS.exec(def);
    if (parts) {
        res.push(..._analyze(parts[1]));
    } // else: constructor does not have arguments
    return res;
}

/**
 * @param {Function|Object} exp
 * @return {string[]}
 */
function _analyzeFunc(exp) {
    const res = [];
    // extract arguments from factory function
    const def = exp.toString();
    const parts = FUNC.exec(def);
    if (parts) {
        res.push(..._analyze(parts[2]));
    } // else: constructor does not have arguments
    return res;
}

// MAIN
/**
 * @param {Function|Object} exp
 * @return {string[]}
 */
export default function (exp) {
    if (typeof exp === 'function') {
        if (Defs.isClass(exp)) {
            return _analyzeClass(exp);
        } else {
            return _analyzeFunc(exp);
        }
    } else
        return [];
}