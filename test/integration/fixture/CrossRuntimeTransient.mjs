let calls = 0;

/** @returns {{kind: string, call: number}} */
export default function Fx_CrossRuntimeTransient() {
    return {kind: 'transient', call: ++calls};
}
