/**
 * Format validator for dependencies identifiers.
 *
 * @namespace TeqFw_Di_Container_Normalizer
 */

/**
 * @typedef {Object} TeqFw_Di_Container_Normalizer.IdData
 * @property {string} id - Original ID.
 * @property {string} source_part - Part of the full ID that used to define source codes to import.
 * @property {boolean} is_instance - 'true' if ID corresponds to singleton object in DI container..
 * @property {string} [instance_name] - Part of the full ID that used to define instance name.
 */

/**
 * Valid object ID starts with a letter and can contain letters, digits, underscore and '$' sign as separator
 * for source identifier and instance identifier.
 *
 * @type {RegExp}
 * @memberOf TeqFw_Di_Container_Normalizer
 */
const REG_EXP_VALID_ID = /^([A-Za-z]\w*)(\$?)(\w*)$/;

/**
 * Validate objects identifier, parse and return ID parts.
 *
 * @param {string} id Dependency identifier to validate.
 * @return {TeqFw_Di_Container_Normalizer.IdData} Parsed data for given ID.
 * @throws {Error} if `id` is not valid.
 * @memberOf TeqFw_Di_Container_Normalizer
 */
function parseId(id) {
    const parts = REG_EXP_VALID_ID.exec(id);
    if (!parts) throw new Error(`Invalid identifier: '${id}'. See 'https://github.com/teqfw/di/blob/master/docs/identifiers.md'.`);
    const source_part = parts[1];
    const instance_name = parts[3];
    const is_instance = !(source_part === id);
    return {id, source_part, is_instance, instance_name};
}

export default {parseId}