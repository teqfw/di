/**
 * Default parser for object keys in format:
 *   - Vnd_Pkg_Prj_Mod$FA
 */
import Dto from '../Api/ObjectKey.js';
import Defs from '../Defs.js';

// VARS


// MAIN
/**
 * @param {string} objectKey
 * @return {TeqFw_Di_Api_ObjectKey}
 */
export default function TeqFw_Di_Parser_Def(objectKey) {
    const res = new Dto();
    res.composition = Defs.COMPOSE_FACTORY;
    res.exportName = 'default';
    res.life = Defs.LIFE_SINGLETON;
    res.moduleName = 'App_Service';
    res.value = objectKey;
    return res;
}