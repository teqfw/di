/**
 * Dependency identifiers parser.
 */
import ParsedId from './Api/ParsedId.mjs';

/** @type {RegExp} */
const REG_EXP_OBJECT_ID = /^(([a-z])[A-Za-z0-9_]*)$/;
const REG_EXP_MODULE_ID = /^((([A-Z])[A-Za-z0-9_]*)(\${1,2})?)$/;

/**
 * Dependency identifiers parser.
 */
export default class TeqFw_Di_IdParser {
    /**
     * Validate dependency identifier, parse and return parts of identifier.
     *
     * @param {string} id Dependency identifier to validate and parse.
     * @return {TeqFw_Di_Api_ParsedId} Parsed data for given ID.
     * @throws {Error} if `id` is not valid.
     */
    parse(id) {
        const result = new ParsedId();
        result.id = id;
        const objParts = REG_EXP_OBJECT_ID.exec(id);
        const modParts = REG_EXP_MODULE_ID.exec(id);
        if (!objParts && !modParts) throw new Error(`Invalid identifier: '${id}'. See 'https://github.com/teqfw/di/blob/master/docs/identifiers.md'.`);
        if (objParts) {
            result.isObjectId = true;
            result.isSingleton = true;
        } else {
            result.moduleName = modParts[2];
            if (modParts[4]) {
                if (modParts[4] === '$') {
                    result.isConstructor = true;
                } else if (modParts[4] === '$$') {
                    result.isSingleton = true;
                }
            } else {
                result.isModule = true;
            }
        }
        return result;
    }
}
