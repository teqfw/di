/**
 * Format validator for dependencies identifiers.
 *
 * @namespace TeqFw_Di_Util
 */

/**
 * @typedef {Object} TeqFw_Di_Util.IdData
 * @property {string} id - Original ID.
 * @property {string} source_part - Part of the full ID that used to define source codes to import.
 * @property {boolean} is_instance - 'true' if ID corresponds to singleton object in DI container..
 * @property {string} [instance_name] - Part of the full ID that used to define instance name.
 * @property {string} [plugin] - Part of the full ID that used to define plugin name.
 */

/**
 * Valid object ID starts with a letter and can contain letters, digits, underscore and '$' sign as separator
 * for source identifier and instance identifier.
 *
 * @type {RegExp}
 * @memberOf TeqFw_Di_Util
 */
const REG_EXP_VALID_ID = /^(([a-z]\w*)(\${2}))?([A-Za-z]\w*)(\$?)(\w*)$/;

/**
 * Validate objects identifier, parse and return ID parts.
 *
 * @param {string} id Dependency identifier to validate.
 * @return {TeqFw_Di_Util.IdData} Parsed data for given ID.
 * @throws {Error} if `id` is not valid.
 * @memberOf TeqFw_Di_Util
 */
function parseId(id) {
    const parts = REG_EXP_VALID_ID.exec(id);
    if (!parts) throw new Error(`Invalid identifier: '${id}'. See 'https://github.com/teqfw/di/blob/master/docs/identifiers.md'.`);
    const plugin = parts[2];
    const source_part = parts[4];
    const instance_name = parts[6];
    const is_instance = !(source_part === id);
    return {id, source_part, is_instance, instance_name, plugin};
}

export default {parseId}