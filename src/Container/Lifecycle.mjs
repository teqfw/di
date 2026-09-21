// @ts-check

/**
 * @namespace TeqFw_Di_Container_Lifecycle
 * @description Singleton cache policy for final managed values.
 */

import TeqFw_Di_Enum_Lifestyle from '../Enum/Lifestyle.mjs';
import {buildDependencyKey} from '../Internal/DependencyKey.mjs';

/**
 * Lifecycle-stage registry for final managed dependency values.
 *
 * Applies Singleton cache policy around a complete cache-miss corridor:
 * - Singleton final values are cached by structural DepId identity;
 * - Direct and Transient bypass the cache;
 * - the cache-miss callback supplies the final managed value.
 */
export default class TeqFw_Di_Container_Lifecycle {

    /**
     * Creates lifecycle registry instance.
     *
     * @param {TeqFw_Di_Internal_Logger_Contract|null} logger Optional diagnostics logger.
     */
    constructor(logger = null) {
        /** @type {Map<string, unknown>} */
        const singletonCache = new Map();
        /** @type {{log(message: string): void}|null} */
        const log = logger;

        /**
         * Builds deterministic cache key from structural DepId fields.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {string}
         */
        const buildKey = buildDependencyKey;

        /**
         * Reports the current cache branch without changing cache state.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {'bypass'|'hit'|'miss'}
         */
        this.lookup = function (depId) {
            switch (depId.lifestyle) {
                case TeqFw_Di_Enum_Lifestyle.DIRECT:
                    return 'bypass';
                case TeqFw_Di_Enum_Lifestyle.SINGLETON: {
                    const key = buildKey(depId);
                    return singletonCache.has(key) ? 'hit' : 'miss';
                }
                case TeqFw_Di_Enum_Lifestyle.TRANSIENT:
                    return 'bypass';
                default:
                    throw new Error(`Unsupported Dependency Lifestyle: ${String(depId.lifestyle)}.`);
            }
        };

        /**
         * Returns a cached Singleton value or runs the cache-miss callback.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @param {() => unknown|Promise<unknown>} onMiss
         * @returns {Promise<unknown>}
         */
        this.apply = async function (depId, onMiss) {
            switch (depId.lifestyle) {
                case TeqFw_Di_Enum_Lifestyle.DIRECT:
                    if (log) log.log(`Lifecycle.apply: lifestyle='${depId.lifestyle}' cache=bypass.`);
                    return onMiss();
                case TeqFw_Di_Enum_Lifestyle.SINGLETON: {
                    const key = buildKey(depId);
                    if (singletonCache.has(key)) {
                        if (log) log.log(`Lifecycle.cache: hit key='${key}'.`);
                        return singletonCache.get(key);
                    }
                    if (log) log.log(`Lifecycle.cache: miss key='${key}', create.`);
                    const created = await onMiss();
                    singletonCache.set(key, created);
                    if (log) log.log(`Lifecycle.cache: stored key='${key}'.`);
                    return created;
                }
                case TeqFw_Di_Enum_Lifestyle.TRANSIENT:
                    if (log) log.log(`Lifecycle.apply: lifestyle='${depId.lifestyle}' cache=bypass.`);
                    return onMiss();
                default:
                    throw new Error(`Unsupported Dependency Lifestyle: ${String(depId.lifestyle)}.`);
            }
        };
    }
}
