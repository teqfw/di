// @ts-check

/**
 * @namespace TeqFw_Di_Container_Producer
 * @description Invokes callable or constructable dependency producers.
 */

/** @typedef {(deps: object) => unknown} TeqFw_Di_Container_Producer_Callable */
/** @typedef {new (deps: object) => unknown} TeqFw_Di_Container_Producer_Constructable */
/** @typedef {TeqFw_Di_Container_Producer_Callable|TeqFw_Di_Container_Producer_Constructable} TeqFw_Di_Container_Producer_Value */

/**
 * Owns producer dispatch only. Export Selection remains visible in Resolution
 * before this component is called.
 */
export default class TeqFw_Di_Container_Producer {
    constructor() {
        /**
         * @param {Function} value
         * @returns {value is TeqFw_Di_Container_Producer_Constructable}
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
         * Invokes one selected producer with resolved children.
         *
         * @param {unknown} selected
         * @param {Record<string, unknown>} resolvedDeps
         * @returns {unknown}
         */
        this.produce = function (selected, resolvedDeps) {
            if (typeof selected !== 'function') {
                throw new Error('Producer requires a callable export.');
            }
            /** @type {TeqFw_Di_Container_Producer_Value} */
            const producer = /** @type {TeqFw_Di_Container_Producer_Value} */ (selected);
            /** @type {unknown} */
            let result;
            if (isConstructible(producer)) {
                /** @type {TeqFw_Di_Container_Producer_Constructable} */
                const Constructor = producer;
                result = new Constructor(resolvedDeps);
            } else {
                /** @type {TeqFw_Di_Container_Producer_Callable} */
                const callable = producer;
                result = callable(resolvedDeps);
            }
            if (result instanceof Promise) {
                throw new Error('Producer must return synchronously (non-Promise).');
            }
            return result;
        };
    }
}
