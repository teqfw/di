/**
 * Interface for one chunk of the pre-processor that modify initial `depId`.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_PreProcessor_Chunk {

    /**
     * Modify runtime dependency ID before creating any object.
     * @param {TeqFw_Di_DepId} depId - `depId` DTO after all previous pre-processing steps
     * @param {TeqFw_Di_DepId} originalId - original `depId` DTO
     * @return {TeqFw_Di_DepId}
     */
    modify(depId, originalId) {}
};