/**
 * Public configuration API of the DI container.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container_Config {

    /**
     * Returns the parser configurator.
     *
     * @returns {TeqFw_Di_Api_Container_Parser}
     */
    parser() { }

    /**
     * Returns the pre-processor configurator.
     *
     * @returns {TeqFw_Di_Api_Container_PreProcessor}
     */
    preProcessor() { }

    /**
     * Returns the post-processor configurator.
     *
     * @returns {TeqFw_Di_Api_Container_PostProcessor}
     */
    postProcessor() { }

    /**
     * Returns the resolver configurator.
     *
     * @returns {TeqFw_Di_Api_Container_Resolver}
     */
    resolver() { }

    /**
     * Enables test mode.
     *
     * @returns {void}
     */
    enableTestMode() { }

    /**
     * Registers a singleton or a Node.js module replacement in test mode.
     *
     * @param {string} depId
     * @param {object} obj
     * @returns {void}
     */
    register(depId, obj) { }

    /**
     * Finalizes configuration and returns a runtime container instance.
     *
     * @returns {TeqFw_Di_Api_Container}
     */
    finalize() { }
}
