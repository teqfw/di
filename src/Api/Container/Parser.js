/**
 * Interface for the parser of the runtime dependency ID.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_Parser {
    /**
     * Adds the given chunk to the parser.
     *
     * @param {TeqFw_Di_Api_Container_Parser_Chunk} chunk
     */
    addChunk(chunk) {}

    /**
     * Parse given dependency ID and return structured data as DTO.
     * @param {string} depId
     * @returns {TeqFw_Di_DepId}
     */
    parse(depId) {}

    /**
     * Sets the default chunk of the parser.
     *
     * @param {TeqFw_Di_Api_Container_Parser_Chunk} chunk
     */
    setDefaultChunk(chunk) {}
}