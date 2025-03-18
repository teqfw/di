/**
 * Default parser for object keys in format:
 *   - Ns_Module[.|#]export$[F|A][S|I]
 *   - node:package[.|#]export$[F|A][S|I]
 *
 * @namespace TeqFw_Di_Container_A_Parser_Chunk_V02X
 */
import Dto from '../../../../DepId.js';
import Defs from '../../../../Defs.js';

// VARS
/** @type {RegExp} expression for default object key */
const REGEXP = /^(node:)?((([A-Z])[A-Za-z0-9_]*|[a-z][a-z0-9\-]*))((#|\.)?([A-Za-z0-9_]*)((\$)([F|A])?([S|I])?)?)?$/;

/**
 * @implements TeqFw_Di_Api_Container_Parser_Chunk
 */
export default class TeqFw_Di_Container_A_Parser_Chunk_V02X {

    canParse(depId) {
        // default parser always tries to parse the depId
        return true;
    }

    parse(objectKey) {
        const res = new Dto();
        res.origin = objectKey;
        const parts = REGEXP.exec(objectKey);
        if (parts) {
            res.isNodeModule = Boolean(parts[1]); // Check if it starts with 'node:'
            res.moduleName = parts[2].replace(/^node:/, ''); // Remove 'node:' if present

            if (parts[6] === '.') {
                // App_Service.export or node:package.export
                if (parts[9] === '$') {
                    // App_Service.export$ or node:package.export$
                    res.composition = Defs.CF;
                    res.exportName = parts[7];
                    res.life = (parts[11] === Defs.LI) ? Defs.LI : Defs.LS;
                } else {
                    res.composition = (!parts[9] || parts[9] === Defs.CA) ? Defs.CA : Defs.CF;
                    res.exportName = parts[7];
                    res.life = (!parts[9] || parts[11] === Defs.LS) ? Defs.LS : Defs.LI;
                }
            } else if (parts[9] === '$') {
                // App_Logger$FS or node:package$
                res.composition = (!parts[10] || parts[10] === Defs.CF) ? Defs.CF : Defs.CA;
                res.exportName = 'default';
                res.life = parts[11] ? (parts[11] === Defs.LS ? Defs.LS : Defs.LI) : (res.composition === Defs.CF ? Defs.LS : Defs.LI);
            } else {
                // App_Service or node:package (ES6 module)
                res.composition = undefined;
                res.exportName = undefined;
                res.life = undefined;
            }
        }

        // Enforce singleton for non-factory exports
        if (res.composition === Defs.CA && res.life === Defs.LI) {
            throw new Error(`Export is not a function and should be used as a singleton only: '${res.origin}'.`);
        }

        return res;
    }
}
