let calls = 0;

/** @returns {{kind: string, call: number}} */
export default function Fx_CrossRuntimeDirect() {
    return {kind: 'direct', call: ++calls};
}
