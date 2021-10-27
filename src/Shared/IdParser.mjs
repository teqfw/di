// MODULE'S IMPORT
import ParsedId from './IdParser/Dto.mjs';

// MODULE'S VARS
/** @type {string} default export keyword */
const DEF_EXP = 'default';
/** @type {string} logical namespace export mark (Ns_Mod.export) */
const EXP = '.';
/** @type {string} filesystem export mark (@vendor/package!module#export$$) and old logical export mark */
const EXP_OLD = '#';
/** @type {RegExp} expression for filepath based IDs (@vendor/package!module#export$$) */
const FILEPATH_ID = /^((([a-z@])([A-Za-z0-9_\-/@]*))(!([A-Za-z0-9_\-/@]*)?((#)?([A-Za-z0-9_]*)(\${1,2})?)?)?)$/;
/** @type {string} filesystem module mark (@vendor/package!module#export$$) */
const FSM = '!';
/** @type {string} new instance mark (Ns_Mod.export$$) */
const INST = '$$';
/** @type {RegExp} expression for logical namespace IDs (Ns_Module#export$$) */
const LOGICAL_NS_ID = /^((([A-Z])[A-Za-z0-9_]*)((#|.)?([A-Za-z0-9_]*)(\${1,2}|@{1,2})?)?)$/;
/** @type {RegExp} expression for objects that manually added to DI container (singleton, namedFactory$$)  */
const MANUAL_DI_ID = /^((([a-z])[A-Za-z0-9_]*)(\$\$)?)$/;
/** @type {string} new instance proxy mark (Ns_Mod.export@@) */
const P_INST = '@@';
/** @type {string} singleton proxy mark (Ns_Mod.export@) */
const P_SNGLT = '@';
/** @type {string} singleton mark (Ns_Mod.export$) */
const SNGLT = '$';

// MODULE'S CLASSES
/**
 * Dependency identifiers parser.
 */
export default class TeqFw_Di_Shared_IdParser {
    /**
     * Validate dependency identifier, parse and return parts of the identifier.
     *
     * @param {string} id Dependency identifier to validate and parse.
     * @returns {TeqFw_Di_Shared_IdParser_Dto} Parsed data for given ID.
     * @throws {Error} if `id` is not valid.
     */
    parse(id) {
        let result = this.parseManualDiId(id);
        if (!result) result = this.parseLogicalNsId(id);
        if (!result) result = this.parseFilepathId(id);
        if (!result)
            throw new Error(`Invalid identifier: '${id}'. See 'https://github.com/teqfw/di/blob/master/docs/identifiers.md'.`);
        return result;
    }

    /**
     * Parse filepath based identifiers (@vendor/package!module#exportedFactory$$).
     * @param {string} id
     * @returns {null|TeqFw_Di_Shared_IdParser_Dto}
     */
    parseFilepathId(id) {
        let result = null;
        const parts = FILEPATH_ID.exec(id);
        if (parts) {
            result = new ParsedId();
            result.orig = id;
            result.typeId = ParsedId.TYPE_ID_FILEPATH;
            result.namePackage = parts[2];
            if (!parts[6]) {
                result.typeTarget = ParsedId.TYPE_TARGET_PACKAGE;
            } else {
                result.nameModule = parts[6];
                result.mapKey = parts[1];
                result.typeTarget = ParsedId.TYPE_TARGET_MODULE;
                if (parts[8] === EXP_OLD) {
                    result.nameExport = DEF_EXP;
                    result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                    result.mapKey = undefined;
                }
                if (parts[9]) {
                    result.nameExport = parts[9];
                    result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                    result.mapKey = undefined;
                }
                if (parts[10]) {
                    if (parts[10] === INST) {
                        result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
                    } else if (parts[10] === SNGLT) {
                        result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
                    }
                    if (result.nameExport === undefined) {
                        result.nameExport = DEF_EXP;
                        result.mapKey = result.namePackage + FSM + result.nameModule;
                    } else {
                        result.mapKey = result.namePackage + FSM + result.nameModule + EXP_OLD + result.nameExport;
                    }
                }
            }
        }
        return result;
    }

    /**
     * Parse logical namespaces identifiers (Ns_Module#exportedFactory$$).
     * @param {string} id
     * @returns {null|TeqFw_Di_Shared_IdParser_Dto}
     */
    parseLogicalNsId(id) {
        let result = null;
        const parts = LOGICAL_NS_ID.exec(id);
        if (parts) {
            result = new ParsedId();
            result.orig = id;
            result.typeId = ParsedId.TYPE_ID_LOGICAL;
            result.nameModule = parts[2];
            result.isProxy = false;
            result.mapKey = result.nameModule; // init mapKey with module's name
            result.typeTarget = ParsedId.TYPE_TARGET_MODULE;
            // Ns_Module.name$$[@@] - named instance [proxy]
            if (
                ((parts[5] === EXP) || (parts[5] === EXP_OLD))
                && ((parts[7] === INST) || (parts[7] === P_INST))
            ) {
                result.isProxy = (parts[7] === P_INST);
                result.nameExport = parts[6];
                result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
                result.mapKey = result.nameModule + EXP + result.nameExport;
            }
            // Ns_Module.name$[@] - named singleton [proxy]
            else if (
                ((parts[5] === EXP) || (parts[5] === EXP_OLD))
                && ((parts[7] === SNGLT) || (parts[7] === P_SNGLT))
            ) {
                result.isProxy = (parts[7] === P_SNGLT);
                result.nameExport = parts[6];
                result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
                result.mapKey = result.nameModule + EXP + result.nameExport;
            }
            // Ns_Module.name - named export
            else if (
                ((parts[5] === EXP) || (parts[5] === EXP_OLD))
                && ((parts[6] !== undefined) && (parts[6] !== ''))
            ) {
                result.nameExport = parts[6];
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
            // Ns_Module$$[@@]- default instance [proxy]
            else if ((parts[4] === INST) || (parts[4] === P_INST)) {
                result.isProxy = (parts[4] === P_INST);
                result.nameExport = DEF_EXP;
                result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
            }
            // Ns_Module$[@] - default singleton [proxy]
            else if ((parts[4] === SNGLT) || (parts[4] === P_SNGLT)) {
                result.isProxy = (parts[4] === P_SNGLT);
                result.nameExport = DEF_EXP;
                result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
            }
            // Ns_Module#[.] - default export
            else if (
                ((parts[5] === EXP) || (parts[5] === EXP_OLD))
                && (parts[7] === undefined)
            ) {
                result.nameExport = DEF_EXP;
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
        }
        return result;
    }

    /**
     * Parse manually inserted identifiers (singleton, factory$$).
     * @param {string} id
     * @returns {null|TeqFw_Di_Shared_IdParser_Dto}
     */
    parseManualDiId(id) {
        let result = null;
        const parts = MANUAL_DI_ID.exec(id);
        if (parts) {
            result = new ParsedId();
            result.orig = id;
            result.typeId = ParsedId.TYPE_ID_MANUAL;
            result.mapKey = parts[2];
            if (parts[4] === '$$') {
                result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
            } else {
                result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
            }
        }
        return result;
    }
}
