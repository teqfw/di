/**
 * Valid object ID starts with a letter and can contain letters, digits & underscore.
 * @type {RegExp}
 */
const REG_EXP_VALID_ID = /^[A-Za-z]\w*$/;

export default class TeqFw_Di_Normalizer {
    constructor() {
    }

    /**
     * Validate objects identifier.
     *
     * @param {string} id Object ID to validate.
     * @return {string} Valid object ID.
     */
    static parseId(id) {
        const is_valid = REG_EXP_VALID_ID.test(id);
        if (!is_valid) throw new Error(`Invalid identifier: ${id}.`);
        return id;
    }
}