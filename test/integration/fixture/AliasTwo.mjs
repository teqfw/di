export default function Fx_AliasTwo() {
    return {source: 'alias-two'};
}

/**
 * @param {Record<string, unknown>} value
 * @returns {Record<string, unknown>}
 */
export function wrapTag(value) {
    return {...value, wrapped: true};
}
