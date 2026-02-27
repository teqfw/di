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
    addChunk(chunk) {
        throw new Error('TeqFw_Di_Api_Container_Parser#addChunk is abstract.');
    }

    /**
     * Parse given dependency ID and return structured data as DTO.
     * @param {string} depId
     * @returns {TeqFw_Di_DepId}
     */
    parse(depId) {
        throw new Error('TeqFw_Di_Api_Container_Parser#parse is abstract.');
    }

    /**
     * Sets the default chunk of the parser.
     *
     * @param {TeqFw_Di_Api_Container_Parser_Chunk} chunk
     */
    setDefaultChunk(chunk) {
        throw new Error('TeqFw_Di_Api_Container_Parser#setDefaultChunk is abstract.');
    }
}
