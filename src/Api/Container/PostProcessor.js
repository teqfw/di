/**
 * Interface for the post-processor of the result object.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_PostProcessor {
    /**
     * Adds the given chunk to the parser.
     *
     * @param {TeqFw_Di_Api_Container_PostProcessor_Chunk} chunk
     */
    addChunk(chunk) {}

    /**
     * Modifies the result of the object composition.
     *
     * @param {*} obj - The result object to be modified.
     * @param {TeqFw_Di_DepId} depId - The original depID DTO.
     * @param {string[]} - The stack of parent IDs.
     * @return {Promise<*>}
     */
    modify(obj, depId, stack) {}

}