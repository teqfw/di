export const __deps__ = {
    singletonA: 'Fx_ObservedSingleton$_wrapTag',
    singletonB: 'Fx_ObservedSingleton$_wrapTag',
    transientA: 'Fx_Transient$$',
    transientB: 'Fx_Transient$$',
    directA: 'Fx_DirectProducer__Callable',
    directB: 'Fx_DirectProducer__Callable',
    defaultA: 'Fx_SharedExports$',
    defaultB: 'Fx_SharedExports$',
    factoryA: 'Fx_SharedExports__Factory$',
    factoryB: 'Fx_SharedExports__Factory$',
    wrappedA: 'Fx_Wrapped$_wrapFirst_wrapSecond',
    wrappedB: 'Fx_Wrapped$_wrapFirst_wrapSecond',
    wrappedC: 'Fx_Wrapped$_wrapSecond_wrapFirst',
    aliasOne: 'Fx_AliasOne$_wrapTag',
    aliasTwo: 'Fx_AliasTwo$_wrapTag',
    npmAliasOne: 'Fx_NpmAliasOne$',
    npmAliasTwo: 'Fx_NpmAliasTwo$',
    mockA: 'Fx_MockTarget$_wrapFirst',
    mockB: 'Fx_MockTarget$_wrapFirst',
};

/**
 * Root fixture whose child declarations expose repeated dependency semantics
 * inside one Container-owned graph.
 *
 * @param {Record<string, unknown>} deps
 * @returns {Record<string, unknown>}
 */
export default function Fx_GraphLifestyle(deps) {
    return deps;
}
