// @ts-check

/**
 * @namespace TeqFw_Di_Container_ModuleRouter
 * @description Derives stable module routes from effective dependency identities.
 */

import TeqFw_Di_Enum_Platform from '../Enum/Platform.mjs';

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
         * @param {string} moduleName
         * @returns {TeqFw_Di_Container_ModuleRouter_NamespaceRule}
         */
        const selectNamespaceRule = function (moduleName) {
            /** @type {TeqFw_Di_Container_ModuleRouter_NamespaceRule|null} */
            let found = null;
            let foundLength = -1;
            for (const one of snapshot.namespaces) {
                const match = moduleName.startsWith(one.prefix);
                if (log) log.log(`ModuleRouter.namespace: prefix='${one.prefix}' match=${String(match)} module='${moduleName}'.`);
                if (match && one.prefix.length > foundLength) {
                    found = one;
                    foundLength = one.prefix.length;
                }
            }
            if (!found) throw new Error(`Namespace rule is not found for '${moduleName}'.`);
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
            if (!defaultExt || path.endsWith(defaultExt)) return path;
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
            if (!target) return path;
            return target.endsWith('/') ? `${target}${path}` : `${target}/${path}`;
        };

        /**
         * Derives a self-contained route for one effective identity.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {TeqFw_Di_Container_ModuleRouter_Route}
         */
        this.route = function (depId) {
            if (depId.platform === TeqFw_Di_Enum_Platform.NODE) {
                const specifier = `node:${depId.moduleName}`;
                if (log) log.log(`ModuleRouter.route: '${depId.moduleName}' -> '${specifier}'.`);
                return Object.freeze({specifier});
            }
            if (depId.platform === TeqFw_Di_Enum_Platform.NPM) {
                const specifier = depId.moduleName;
                if (log) log.log(`ModuleRouter.route: '${depId.moduleName}' -> '${specifier}'.`);
                return Object.freeze({specifier});
            }
            if (depId.platform !== TeqFw_Di_Enum_Platform.TEQ) {
                throw new Error(`Unsupported platform: ${depId.platform}`);
            }
            const rule = selectNamespaceRule(depId.moduleName);
            const remainder = depId.moduleName.slice(rule.prefix.length);
            const relativePath = remainder.split('_').join('/');
            const specifier = join(rule.target, appendExt(relativePath, rule.defaultExt));
            if (log) log.log(`ModuleRouter.route: '${depId.moduleName}' -> '${specifier}'.`);
            return Object.freeze({specifier, mapping: Object.freeze({...rule})});
        };
    }
}
