// @ts-check

/**
 * @namespace TeqFw_Di_Container_Hardener
 * @description Container-scoped hardening policy and runtime provenance.
 */

/**
 * @typedef {'primitive'|'already-frozen'|'runtime-owned'|'frozen'|'configured'} TeqFw_Di_Container_Hardening_Mode
 */

/**
 * @typedef {{value: unknown, mode: TeqFw_Di_Container_Hardening_Mode}} TeqFw_Di_Container_Hardening_Result
 */

/**
 * Owns the default final-value hardening policy and exact identities of
 * namespace objects acquired from the JavaScript Runtime.
 */
export default class TeqFw_Di_Container_Hardener {
    /**
     * Creates an isolated hardening policy with Container-owned provenance.
     */
    constructor() {
        /** @type {WeakSet<object>} */
        const runtimeOwnedNamespaces = new WeakSet();
        /** @type {((value: unknown) => unknown)|null} */
        let configuredHardener = null;

        /**
         * Applies the default shallow hardening policy.
         *
         * @param {unknown} value
         * @returns {TeqFw_Di_Container_Hardening_Result}
         */
        const hardenByDefault = function (value) {
            if ((value === null) || (value === undefined)) return {value, mode: 'primitive'};
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return {value, mode: 'primitive'};
            if (Object.isFrozen(value)) return {value, mode: 'already-frozen'};
            if (runtimeOwnedNamespaces.has(/** @type {object} */ (value))) return {value, mode: 'runtime-owned'};
            return {value: Object.freeze(value), mode: 'frozen'};
        };

        /**
         * Registers one exact runtime namespace identity.
         *
         * @param {object} namespace
         * @returns {void}
         */
        this.registerRuntimeOwned = function (namespace) {
            runtimeOwnedNamespaces.add(namespace);
        };

        /**
         * Replaces the default hardener with the configured host policy.
         *
         * @param {(value: unknown) => unknown} fn
         * @returns {void}
         */
        this.setConfigured = function (fn) {
            configuredHardener = fn;
        };

        /**
         * Hardens one final adapted dependency value.
         *
         * @param {unknown} value
         * @returns {TeqFw_Di_Container_Hardening_Result}
         */
        this.harden = function (value) {
            if (configuredHardener !== null) {
                return {value: configuredHardener(value), mode: 'configured'};
            }
            return hardenByDefault(value);
        };
    }
}
