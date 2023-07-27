/**
 * This is default parser that converts dependencies specification into array of depIds.
 * @namespace Spec.Parser
 */
// IMPORTS

// VARS
const FN_ARW = /^.*\((\{[^}]*}|[^)]*)\)\s* =>.*$/s;
const FN_CLASS = /class.*constructor.*\((.*)\).*/s;
const FN_REG = /^function.*\((\{[^}]*}|[^)]*)\)\s*\{[^}]*}$/s;

// FUNCS

/**
 * Extract spec arguments from the class constructor '({...}=>{})
 * @param {string} spec
 * @return {null|string}
 */
function specClass(spec) {
    const parts = FN_CLASS.exec(spec);
    if (parts?.[1]) {
        return parts[1].replace('{', '')
            .replace('}', '')
            .replace(/\n/g, ' ');
    }
    return null;
}

/**
 * Extract spec arguments from the arrow '({...}=>{})
 * @param {string} spec
 * @return {null|string}
 */
function specFnArrow(spec) {
    const parts = FN_ARW.exec(spec);
    if (parts?.[1]) {
        return parts[1].replace('{', '')
            .replace('}', '')
            .replace(/\n/g, ' ');
    }
    return null;
}

/**
 * Extract spec arguments from the regular 'function({...})
 * @param {string} spec
 * @return {null|string}
 */
function specFnRegular(spec) {
    const parts = FN_REG.exec(spec);
    if (parts?.[1]) {
        return parts[1].replace('{', '')
            .replace('}', '')
            .replace(/\n/g, ' ');
    }
    return null;
}

function argsComplex(args) {
    const res = [];
    /** @type {string[]} */
    const all = args.split(',');
    for (const one of all) {
        let arg = one.trim();
        if (arg.includes('[')) {
            // ['Vendor_App_Mod.arg1$$#adp']: arg1,
            const norm = arg.replaceAll('\'', '')
                .replaceAll('"', '')
                .replace('[', '')
                .replace(']', '');
            const parts = norm.split(':');
            res.push(parts[0]);
        } else if (arg.includes(':')) {
            // Vendor_App_Mod$$: arg1,
            const parts = arg.split(':');
            res.push(parts[0]);
        } else if (arg.length) {
            // Vendor_App_Mod$$
            res.push(arg);
        }
    }
    return res;
}

/**
 * @param {Object} factory
 * @return {string[]}
 */
export default function (factory) {
    const res = [];
    if (typeof factory === 'function') {
        const def = factory.toString();
        let spec = specFnRegular(def);
        if (spec) return argsComplex(spec);
        spec = specFnArrow(def);
        if (spec) return argsComplex(spec);
        spec = specClass(def);
        if (spec) return argsComplex(spec);
    }
    return res;
}