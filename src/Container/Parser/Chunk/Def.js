/**
 * Default parser for object keys in format:
 *   - Vnd_Pkg_Prj_Mod$FA
 */
import Dto from '../../../DepId.js';
import Defs from '../../../Defs.js';

// VARS
/** @type {RegExp} expression for default object key (Ns_Module[.|#]export$[F|A][S|I]) */
const REGEXP = /^((([A-Z])[A-Za-z0-9_]*)((#|\.)?([A-Za-z0-9]*)((\$)([F|A])?([S|I])?)?)?)$/;

/**
 * @implements TeqFw_Di_Api_Container_Parser_Chunk
 */
export default class TeqFw_Di_Container_Parser_Chunk_Def {


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
                    res.composition = Defs.COMPOSE_FACTORY;
                    res.exportName = parts[6];
                    res.life = (parts[10] === Defs.LIFE_INSTANCE)
                        ? Defs.LIFE_INSTANCE : Defs.LIFE_SINGLETON;
                } else {
                    res.composition = ((parts[8] === undefined) || (parts[8] === Defs.COMPOSE_AS_IS))
                        ? Defs.COMPOSE_AS_IS : Defs.COMPOSE_FACTORY;
                    res.exportName = parts[6];
                    res.life = ((parts[8] === undefined) || (parts[10] === Defs.LIFE_SINGLETON))
                        ? Defs.LIFE_SINGLETON : Defs.LIFE_INSTANCE;
                }


            } else if (parts[8] === '$') {
                // App_Logger$FS
                res.composition = ((parts[9] === undefined) || (parts[9] === Defs.COMPOSE_FACTORY))
                    ? Defs.COMPOSE_FACTORY : Defs.COMPOSE_AS_IS;
                res.exportName = 'default';
                if (parts[10]) {
                    res.life = (parts[10] === Defs.LIFE_SINGLETON) ? Defs.LIFE_SINGLETON : Defs.LIFE_INSTANCE;
                } else {
                    res.life = (res.composition === Defs.COMPOSE_FACTORY) ? Defs.LIFE_SINGLETON : Defs.LIFE_INSTANCE;
                }
            } else {
                // App_Service
                res.composition = Defs.COMPOSE_AS_IS;
                res.exportName = 'default';
                res.life = Defs.LIFE_SINGLETON;
            }
        }

        // we should always use singletons for as-is exports
        if ((res.composition === Defs.COMPOSE_AS_IS) && (res.life === Defs.LIFE_INSTANCE))
            throw new Error(`Export is not a function and should be used as a singleton only: '${res.value}'.`);
        return res;
    }
}