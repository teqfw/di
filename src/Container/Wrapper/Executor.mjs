// @ts-check

/**
 * Wrapper-stage executor.
 *
 * Executes wrapper pipeline declared in `depId.wrappers` using functions
 * exported by the resolved module namespace.
 */
export default class TeqFw_Di_Container_Wrapper_Executor {

    /**
     * Creates wrapper executor instance.
     */
    constructor() {
        /**
         * Detects Promise-like asynchronous return values.
         *
         * @param {unknown} value
         * @returns {boolean}
         */
        const isThenable = function (value) {
            if ((value === null) || (value === undefined)) return false;
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return false;
            /** @type {{ then?: unknown }} */
            const maybeThenable = value;
            return (typeof maybeThenable.then === 'function');
        };

        /**
         * Narrows unknown export to unary wrapper callable.
         *
         * @param {unknown} value
         * @returns {value is (value: unknown) => unknown}
         */
        const isWrapper = function (value) {
            return (typeof value === 'function');
        };

        /**
         * Applies wrappers in declaration order.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @param {unknown} value
         * @param {object} moduleNamespace
         * @returns {unknown}
         */
        this.execute = function (depId, value, moduleNamespace) {
            /** @type {unknown} */
            let current = value;
            const wrappers = depId.wrappers;

            for (const name of wrappers) {
                if (!(name in moduleNamespace)) {
                    throw new Error(`Wrapper '${name}' is not found in module namespace.`);
                }
                /** @type {unknown} */
                const candidate = moduleNamespace[name];
                if (!isWrapper(candidate)) {
                    throw new Error(`Wrapper '${name}' must be callable.`);
                }
                current = candidate(current);
                if (isThenable(current)) {
                    throw new Error(`Wrapper '${name}' must return synchronously (non-thenable).`);
                }
            }

            return current;
        };
    }
}
