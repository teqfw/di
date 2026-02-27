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
    parser() {
        throw new Error('TeqFw_Di_Api_Container_Config#parser is abstract.');
    }

    /**
     * Returns the pre-processor configurator.
     *
     * @returns {TeqFw_Di_Api_Container_PreProcessor}
     */
    preProcessor() {
        throw new Error('TeqFw_Di_Api_Container_Config#preProcessor is abstract.');
    }

    /**
     * Returns the post-processor configurator.
     *
     * @returns {TeqFw_Di_Api_Container_PostProcessor}
     */
    postProcessor() {
        throw new Error('TeqFw_Di_Api_Container_Config#postProcessor is abstract.');
    }

    /**
     * Returns the resolver configurator.
     *
     * @returns {TeqFw_Di_Api_Container_Resolver}
     */
    resolver() {
        throw new Error('TeqFw_Di_Api_Container_Config#resolver is abstract.');
    }

    /**
     * Enables test mode.
     *
     * @returns {void}
     */
    enableTestMode() {
        throw new Error('TeqFw_Di_Api_Container_Config#enableTestMode is abstract.');
    }

    /**
     * Registers a singleton or a Node.js module replacement in test mode.
     *
     * @param {string} depId
     * @param {object} obj
     * @returns {void}
     */
    register(depId, obj) {
        throw new Error('TeqFw_Di_Api_Container_Config#register is abstract.');
    }

    /**
     * Finalizes configuration and returns a runtime container instance.
     *
     * @returns {TeqFw_Di_Api_Container}
     */
    finalize() {
        throw new Error('TeqFw_Di_Api_Container_Config#finalize is abstract.');
    }
}
