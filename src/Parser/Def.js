/**
 * Default parser for object keys in format:
 *   - Vnd_Pkg_Prj_Mod$FA
 */
import Dto from '../Api/ObjectKey.js';
import Defs from '../Defs.js';

// VARS
/** @type {RegExp} expression for default object key (Ns_Module[.|#]export$[F|A][S|I]) */
const REGEXP = /^((([A-Z])[A-Za-z0-9_]*)((#|\.)?([A-Za-z0-9]*)((\$)([F|A])?([S|I])?)?)?)$/;


// MAIN
/**
 * @param {string} objectKey
 * @return {TeqFw_Di_Api_ObjectKey}
 */
export default function TeqFw_Di_Parser_Def(objectKey) {
    const res = new Dto();
    res.value = objectKey;
    const parts = REGEXP.exec(objectKey);
    if (parts) {
        res.moduleName = parts[2];
        if (parts[8] === '$') {
            // App_Logger$FS
            res.composition = (parts[9] === Defs.COMPOSE_FACTORY) ? Defs.COMPOSE_FACTORY : Defs.COMPOSE_AS_IS;
            res.exportName = 'default';
            res.life = (parts[10] === Defs.LIFE_SINGLETON) ? Defs.LIFE_SINGLETON : Defs.LIFE_INSTANCE;
        } else if ((parts[5] === '.')) {
            // App_Service.export$FS
            res.composition = (parts[9] === Defs.COMPOSE_FACTORY) ? Defs.COMPOSE_FACTORY : Defs.COMPOSE_AS_IS;
            res.exportName = parts[6];
            res.life = (parts[10] === Defs.LIFE_SINGLETON) ? Defs.LIFE_SINGLETON : Defs.LIFE_INSTANCE;
        } else {
            // App_Service
            res.composition = Defs.COMPOSE_AS_IS;
            res.exportName = 'default';
            res.life = Defs.LIFE_SINGLETON;
        }
    }

    // we should always use singletons for as-is exports
    if (res.composition === Defs.COMPOSE_AS_IS) res.life = Defs.LIFE_SINGLETON;
    return res;
}