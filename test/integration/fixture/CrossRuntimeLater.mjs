const state = /** @type {any} */ (globalThis).__teqfwDiCrossRuntime ??= {queue: []};

/** @returns {{kind: string, call: number}} */
export default function Fx_CrossRuntimeLater() {
    state.queue.push('get');
    return {kind: 'queued-get', call: 1};
}
