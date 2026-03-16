// @ts-check

import TeqFw_Di_Enum_Composition from '../../Enum/Composition.mjs';

/**
 * Instantiate-stage immutable core executor.
 *
 * Performs export selection and composition execution only,
 * using already resolved dependency values.
 */

/**
 * @typedef {(deps: object) => unknown} CallableFactory
 */

/**
 * @typedef {new (deps: object) => unknown} ConstructableFactory
 */

/**
 * @typedef {CallableFactory | ConstructableFactory} Factory
 */
export default class TeqFw_Di_Container_Instantiate_Instantiator {

    /**
     * Creates instantiator instance.
     */
    constructor() {

        /**
         * Selects the value used by composition.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @param {object} moduleNamespace
         * @returns {Factory}
         */
        const selectExport = function (depId, moduleNamespace) {
            if (depId.exportName === null) {
                return moduleNamespace;
            }

            if (!(depId.exportName in moduleNamespace)) {
                throw new Error(
                    `Export '${depId.exportName}' is not found in module namespace.`
                );
            }

            return moduleNamespace[depId.exportName];
        };

        /**
         * Determines whether a callable supports construction with `new`.
         *
         * @param {Function} value
         * @returns {value is ConstructableFactory}
         */
        const isConstructible = function (value) {
            try {
                Reflect.construct(String, [], value);
                return true;
            } catch {
                return false;
            }
        };

        /**
         * Produces a value from a resolved module namespace and dependency map.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @param {object} moduleNamespace
         * @param {Record<string, unknown>} resolvedDeps
         * @returns {unknown}
         */
        this.instantiate = function (depId, moduleNamespace, resolvedDeps) {
            /** @type {Factory} */
            const selected = selectExport(depId, moduleNamespace);

            if (depId.composition === TeqFw_Di_Enum_Composition.AS_IS) {
                return selected;
            }

            if (depId.composition === TeqFw_Di_Enum_Composition.FACTORY) {

                if (typeof selected !== 'function') {
                    throw new Error(
                        'Factory composition requires a callable export.'
                    );
                }

                /** @type {Factory} */
                const factory = selected;

                /** @type {unknown} */
                let result;

                if (isConstructible(factory)) {
                    /** @type {ConstructableFactory} */
                    const Ctor = factory;
                    result = new Ctor(resolvedDeps);
                } else {
                    /** @type {CallableFactory} */
                    const Fn = factory;
                    result = Fn(resolvedDeps);
                }

                if (result instanceof Promise) {
                    throw new Error(
                        'Factory composition must return synchronously (non-Promise).'
                    );
                }

                return result;
            }

            throw new Error(
                `Unsupported composition mode: ${String(depId.composition)}.`
            );
        };
    }
}
