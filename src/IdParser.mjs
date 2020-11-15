import ParsedId from './Api/ParsedId.mjs';

/** @type {RegExp} expression for filepath based IDs (@vendor/package!module#export$$) */
const FILEPATH_ID = /^((([a-z@])([A-Za-z0-9_\-/@]*))(!([A-Za-z0-9_\-/@]*)?((#)?([A-Za-z0-9_]*)(\${1,2})?)?)?)$/;
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
     * @return {null|TeqFw_Di_Api_ParsedId}
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
                if (parts[8] === '#') {
                    result.nameExport = 'default';
                    result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                    result.mapKey = undefined;
                }
                if (parts[9]) {
                    result.nameExport = parts[9];
                    result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                    result.mapKey = undefined;
                }
                if (parts[10]) {
                    if (parts[10] === '$$') {
                        result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
                    } else if (parts[10] === '$') {
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
        }
        return result;
    }

    /**
     * Parse logical namespaces identifiers (Ns_Module#exportedFactory$$).
     * @param {string} id
     * @return {null|TeqFw_Di_Api_ParsedId}
     */
    parseLogicalNsId(id) {
        let result = null;
        const parts = LOGICAL_NS_ID.exec(id);
        if (parts) {
            result = new ParsedId();
            result.orig = id;
            result.typeId = ParsedId.TYPE_ID_LOGICAL;
            result.nameModule = parts[2];
            result.mapKey = result.nameModule;
            result.typeTarget = ParsedId.TYPE_TARGET_MODULE;
            if (parts[4] === '#') {
                result.nameExport = 'default';
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
            if (parts[5]) {
                result.nameExport = parts[5];
                result.typeTarget = ParsedId.TYPE_TARGET_EXPORT;
                result.mapKey = undefined;
            }
            if (parts[6]) {
                if (parts[6] === '$$') {
                    result.typeTarget = ParsedId.TYPE_TARGET_FACTORY;
                } else if (parts[6] === '$') {
                    result.typeTarget = ParsedId.TYPE_TARGET_SINGLETON;
                }
                if (result.nameExport === undefined) {
                    result.nameExport = 'default';
                    result.mapKey = result.nameModule;
                } else {
                    result.mapKey = result.nameModule + '#' + result.nameExport;
                }
            }
        }
        return result;
    }

    /**
     * Parse manually inserted identifiers (singleton, factory$$).
     * @param {string} id
     * @return {null|TeqFw_Di_Api_ParsedId}
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
