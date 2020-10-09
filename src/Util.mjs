/**
 * Utilities for the module.
 */

/**
 * Structure with result of Dependency ID parsing.
 *
 * @typedef {Object} TeqFw_Di_Util.Id
 * @property {string} id - Original ID.
 * @property {string} source_part - Part of the full ID that used to define source codes to import.
 * @property {boolean} is_instance - 'true' if ID corresponds to singleton object in DI container..
 * @property {string} [instance_name] - Part of the full ID that used to define instance name.
 * @property {string} [plugin] - Part of the full ID that used to define plugin name.
 *
 */

/**
 * Valid object ID starts with a letter and can contain letters, digits, underscore and '$' sign as separator
 * for source identifier and instance identifier:
 * <pre>/^(([a-z]\w*)(\${2}))?([A-Za-z]\w*)(\$?)(\w*)$/;</pre>
 * <ul>
 * <li><b>Vendor_Project_Module_Dependency$name</b>: instance of 'Vendor_Project_Module_Dependency' named as 'name';</li>
 * <li><b>Vendor_Project_Module_Dependency$</b>: default instance of 'Vendor_Project_Module_Dependency' (singleton);</li>
 * <li><b>Vendor_Project_Module_Dependency</b>: new instance of 'Vendor_Project_Module_Dependency';</li>
 * <li><b>plugin$$Vendor_Project_Module_Dependency$name</b>: reserved to load sources using plugins;</li>
 * </ul>
 *
 * @type {RegExp}
 * @memberOf TeqFw_Di_Util
 */
const REG_EXP_VALID_ID = /^(([a-z]\w*)(\${2}))?([A-Za-z]\w*)(\$?)(\w*)$/;

/**
 * Set of helpers.
 */
export default class TeqFw_Di_Util {
    /**
     * Validate dependency identifier, parse and return parts of identifier.
     *
     * @param {string} id Dependency identifier to validate and parse.
     * @return {TeqFw_Di_Util.Id} Parsed data for given ID.
     * @throws {Error} if `id` is not valid.
     */
    parseId(id) {
        const parts = REG_EXP_VALID_ID.exec(id);
        if (!parts) throw new Error(`Invalid identifier: '${id}'. See 'https://github.com/teqfw/di/blob/master/docs/identifiers.md'.`);
        const plugin = parts[2];
        const source_part = parts[4];
        const instance_name = parts[6];
        const is_instance = !(source_part === id);
        return {id, source_part, is_instance, instance_name, plugin};
    }
}
