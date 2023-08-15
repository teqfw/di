/**
 * Hardcoded constants for the package.
 */
export default {
    COMPOSE_AS_IS: 'A',
    COMPOSE_FACTORY: 'F',
    KEY_CONTAINER: '__container',
    LIFE_INSTANCE: 'I',
    LIFE_SINGLETON: 'S',

    /**
     * Return 'true' if function is a class definition.
     * See: https://stackoverflow.com/a/29094018/4073821
     *
     * @param {function} fn
     * @return {boolean}
     */
    isClass(fn) {
        const proto = Object.getOwnPropertyDescriptor(fn, 'prototype');
        return proto && !proto.writable;
    },
};