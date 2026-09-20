// @ts-check

/**
 * @namespace TeqFw_Di_Container_Instantiate
 * @description Instantiates selected exports using composition rules.
 */

/**
 * Instantiate-stage immutable core executor.
 *
 * Separates Export Selection from producer invocation so the pipeline can
 * prove an export exists before it enters the producer corridor.
 */

/**
 * @typedef {(deps: object) => unknown} CallableProducer
 */

/**
 * @typedef {new (deps: object) => unknown} ConstructableProducer
 */

/**
 * @typedef {CallableProducer | ConstructableProducer} Producer
 */
export default class TeqFw_Di_Container_Instantiate {

    /**
     * Creates instantiator instance.
     */
    constructor() {

        /**
         * Selects the requested export from one loaded module namespace.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @param {object} moduleNamespace
         * @returns {unknown}
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

            return /** @type {Record<string, unknown>} */ (moduleNamespace)[depId.exportName];
        };

        /**
         * Determines whether a callable supports construction with `new`.
         *
         * @param {Function} value
         * @returns {value is ConstructableProducer}
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
         * Selects one export before lifestyle-specific acquisition begins.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @param {object} moduleNamespace
         * @returns {unknown}
         */
        this.select = function (depId, moduleNamespace) {
            return selectExport(depId, moduleNamespace);
        };

        /**
         * Produces a value from one already selected producer and dependency map.
         *
         * @param {unknown} selected
         * @param {Record<string, unknown>} resolvedDeps
         * @returns {unknown}
         */
        this.produce = function (selected, resolvedDeps) {
            if (typeof selected !== 'function') {
                throw new Error(
                    'Producer composition requires a callable export.'
                );
            }

            /** @type {Producer} */
            const producer = /** @type {Producer} */ (selected);

            /** @type {unknown} */
            let result;

            if (isConstructible(producer)) {
                /** @type {ConstructableProducer} */
                const Ctor = producer;
                result = new Ctor(resolvedDeps);
            } else {
                /** @type {CallableProducer} */
                const Fn = producer;
                result = Fn(resolvedDeps);
            }

            if (result instanceof Promise) {
                throw new Error(
                    'Producer composition must return synchronously (non-Promise).'
                );
            }

            return result;
        };
    }
}
