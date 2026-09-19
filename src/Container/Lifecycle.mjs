// @ts-check

/**
 * @namespace TeqFw_Di_Container_Lifecycle
 * @description Singleton cache policy for final managed values.
 */

import TeqFw_Di_Enum_Life from '../Enum/Life.mjs';
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
        /** @type {Map<string, Promise<unknown>>} */
        const pendingSingletons = new Map();
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
         * @returns {'bypass'|'hit'|'pending'|'miss'}
         */
        this.lookup = function (depId) {
            if (depId.life !== TeqFw_Di_Enum_Life.SINGLETON) return 'bypass';
            const key = buildKey(depId);
            if (singletonCache.has(key)) return 'hit';
            if (pendingSingletons.has(key)) return 'pending';
            return 'miss';
        };

        /**
         * Returns a cached Singleton value or runs the cache-miss callback.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @param {() => unknown|Promise<unknown>} onMiss
         * @returns {Promise<unknown>}
         */
        this.apply = async function (depId, onMiss) {
            if (depId.life !== TeqFw_Di_Enum_Life.SINGLETON) {
                if (log) log.log(`Lifecycle.apply: life='${String(depId.life)}' cache=skip.`);
                return onMiss();
            }

            /** @type {string} */
            const key = buildKey(depId);
            if (singletonCache.has(key)) {
                if (log) log.log(`Lifecycle.cache: hit key='${key}'.`);
                return singletonCache.get(key);
            }
            if (pendingSingletons.has(key)) {
                if (log) log.log(`Lifecycle.cache: pending key='${key}'.`);
                return /** @type {Promise<unknown>} */ (pendingSingletons.get(key));
            }

            if (log) log.log(`Lifecycle.cache: miss key='${key}', create.`);
            const pending = Promise.resolve().then(onMiss);
            pendingSingletons.set(key, pending);
            try {
                const created = await pending;
                singletonCache.set(key, created);
                if (log) log.log(`Lifecycle.cache: stored key='${key}'.`);
                return created;
            } finally {
                pendingSingletons.delete(key);
            }
        };
    }
}
