/**
 * Interface for the Object Container.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container {
    /**
     * Gets or creates a runtime object by ID.
     *
     * @param {string} runtimeDepId - The ID of the runtime object.
     * @return {Promise<*>} - A promise that resolves to the runtime object.
     */
    async get(runtimeDepId) {};

    /**
     * @return {TeqFw_Di_Parser}
     */
    getParser() {};

    /**
     * @return {TeqFw_Di_PreProcessor}
     */
    getPreProcessor() {};

    /**
     * @return {TeqFw_Di_Resolver}
     */
    getResolver() {};

    /**
     * Enable disable debug output for the object composition process.
     * @param {boolean} data
     */
    setDebug(data) {};

    /**
     * @param {TeqFw_Di_Parser} data
     */
    setParser(data) {};

    /**
     * @param {TeqFw_Di_PreProcessor} data
     */
    setPreProcessor(data) {};

    /**
     * @param {TeqFw_Di_Resolver} data
     */
    setResolver(data) {};
};