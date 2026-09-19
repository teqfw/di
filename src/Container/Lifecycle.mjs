// @ts-check

/**
 * @namespace TeqFw_Di_Container_Lifecycle
 * @description Lifecycle policy cache for produced values.
 */

import TeqFw_Di_Enum_Life from '../Enum/Life.mjs';
import {buildDependencyKey} from '../Internal/DependencyKey.mjs';

/**
 * Lifecycle-stage registry for produced dependency values.
 *
 * Applies lifecycle caching policy to already instantiated values:
 * - singleton factory values are cached by structural DepId identity;
 * - transient values are never cached;
 * - as-is composition is returned as produced without lifecycle caching.
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
         * Returns value according to lifecycle policy.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @param {() => unknown|Promise<unknown>} producer
         * @returns {Promise<unknown>}
         */
        this.apply = async function (depId, producer) {
            if (depId.life !== TeqFw_Di_Enum_Life.SINGLETON) {
                if (log) log.log(`Lifecycle.apply: life='${String(depId.life)}' cache=skip.`);
                return producer();
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
            const pending = Promise.resolve().then(producer);
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
