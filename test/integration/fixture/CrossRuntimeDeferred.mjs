const state = /** @type {any} */ (globalThis).__teqfwDiCrossRuntime ??= {queue: []};

/** @returns {{kind: string, call: number}} */
export default function Fx_CrossRuntimeDeferred() {
    state.queue.push('provider');
    return {kind: 'deferred-singleton', call: 1};
}
