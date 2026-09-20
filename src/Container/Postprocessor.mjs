// @ts-check

/**
 * @namespace TeqFw_Di_Container_Postprocessor
 * @description Container-scoped ordered postprocessor configuration and execution.
 */

/**
 * @typedef {object} TeqFw_Di_Container_Postprocessor_Dependencies
 * @property {TeqFw_Di_Internal_Logger_Contract|null} [logger]
 */

/**
 * Owns configured synchronous value adaptation. It has no knowledge of
 * identifiers, routing, loading, lifecycle, wrappers, or hardening.
 */
export default class TeqFw_Di_Container_Postprocessor {
    /**
     * @param {TeqFw_Di_Container_Postprocessor_Dependencies} [deps]
     */
    constructor({logger = null} = {}) {
        /** @type {((value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown)[]} */
        const postprocessors = [];
        /** @type {TeqFw_Di_Internal_Logger_Contract|null} */
        const log = logger;

        /**
         * Registers one postprocessor in registration order.
         *
         * @param {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} fn
         * @returns {void}
         */
        this.add = function (fn) {
            postprocessors.push(fn);
        };

        /**
         * Applies every configured postprocessor synchronously.
         *
         * @param {unknown} value
         * @param {TeqFw_Di_Container_ResolutionContext} context
         * @returns {unknown}
         */
        this.apply = function (value, context) {
            /** @type {unknown} */
            let current = value;
            for (const fn of postprocessors) {
                current = fn(current, context);
                if (current instanceof Promise) {
                    throw new Error('Postprocess callback must return synchronously (non-Promise).');
                }
            }
            if (log) log.log(`Postprocessor.apply: count=${String(postprocessors.length)}.`);
            return current;
        };

        /**
         * Returns the configured processor count for observation.
         *
         * @returns {number}
         */
        this.count = function () {
            return postprocessors.length;
        };
    }
}
