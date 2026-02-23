// @ts-check

/**
 * Internal synchronous console logger.
 *
 * This module is internal infrastructure and must not be exposed as a public API.
 */
export default class TeqFw_Di_Internal_Logger {
    /**
     * @param {string} scope
     */
    constructor(scope = 'teqfw/di') {
        /** @type {string} */
        const prefix = `[${scope}]`;

        /**
         * @param {string} message
         * @returns {void}
         */
        this.log = function (message) {
            console.debug(`${prefix} ${message}`);
        };

        /**
         * @param {string} message
         * @param {unknown} [error]
         * @returns {void}
         */
        this.error = function (message, error) {
            console.error(`${prefix} ${message}`);
            if (error instanceof Error) {
                console.error(error.stack ?? error.message);
                return;
            }
            if (error !== undefined) {
                console.error(error);
            }
        };
    }
}

/**
 * No-op logger for disabled logging mode.
 */
export const TeqFw_Di_Internal_Logger_Noop = Object.freeze({
    /**
     * @returns {void}
     */
    log() {},
    /**
     * @returns {void}
     */
    error() {},
});
