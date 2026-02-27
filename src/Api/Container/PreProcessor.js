/**
 * Interface for the pre-processor of the runtime dependency ID.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_PreProcessor {
    /**
     * Adds the given chunk to the parser.
     *
     * @param {TeqFw_Di_Api_Container_PreProcessor_Chunk} chunk
     */
    addChunk(chunk) {
        throw new Error('TeqFw_Di_Api_Container_PreProcessor#addChunk is abstract.');
    }

    /**
     * Modify parsed depID and return it.
     * @param {TeqFw_Di_DepId} depId - The depID as DTO.
     * @param {string[]} stack - The stack of parent IDs.
     * @returns {TeqFw_Di_DepId} -
     */
    modify(depId, stack) {
        throw new Error('TeqFw_Di_Api_Container_PreProcessor#modify is abstract.');
    }

}
