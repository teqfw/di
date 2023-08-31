/**
 * Parser for object keys in old format:
 *   - Vnd_Pkg_Prj_Mod[.|#]export$$
 */
import Dto from '../../../DepId.js';
import Defs from '../../../Defs.js';

// VARS
/** @type {string} default export keyword */
const DEF_EXP = 'default';
/** @type {string} logical namespace export mark (Ns_Mod.export) */
const EXP = '.';
/** @type {string} filesystem export mark (@vendor/package!module#export$$) and old logical export mark */
const EXP_OLD = '#';
/** @type {string} new instance mark (Ns_Mod.export$$) */
const INST = '$$';
/** @type {RegExp} expression for logical namespace IDs (Ns_Module[.|#]export$$@@) */
const REGEXP = /^((([A-Z])[A-Za-z0-9_]*)((#|.)?([A-Za-z0-9_]*)(\${1,2}|@{1,2})?)?)$/;
/** @type {RegExp} expression for objects that manually added to DI container (singleton, namedFactory$$)  */
const MANUAL = /^((([a-z])[A-Za-z0-9_]*)(\$\$)?)$/s;
/** @type {string} new instance proxy mark (Ns_Mod.export@@) */
const P_INST = '@@';
/** @type {string} singleton proxy mark (Ns_Mod.export@) */
const P_SNGLT = '@';
/** @type {string} singleton mark (Ns_Mod.export$) */
const SNGLT = '$';

// MAIN
export default function TeqFw_Di_Container_Parser_Chunk_Old(objectKey) {
    const res = new Dto();
    res.value = objectKey;
    const parts = REGEXP.exec(objectKey);
    if (parts) {
        res.moduleName = parts[2];
        // Ns_Module.name$$[@@] - named instance [proxy]
        if (
            ((parts[5] === EXP) || (parts[5] === EXP_OLD))
            && ((parts[7] === INST) || (parts[7] === P_INST))
        ) {
            if (parts[7] === P_INST)
                res.wrappers.push(Defs.WRAP_PROXY);
            res.composition = Defs.COMPOSE_FACTORY;
            res.life = Defs.LIFE_INSTANCE;
            res.exportName = parts[6];
        }
        // Ns_Module.name$[@] - named singleton [proxy]
        else if (
            ((parts[5] === EXP) || (parts[5] === EXP_OLD))
            && ((parts[7] === SNGLT) || (parts[7] === P_SNGLT))
        ) {
            if (parts[7] === P_SNGLT)
                res.wrappers.push(Defs.WRAP_PROXY);
            res.composition = Defs.COMPOSE_FACTORY;
            res.life = Defs.LIFE_SINGLETON;
            res.exportName = parts[6];
        }
        // Ns_Module.name - named export
        else if (
            ((parts[5] === EXP) || (parts[5] === EXP_OLD))
            && ((parts[6] !== undefined) && (parts[6] !== ''))
        ) {
            res.composition = Defs.COMPOSE_AS_IS;
            res.exportName = parts[6];
            res.life = Defs.LIFE_SINGLETON;
        }
        // Ns_Module$$[@@]- default instance [proxy]
        else if ((parts[4] === INST) || (parts[4] === P_INST)) {
            if (parts[4] === P_INST)
                res.wrappers.push(Defs.WRAP_PROXY);
            res.composition = Defs.COMPOSE_FACTORY;
            res.life = Defs.LIFE_INSTANCE;
            res.exportName = DEF_EXP;
        }
        // Ns_Module$[@] - default singleton [proxy]
        else if ((parts[4] === SNGLT) || (parts[4] === P_SNGLT)) {
            if (parts[4] === P_SNGLT)
                res.wrappers.push(Defs.WRAP_PROXY);
            res.composition = Defs.COMPOSE_FACTORY;
            res.life = Defs.LIFE_SINGLETON;
            res.exportName = DEF_EXP;
        }
        // Ns_Module#[.] - default export
        else if (
            ((parts[5] === EXP) || (parts[5] === EXP_OLD))
            && (parts[7] === undefined)
        ) {
            res.composition = Defs.COMPOSE_AS_IS;
            res.life = Defs.LIFE_SINGLETON;
            res.exportName = DEF_EXP;
        } else {
            // just a es6-module (deprecated)

        }
    } else {
        const manual = MANUAL.exec(objectKey);
        if (manual) {
            if (manual[4] === '$$') {
                res.composition = Defs.COMPOSE_FACTORY;
                res.life = Defs.LIFE_INSTANCE;
            } else {
                res.life = Defs.LIFE_SINGLETON;
            }
        } else {
            // TODO: add exception
        }
    }
    return res;
}