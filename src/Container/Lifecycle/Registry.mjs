// @ts-check

import TeqFw_Di_Enum_Composition from '../../Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../Enum/Life.mjs';

/**
 * Lifecycle-stage registry for produced dependency values.
 *
 * Applies lifecycle caching policy to already instantiated values:
 * - singleton factory values are cached by structural DepId identity;
 * - transient values are never cached;
 * - as-is composition is returned as produced without lifecycle caching.
 */
export default class TeqFw_Di_Container_Lifecycle_Registry {

    /**
     * Creates lifecycle registry instance.
     */
    constructor(logger = null) {
        /** @type {Map<string, unknown>} */
        const singletonCache = new Map();
        /** @type {{log(message: string): void}|null} */
        const log = logger;

        /**
         * Builds deterministic cache key from structural DepId fields.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @returns {string}
         */
        const buildKey = function (depId) {
            /** @type {string} */
            const wrappers = Array.isArray(depId.wrappers) ? depId.wrappers.join('|') : '';
            return [
                depId.platform,
                depId.moduleName,
                depId.exportName === null ? '' : depId.exportName,
                depId.composition,
                depId.life === null ? '' : depId.life,
                wrappers,
            ].join('::');
        };

        /**
         * Returns value according to lifecycle policy.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @param {() => unknown} producer
         * @returns {unknown}
         */
        this.apply = function (depId, producer) {
            if (depId.composition !== TeqFw_Di_Enum_Composition.FACTORY) {
                if (log) log.log(`Lifecycle.apply: composition='${depId.composition}' cache=skip.`);
                return producer();
            }

            if (depId.life === TeqFw_Di_Enum_Life.TRANSIENT) {
                if (log) log.log('Lifecycle.apply: transient cache=skip.');
                return producer();
            }

            if (depId.life === TeqFw_Di_Enum_Life.SINGLETON) {
                /** @type {string} */
                const key = buildKey(depId);
                if (singletonCache.has(key)) {
                    if (log) log.log(`Lifecycle.cache: hit key='${key}'.`);
                    return singletonCache.get(key);
                }
                if (log) log.log(`Lifecycle.cache: miss key='${key}', create.`);
                /** @type {unknown} */
                const created = producer();
                singletonCache.set(key, created);
                if (log) log.log(`Lifecycle.cache: stored key='${key}'.`);
                return created;
            }

            if (log) log.log('Lifecycle.apply: no lifecycle marker cache=skip.');
            return producer();
        };
    }
}
