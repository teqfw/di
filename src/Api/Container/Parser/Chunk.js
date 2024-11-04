/**
 * Interface for one chunk of the runtime dependency ID parser.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_Parser_Chunk {

    /**
     * Returns 'true' if this chunk can parse the given dependency ID.
     *
     * @param {string} depId
     * @returns {boolean}
     */
    canParse(depId) {};

    /**
     * Parses a string ID for a runtime dependency and returns structured data (DTO).
     * @param {string} depId
     * @returns {TeqFw_Di_DepId}
     */
    parse(depId) {}
};