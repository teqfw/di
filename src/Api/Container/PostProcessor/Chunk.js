/**
 * Interface for one chunk of the post-processor that modifies result.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_PostProcessor_Chunk {

    /**
     * Modify result before returning to the caller.
     * @param {*} obj - created object
     * @param {TeqFw_Di_DepId} originalId - original `depId` DTO
     */
    modify(obj, originalId) {}
};