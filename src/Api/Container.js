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
    get(runtimeDepId) {};

    /**
     * @return {TeqFw_Di_Api_Container_Parser}
     */
    getParser() {};

    /**
     * @return {TeqFw_Di_Api_Container_PreProcessor}
     */
    getPreProcessor() {};

    /**
     * @return {TeqFw_Di_Api_Container_PostProcessor}
     */
    getPostProcessor() {};

    /**
     * @return {TeqFw_Di_Container_Resolver} - the default resolver
     */
    getResolver() {};

    /**
     * Enable disable debug output for the object composition process.
     * @param {boolean} data
     */
    setDebug(data) {};

    /**
     * @param {TeqFw_Di_Api_Container_Parser} data
     */
    setParser(data) {};

    /**
     * @param {TeqFw_Di_Api_Container_PreProcessor} data
     */
    setPreProcessor(data) {};

    /**
     * @param {TeqFw_Di_Api_Container_PostProcessor} data
     */
    setPostProcessor(data) {};

    /**
     * @param {TeqFw_Di_Api_Container_Resolver} data
     */
    setResolver(data) {};
};