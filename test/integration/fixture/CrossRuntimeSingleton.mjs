let calls = 0;

/** @returns {{kind: string, call: number}} */
export default function Fx_CrossRuntimeSingleton() {
    return {kind: 'singleton', call: ++calls};
}

/** @param {Record<string, unknown>} value */
export function wrapTag(value) {
    return {...value, wrapped: true};
}
