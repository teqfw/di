/**
 * This function analyzes specification of dependencies extracted from the text definition of the function itself.
 */
import Defs from './Defs.js';

// VARS
const FUNC = /function\s*\w*\s*\(([^)]+)\)/s;
const CLASS = /constructor\s*\(([^)]+)\)/s;
// FUNCS

// MAIN
/**
 * @param {Function|Object} exp
 * @return {string[]}
 */
export default function (exp) {

    // FUNCS
    /**
     * @param {Function|Object} exp
     * @return {string[]}
     */
    function analyzeClass(exp) {
        // extract arguments from constructor
        const def = exp.toString();
        const parts = CLASS.exec(def);
        // create wrapper for arguments and collect dependencies using Proxy
        const fn = new Function(parts[1], 'return');
        const res = [];
        const spec = new Proxy({}, {
            get: (target, prop) => res.push(prop),
        });
        // run wrapper and return dependencies
        fn(spec);
        return res;
    }

    /**
     * @param {Function|Object} exp
     * @return {string[]}
     */
    function analyzeFunc(exp) {
        // extract arguments from factory function
        const def = exp.toString();
        const parts = FUNC.exec(def);
        // create wrapper for arguments and collect dependencies using Proxy
        const fn = new Function(parts[1], 'return');
        const res = [];
        const spec = new Proxy({}, {
            get: (target, prop) => res.push(prop),
        });
        // run wrapper and return dependencies
        fn(spec);
        return res;
    }

    // MAIN
    if (typeof exp === 'function') {
        if (Defs.isClass(exp)) {
            return analyzeClass(exp);
        } else {
            return analyzeFunc(exp);
        }
    } else
        return [];
}