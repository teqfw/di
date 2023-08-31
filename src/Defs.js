/**
 * Hardcoded constants and useful utilities for the package.
 * @namespace TeqFw_Di_Defs
 */
export default {
    COMPOSE_AS_IS: 'A',
    COMPOSE_FACTORY: 'F',
    EXT: 'js',
    KEY_CONTAINER: 'container',
    KEY_CONTAINER_NS: 'TeqFw_Di_Container$',
    LIFE_INSTANCE: 'I',
    LIFE_SINGLETON: 'S',
    WRAP_PROXY: 'proxy', // TODO: move to the PostProcessor

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