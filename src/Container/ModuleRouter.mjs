// @ts-check

/**
 * @namespace TeqFw_Di_Container_ModuleRouter
 * @description Derives stable module routes from effective dependency identities.
 */

import TeqFw_Di_Enum_AddressKind from '../Enum/AddressKind.mjs';

/** @typedef {import('../Dto/ModuleRouter/Config.mjs').default} TeqFw_Di_Dto_ModuleRouter_Config */

/**
 * @typedef {{prefix: string, target: string, defaultExt: string}} TeqFw_Di_Container_ModuleRouter_NamespaceRule
 */

/**
 * @typedef {{specifier: string, mapping?: TeqFw_Di_Container_ModuleRouter_NamespaceRule}} TeqFw_Di_Container_ModuleRouter_Route
 */

/**
 * @typedef {object} TeqFw_Di_Container_ModuleRouter_Dependencies
 * @property {TeqFw_Di_Dto_ModuleRouter_Config} config
 * @property {TeqFw_Di_Internal_Logger_Contract|null} [logger]
 */

/**
 * Owns Address-Kind interpretation and Teq Namespace Mapping. It never loads
 * a module and does not own native-load cache state.
 */
export default class TeqFw_Di_Container_ModuleRouter {
    /**
     * @param {TeqFw_Di_Container_ModuleRouter_Dependencies} deps
     */
    constructor({config, logger = null}) {
        /** @type {{namespaces: TeqFw_Di_Container_ModuleRouter_NamespaceRule[]}} */
        const snapshot = {
            namespaces: config.namespaces.map((one) => ({
                prefix: /** @type {string} */ (one.prefix),
                target: /** @type {string} */ (one.target),
                defaultExt: /** @type {string} */ (one.defaultExt),
            })),
        };
        /** @type {TeqFw_Di_Internal_Logger_Contract|null} */
        const log = logger;

        /**
         * Selects the deterministic longest matching Namespace Mapping.
         *
         * @param {string} address
         * @returns {TeqFw_Di_Container_ModuleRouter_NamespaceRule}
         */
        const selectNamespaceRule = function (address) {
            /** @type {TeqFw_Di_Container_ModuleRouter_NamespaceRule|null} */
            let found = null;
            let foundLength = -1;
            for (const one of snapshot.namespaces) {
                const match = address.startsWith(one.prefix);
                if (log) log.log(`ModuleRouter.namespace: prefix='${one.prefix}' match=${String(match)} address='${address}'.`);
                if (match && one.prefix.length > foundLength) {
                    found = one;
                    foundLength = one.prefix.length;
                }
            }
            if (!found) throw new Error(`Namespace rule is not found for Address '${address}'.`);
            return found;
        };

        /**
         * Appends one configured extension exactly once.
         *
         * @param {string} path
         * @param {string} defaultExt
         * @returns {string}
         */
        const appendExt = function (path, defaultExt) {
            if (path.endsWith(defaultExt)) return path;
            return `${path}${defaultExt}`;
        };

        /**
         * Joins a configured root and relative path without normalizing it.
         *
         * @param {string} target
         * @param {string} path
         * @returns {string}
         */
        const join = function (target, path) {
            return target.endsWith('/') ? `${target}${path}` : `${target}/${path}`;
        };

        /**
         * Derives a self-contained route for one effective identity.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {TeqFw_Di_Container_ModuleRouter_Route}
         */
        this.route = function (depId) {
            if (depId.addressKind === TeqFw_Di_Enum_AddressKind.NODE) {
                const specifier = `node:${depId.address}`;
                if (log) log.log(`ModuleRouter.route: addressKind='${depId.addressKind}' address='${depId.address}' -> '${specifier}'.`);
                return Object.freeze({specifier});
            }
            if (depId.addressKind === TeqFw_Di_Enum_AddressKind.NPM) {
                const specifier = depId.address;
                if (log) log.log(`ModuleRouter.route: addressKind='${depId.addressKind}' address='${depId.address}' -> '${specifier}'.`);
                return Object.freeze({specifier});
            }
            if (depId.addressKind !== TeqFw_Di_Enum_AddressKind.TEQ) {
                throw new Error(`Unsupported Address Kind: ${depId.addressKind}`);
            }
            const rule = selectNamespaceRule(depId.address);
            const remainder = depId.address.slice(rule.prefix.length);
            const relativePath = remainder.split('_').join('/');
            const specifier = join(rule.target, appendExt(relativePath, rule.defaultExt));
            if (log) log.log(`ModuleRouter.route: addressKind='${depId.addressKind}' address='${depId.address}' -> '${specifier}'.`);
            return Object.freeze({specifier, mapping: Object.freeze({...rule})});
        };
    }
}
