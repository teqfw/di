/**
 * Hardcoded constants and useful utilities for the package.
 * @namespace TeqFw_Di_Defs
 */
export default {
    CA: 'A', // composition: as-is
    CF: 'F', // composition: factory
    // TODO: we don't need an access to the container itself.
    ID: 'container', // default ID for container itself
    ID_FQN: 'TeqFw_Di_Container$', // default Full Qualified Name for container itself
    LI: 'I', // lifestyle: instance
    LS: 'S', // lifestyle: singleton

    /**
     * Return 'true' if function is a class definition.
     * See: https://stackoverflow.com/a/29094018/4073821
     *
     * @param {function} fn
     * @returns {boolean}
     */
    isClass(fn) {
        const proto = Object.getOwnPropertyDescriptor(fn, 'prototype');
        return proto && !proto.writable;
    },
};