import ParsedId from './Api/ParsedId.mjs';

/** @type {RegExp} expression for filepath based IDs (@vendor/package!module#export$$) */
const FILEPATH_ID = /^(([A-Za-z0-9_\-/@]*)!(([A-Za-z0-9_\-/@]*))?((#)?([A-Za-z0-9_]*)(\${1,2})?)?)$/;
/** @type {RegExp} expression for logical namespace IDs (Ns_Module#export$$) */
const LOGICAL_NS_ID = /^((([A-Z])[A-Za-z0-9_]*)(#?([A-Za-z0-9_]*)(\${1,2})?)?)$/;
/** @type {RegExp} expression for objects that manually added to DI container (singleton, namedFactory$$)  */
const MANUAL_DI_ID = /^((([a-z])[A-Za-z0-9_]*)(\$\$)?)$/;



/**
 * Dependency identifiers parser.
 */
export default class TeqFw_Di_IdParser {
    /**
     * Validate dependency identifier, parse and return parts of the identifier.
     *
     * @param {string} id Dependency identifier to validate and parse.
     * @return {TeqFw_Di_Api_ParsedId} Parsed data for given ID.
     * @throws {Error} if `id` is not valid.
     */
    parse(id) {
        const result = new ParsedId();
        result.orig = id;
        const diObjParts = MANUAL_DI_ID.exec(id);
        const nsLogicParts = LOGICAL_NS_ID.exec(id);
        const nsFileParts = FILEPATH_ID.exec(id);
        if (!diObjParts && !nsLogicParts && !nsFileParts)
            throw new Error(`Invalid identifier: '${id}'. See 'https://github.com/teqfw/di/blob/master/docs/identifiers.md'.`);
        if (diObjParts) {
            result.typeId = ParsedId.TYPE_ID_MANUAL;
            result.mapKey = diObjParts[2];
            if (diObjParts[4] === '$$') {
                result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
            } else {
                result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
            }
        } else if (nsLogicParts) {
            result.typeId = ParsedId.TYPE_ID_LOGICAL;
            result.nameModule = nsLogicParts[2];
            result.mapKey = result.nameModule;
            result.typeTarget = ParsedId.TYPE_TARGET_MODULE;
            if (nsLogicParts[4] === '#') {
                result.nameExport = 'default';
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
            if (nsLogicParts[5]) {
                result.nameExport = nsLogicParts[5];
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
            if (nsLogicParts[6]) {
                if (nsLogicParts[6] === '$$') {
                    result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
                } else if (nsLogicParts[6] === '$') {
                    result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
                }
                if (result.nameExport === undefined) {
                    result.nameExport = 'default';
                    result.mapKey = result.nameModule;
                } else {
                    result.mapKey = result.nameModule + '#' + result.nameExport;
                }
            }
        } else {
            result.typeId = ParsedId.TYPE_ID_FILEPATH;
            result.namePackage = nsFileParts[2];
            result.nameModule = nsFileParts[3];
            result.mapKey = nsFileParts[1];
            result.typeTarget = ParsedId.TYPE_TARGET_MODULE;
            if (nsFileParts[6] === '#') {
                result.nameExport = 'default';
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
            if (nsFileParts[7]) {
                result.nameExport = nsFileParts[7];
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
            if (nsFileParts[8]) {
                if (nsFileParts[8] === '$$') {
                    result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
                } else if (nsFileParts[8] === '$') {
                    result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
                }
                if (result.nameExport === undefined) {
                    result.nameExport = 'default';
                    result.mapKey = result.namePackage + '!' + result.nameModule;
                } else {
                    result.mapKey = result.namePackage + '!' + result.nameModule + '#' + result.nameExport;
                }
            }
        }
        return result;
    }
}
