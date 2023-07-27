/**
 * This is default parser that converts dependency ID to the `depId` DTO.
 * @namespace DepId.Parser
 */
// IMPORTS
import {DepId} from '../Api/DepId.mjs';

// VARS
/** @type {RegExp} expression for depId (Ns_Module.export$$#adapter) */
const TMPL = /^(([A-Z])[A-Za-z0-9_]*)((.)([A-Za-z0-9_]*)?((\$|\$\$)?((#)([A-Za-z0-9_]*)?)?)?)?$/;

// FUNCS
/**
 * @param {string} depId
 * @return {Api.DepId}
 */
export default function (depId) {
    let res;
    const parts = TMPL.exec(depId);
    if (parts) {
        const nameMod = parts[1];
        const sepMod = parts[4]; // after-module separator
        const sepExp = parts[6]; // after-export separator
        const sepLife = parts[9]; // after-life separator

        res = new DepId();
        // always presents
        res.nameModule = nameMod;
        if (sepLife === '#') {
            // the longest form of the ID (Mod.exp$#adp)
            res.adapter = parts[10] ?? 'default';
            res.isExport = true;
            res.isFactory = parts[7] !== undefined;
            if (parts[7] === '$') res.isSingleton = true;
            else if (parts[7] === '$$') res.isSingleton = false;
            res.nameExport = parts[5];
        } else if (sepMod === '#') {
            // Mod#adp
            res.adapter = parts[5] ?? 'default';
            res.isExport = true;
            res.isFactory = false;
            res.nameExport = 'default';
        } else if ((sepExp === '$') || (sepExp === '$$')) {
            if (sepMod === '.') {
                // Mod.exp$$
                res.isExport = true;
                res.isFactory = true;
                if (parts[7] === '$') res.isSingleton = true;
                else if (parts[7] === '$$') res.isSingleton = false;
                res.nameExport = parts[5];
            } else if (sepMod === '$') {
                // Mod$$
                res.isExport = true;
                res.isFactory = true;
                if (parts[3] === '$') res.isSingleton = true;
                else if (parts[3] === '$$') res.isSingleton = false;
                res.nameExport = 'default';
            }
        } else {
            // Mod.exp
            res.isFactory = false;
            res.isExport = (sepMod === '.');
            // define the name of the export
            if (res.isExport) res.nameExport = parts[5] ?? 'default';
        }
    }
    return res;
}