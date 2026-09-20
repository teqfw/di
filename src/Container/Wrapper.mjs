// @ts-check

/**
 * @namespace TeqFw_Di_Container_Wrapper
 * @description Executes identifier-selected synchronous Wrappers.
 */

/**
 * Owns Wrapper Selection lookup and ordered wrapper execution. It does not
 * resolve identifiers or own any Container policy.
 */
export default class TeqFw_Di_Container_Wrapper {
    constructor() {
        /**
         * Applies selected wrappers in declaration order.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @param {unknown} value
         * @param {object} moduleNamespace
         * @returns {unknown}
         */
        this.execute = function (depId, value, moduleNamespace) {
            /** @type {unknown} */
            let current = value;
            for (const name of depId.wrappers) {
                if (!(name in moduleNamespace)) {
                    throw new Error(`Wrapper '${name}' is not found in module namespace.`);
                }
                const candidate = /** @type {Record<string, unknown>} */ (moduleNamespace)[name];
                if (typeof candidate !== 'function') {
                    throw new Error(`Wrapper '${name}' must be callable.`);
                }
                current = candidate(current);
                if (current instanceof Promise) {
                    throw new Error(`Wrapper '${name}' must return synchronously (non-Promise).`);
                }
            }
            return current;
        };
    }
}
