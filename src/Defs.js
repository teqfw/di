/**
 * Hardcoded constants and useful utilities for the package.
 * @namespace TeqFw_Di_Defs
 */
export default {
    COMP_A: 'A', // composition: as-is
    COMP_F: 'F', // composition: factory
    ID: 'container', // default ID for container itself
    ID_FQN: 'TeqFw_Di_Container$', // default Full Qualified Name for container itself
    LIFE_I: 'I', // lifestyle: instance
    LIFE_S: 'S', // lifestyle: singleton

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