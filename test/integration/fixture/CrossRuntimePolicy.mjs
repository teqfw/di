/** @returns {(depId: any) => any} */
export function Alias() {
    return (depId) => depId.address === 'Fx_CrossRuntimeAlias' ? {...depId, address: 'Fx_CrossRuntimeSingleton'} : depId;
}

/** @returns {(value: any) => any} */
export function Adapt() {
    return (value) => value !== null && typeof value === 'object' ? {...value, adapted: true} : value;
}
