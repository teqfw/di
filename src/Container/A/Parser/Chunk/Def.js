/**
 * Default parser for object keys in format:
 *   - Ns_Module.export$$(post)
 *
 * @namespace TeqFw_Di_Container_A_Parser_Chunk_Def
 */
import Dto from '../../../../DepId.js';
import Defs from '../../../../Defs.js';

// VARS
/** @type {RegExp} expression for default object key (Ns_Module.export$$(post)) */
const REGEXP = /^((([A-Z])[A-Za-z0-9_]*)((\.)?([A-Za-z0-9_]*)((\$)?(\$)?)?)?(\(([A-Za-z0-9_,]*)\))?)$/;

/**
 * @implements TeqFw_Di_Api_Container_Parser_Chunk
 */
export default class TeqFw_Di_Container_A_Parser_Chunk_Def {

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
                // Ns_Module.export...
                if ((parts[7] === '$') || (parts[7] === '$$')) {
                    // Ns_Module.export$...
                    res.composition = Defs.COMP_F;
                    res.exportName = parts[6];
                    res.life = (parts[7] === '$') ? Defs.LIFE_S : Defs.LIFE_I;
                } else {
                    res.composition = Defs.COMP_A;
                    res.life = Defs.LIFE_S;
                    // res.exportName = (parts[6]) ? parts[6] : 'default';
                    res.exportName = (parts[6] !== '') ? parts[6] : 'default';
                }
            } else if ((parts[7] === '$') || parts[7] === '$$') {
                // Ns_Module$$
                res.composition = Defs.COMP_F;
                res.exportName = 'default';
                res.life = (parts[7] === '$') ? Defs.LIFE_S : Defs.LIFE_I;
            } else {
                // Ns_Module (es6 module)
                res.composition = undefined;
                res.exportName = undefined;
                res.life = undefined;
            }
            // wrappers
            if (parts[11]) {
                res.wrappers = parts[11].split(',');
            }
        }

        // we should always use singletons for as-is exports
        if ((res.composition === Defs.COMP_A) && (res.life === Defs.LIFE_I))
            throw new Error(`Export is not a function and should be used as a singleton only: '${res.value}'.`);
        return res;
    }
}