/**
 * Default parser for object keys in format:
 *   - Ns_Module[.|#]export$[F|A][S|I]
 *
 * @namespace TeqFw_Di_Container_A_Parser_Chunk_V23
 */
import Dto from '../../../../DepId.js';
import Defs from '../../../../Defs.js';

// VARS
/** @type {RegExp} expression for default object key (Ns_Module[.|#]export$[F|A][S|I]) */
const REGEXP = /^((([A-Z])[A-Za-z0-9_]*)((#|\.)?([A-Za-z0-9_]*)((\$)([F|A])?([S|I])?)?)?)$/;

/**
 * @implements TeqFw_Di_Api_Container_Parser_Chunk
 */
export default class TeqFw_Di_Container_A_Parser_Chunk_V23 {

    canParse(depId) {
        // default parser always trys to parse the depId
        return true;
    }

    parse(objectKey) {
        const res = new Dto();
        res.value = objectKey;
        const parts = REGEXP.exec(objectKey);
        if (parts) {
            res.moduleName = parts[2];
            if (parts[5] === '.') {
                // App_Service.export...
                if (parts[8] === '$') {
                    // App_Service.export$...
                    res.composition = Defs.COMP_F;
                    res.exportName = parts[6];
                    res.life = (parts[10] === Defs.LIFE_I)
                        ? Defs.LIFE_I : Defs.LIFE_S;
                } else {
                    res.composition = ((parts[8] === undefined) || (parts[8] === Defs.COMP_A))
                        ? Defs.COMP_A : Defs.COMP_F;
                    res.exportName = parts[6];
                    res.life = ((parts[8] === undefined) || (parts[10] === Defs.LIFE_S))
                        ? Defs.LIFE_S : Defs.LIFE_I;
                }


            } else if (parts[8] === '$') {
                // App_Logger$FS
                res.composition = ((parts[9] === undefined) || (parts[9] === Defs.COMP_F))
                    ? Defs.COMP_F : Defs.COMP_A;
                res.exportName = 'default';
                if (parts[10]) {
                    res.life = (parts[10] === Defs.LIFE_S) ? Defs.LIFE_S : Defs.LIFE_I;
                } else {
                    res.life = (res.composition === Defs.COMP_F) ? Defs.LIFE_S : Defs.LIFE_I;
                }
            } else {
                // App_Service (es6 module)
                res.composition = undefined;
                res.exportName = undefined;
                res.life = undefined;
            }
        }

        // we should always use singletons for as-is exports
        if ((res.composition === Defs.COMP_A) && (res.life === Defs.LIFE_I))
            throw new Error(`Export is not a function and should be used as a singleton only: '${res.value}'.`);
        return res;
    }
}