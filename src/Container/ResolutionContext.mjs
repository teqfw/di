// @ts-check

/**
 * @namespace TeqFw_Di_Container_ResolutionContext
 * @description Immutable request-path context for container extension hooks.
 */

/**
 * Creates immutable provenance for one dependency request on a graph path.
 *
 * @param {TeqFw_Di_Dto_DepId} depId
 * @param {readonly TeqFw_Di_Dto_DepId[]} ancestors
 * @returns {TeqFw_Di_Container_ResolutionContext}
 */
export function createResolutionContext(depId, ancestors) {
    /** @type {readonly TeqFw_Di_Dto_DepId[]} */
    const stack = Object.freeze([...ancestors, depId]);
    return Object.freeze({
        depId,
        root: stack[0],
        parent: stack.length > 1 ? stack[stack.length - 2] : null,
        stack,
    });
}
