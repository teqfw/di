export default function Fx_AliasOne() {
    return {source: 'alias-one'};
}

/**
 * @param {Record<string, unknown>} value
 * @returns {Record<string, unknown>}
 */
export function wrapTag(value) {
    return {...value, wrapped: true};
}
