/**
 * Runtime configuration facade for the DI container.
 *
 * @implements TeqFw_Di_Api_Container_Config
 */
import Container from '../Container.js';

export default class TeqFw_Di_Container_Config {
    constructor() {
        // VARS
        const _container = new Container();
        let _finalized = false;

        // FUNCS
        function assertNotFinalized() {
            if (_finalized) throw new Error('Container configuration is finalized.');
        }

        // INSTANCE METHODS

        /**
         * Returns the parser configurator.
         *
         * @returns {TeqFw_Di_Api_Container_Parser}
         */
        this.parser = function () {
            assertNotFinalized();
            return _container.getParser();
        };

        /**
         * Returns the pre-processor configurator.
         *
         * @returns {TeqFw_Di_Api_Container_PreProcessor}
         */
        this.preProcessor = function () {
            assertNotFinalized();
            return _container.getPreProcessor();
        };

        /**
         * Returns the post-processor configurator.
         *
         * @returns {TeqFw_Di_Api_Container_PostProcessor}
         */
        this.postProcessor = function () {
            assertNotFinalized();
            return _container.getPostProcessor();
        };

        /**
         * Returns the resolver configurator.
         *
         * @returns {TeqFw_Di_Api_Container_Resolver}
         */
        this.resolver = function () {
            assertNotFinalized();
            return _container.getResolver();
        };

        /**
         * Enables test mode.
         *
         * @returns {void}
         */
        this.enableTestMode = function () {
            assertNotFinalized();
            _container.enableTestMode();
        };

        /**
         * Registers a singleton or a Node.js module replacement in test mode.
         *
         * @param {string} depId
         * @param {object} obj
         * @returns {void}
         */
        this.register = function (depId, obj) {
            assertNotFinalized();
            _container.register(depId, obj);
        };

        /**
         * Finalizes configuration and returns a runtime container instance.
         *
         * @returns {TeqFw_Di_Api_Container}
         */
        this.finalize = function () {
            _finalized = true;
            return _container;
        };
    }
}
