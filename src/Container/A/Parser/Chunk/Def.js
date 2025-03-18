/**
 * Default parser for object keys in format:
 *   - Ns_Module.export$$(post)
 *   - node:package.export$$(post)
 *   - node:@scope/package.export$$(post)
 *
 * @namespace TeqFw_Di_Container_A_Parser_Chunk_Def
 */
import Dto from '../../../../DepId.js';
import Defs from '../../../../Defs.js';

// VARS
/** @type {RegExp} expression for default object key */
const REGEXP = /^(node:)?((@?[A-Za-z0-9_\-]+\/?[A-Za-z0-9_\-]*))((\.)?([A-Za-z0-9_]*)((\$)?(\$)?)?)?(\(([A-Za-z0-9_,]*)\))?$/;

/**
 * @implements TeqFw_Di_Api_Container_Parser_Chunk
 */
export default class TeqFw_Di_Container_A_Parser_Chunk_Def {

    canParse(depId) {
        // default parser always tries to parse the depId
        return true;
    }

    parse(objectKey) {
        const res = new Dto();
        res.origin = objectKey;
        const parts = REGEXP.exec(objectKey);
        if (parts) {
            res.isNodeModule = Boolean(parts[1]); // Detect 'node:' prefix
            res.moduleName = parts[2].replace(/^node:/, ''); // Remove 'node:' prefix

            if (parts[5] === '.') {
                // Ns_Module.export or node:package.export
                if ((parts[7] === '$') || (parts[7] === '$$')) {
                    res.composition = Defs.CF;
                    res.exportName = parts[6];
                    res.life = (parts[7] === '$') ? Defs.LS : Defs.LI;
                } else {
                    res.composition = Defs.CA;
                    res.life = Defs.LS;
                    res.exportName = (parts[6] !== '') ? parts[6] : 'default';
                }
            } else if ((parts[7] === '$') || parts[7] === '$$') {
                // Ns_Module$$ or node:package$$
                res.composition = Defs.CF;
                res.exportName = 'default';
                res.life = (parts[7] === '$') ? Defs.LS : Defs.LI;
            } else {
                // Ns_Module or node:package (ES6 module)
                res.composition = undefined;
                res.exportName = undefined;
                res.life = undefined;
            }

            // Wrappers handling
            if (parts[11]) {
                res.wrappers = parts[11].split(',');
            }
        }

        // Ensure singletons for non-factory exports
        if ((res.composition === Defs.CA) && (res.life === Defs.LI))
            throw new Error(`Export is not a function and should be used as a singleton only: '${res.origin}'.`);

        return res;
    }
}
