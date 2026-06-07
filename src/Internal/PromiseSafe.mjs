// @ts-check

/**
 * @namespace TeqFw_Di_Internal_PromiseSafe
 * @description Helper for protecting async return values from unsafe `then` access.
 */

/** @type {WeakMap<object, object>} */
const cache = new WeakMap();

/**
 * Returns a value that is safe to hand to an async caller.
 *
 * If a proxy throws on `then` access, the value is wrapped in a proxy that
 * hides `then` while preserving all other property access.
 *
 * @param {unknown} value Input value.
 * @returns {unknown} Promise-safe value.
 */
export function makePromiseSafe(value) {
    if ((value === null) || (value === undefined)) return value;
    const type = typeof value;
    if ((type !== 'object') && (type !== 'function')) return value;
    const obj = /** @type {object} */ (value);
    if (cache.has(obj)) return cache.get(obj);
    try {
        void Reflect.get(obj, 'then');
        return value;
    } catch {
        const wrapped = new Proxy(obj, {
            get(target, property, receiver) {
                if (property === 'then') return undefined;
                return Reflect.get(target, property, receiver);
            },
        });
        cache.set(obj, wrapped);
        return wrapped;
    }
}
