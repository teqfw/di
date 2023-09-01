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
    addChunk(chunk) {}

    /**
     * Parse given dependency ID and return structured data as DTO.
     * @param {TeqFw_Di_DepId} depId
     * @return {TeqFw_Di_DepId}
     */
    modify(depId) {}

}