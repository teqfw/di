/** @typedef {(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId} Preprocessor */
/** @typedef {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} Postprocessor */

/** Controlled observations, reset by each integration scenario. */
export const effects = {
    /** @type {TeqFw_Di_Container_ResolutionContext[]} */
    preprocessing: [],
    /** @type {TeqFw_Di_Container_ResolutionContext[]} */
    postprocessing: [],
    /** @type {unknown} */
    hardened: undefined,
    postprocessCalls: 0,
    hardeningCalls: 0,
    /** @type {(() => Promise<unknown>)|null} */
    enqueue: null,
    /** @type {Promise<unknown>|null} */
    queuedEntry: null,
    /** @type {string[]} */
    queueEvents: [],
};

export function resetEffects() {
    effects.preprocessing.length = 0;
    effects.postprocessing.length = 0;
    effects.hardened = undefined;
    effects.postprocessCalls = 0;
    effects.hardeningCalls = 0;
    effects.enqueue = null;
    effects.queuedEntry = null;
    effects.queueEvents.length = 0;
}

/** @returns {Preprocessor} */
export const RecordPreprocessing = () => (depId, context) => {
    effects.preprocessing.push(context);
    return depId;
};

/** @returns {Postprocessor} */
export const RecordPostprocessing = () => (value, context) => {
    effects.postprocessing.push(context);
    return value;
};

/** @returns {Preprocessor} */
export const SelectSharedByParent = () => (depId, context) =>
    depId.address === 'Fx_ContextShared' && context.parent?.address === 'Fx_ContextRight'
        ? {...depId, address: 'Fx_ContextAlternativeShared'} : depId;

/** @returns {Postprocessor} */
export const AddParentPosition = () => (value, context) => {
    effects.postprocessing.push(context);
    return ['Fx_ContextLeft', 'Fx_ContextRight'].includes(context.depId.address)
        ? {.../** @type {object} */ (value), postPosition: context.parent?.address} : value;
};

/** @returns {Preprocessor} */
export const SelectTransient = () => (depId) => ({...depId, address: depId.address.replace('Singleton', 'Transient')});

/** @returns {Postprocessor} */
export const FirstStep = () => (value) => ({.../** @type {object} */ (value), steps: [...(/** @type {{steps?: string[]}} */ (value).steps ?? []), 'post1']});
/** @returns {Postprocessor} */
export const SecondStep = () => (value) => ({.../** @type {object} */ (value), steps: [.../** @type {{steps: string[]}} */ (value).steps, 'post2']});

/** @returns {Preprocessor} */
export const ObservedAliases = () => (depId) => ({...depId, address: depId.address.startsWith('Fx_Alias') ? 'Fx_ObservedSingleton' : depId.address});
/** @returns {Preprocessor} */
export const NpmAliases = () => (depId) => depId.address.startsWith('Fx_NpmAlias')
    ? {...depId, addressKind: 'npm', address: '@teqfw/di', exportName: 'default'} : depId;
/** @returns {Preprocessor} */
export const GraphAlias = () => (depId) => ({...depId, address: depId.address === 'Fx_AliasGraphRoot' ? 'Fx_GraphRoot' : depId.address});
/** @returns {Preprocessor} */
export const NodeAlias = () => (depId) => depId.address === 'Fx_NodeAlias'
    ? {...depId, addressKind: 'node', address: 'path', exportName: 'basename', lifestyle: 'D'} : depId;
/** @returns {Preprocessor} */
export const NpmAlias = () => (depId) => depId.address === 'Fx_NpmAlias'
    ? {...depId, addressKind: 'npm', address: '@teqfw/di', exportName: 'default', lifestyle: 'D'} : depId;
/** @returns {Preprocessor} */
export const MockAlias = () => (depId) => depId.address === 'Fx_AliasForMock' ? {...depId, address: 'Fx_Root'} : depId;
/** @returns {Preprocessor} */
export const BrokenRegistration = () => (depId) => {
    if (depId.address === 'Fx_BrokenSubstitution') throw new Error('registered substitution canonicalization failed');
    return depId;
};
/** @returns {Preprocessor} */
export const BadChild = () => (depId) => ({...depId, address: depId.address === 'Fx_Child' ? 'Fx_BadExport' : depId.address});
/** @returns {Preprocessor} */
export const FailPreprocessingOnce = () => {
    let failed = false;
    return (depId) => {
        if (!failed) { failed = true; throw new Error('preprocess failed'); }
        return depId;
    };
};
/** @returns {Postprocessor} */
export const FailPostprocessingOnce = () => {
    let failed = false;
    return (value) => {
        if (!failed) { failed = true; throw new Error('postprocessor failure'); }
        return value;
    };
};

/** @param {string} address @returns {Postprocessor} */
const adaptTarget = (address) => (value, context) => {
    if (context.depId.address !== address) return value;
    effects.postprocessCalls += 1;
    return {.../** @type {object} */ (value), steps: [.../** @type {{steps: string[]}} */ (value).steps, 'postprocessor']};
};
/** @returns {Postprocessor} */
export const AdaptObserved = () => adaptTarget('Fx_ObservedSingleton');
/** @returns {Postprocessor} */
export const AdaptMock = () => adaptTarget('Fx_MockTarget');
/** @returns {Postprocessor} */
export const AdaptUnresolved = () => adaptTarget('NoRoute_Unresolvable');

/** @returns {(value: unknown) => unknown} */
export const FreezeSelected = () => (value) => {
    if (value !== null && typeof value === 'object' && 'steps' in value && /** @type {{steps: string[]}} */ (value).steps.includes('postprocessor')) {
        effects.hardeningCalls += 1;
    }
    return Object.freeze(value);
};
/** @returns {(value: unknown) => unknown} */
export const RecordHardening = () => (value) => {
    effects.hardeningCalls += 1;
    effects.hardened = value;
    return Object.freeze(value);
};
/** @returns {(value: unknown) => unknown} */
export const IdentityHardener = () => (value) => {
    effects.hardened = value;
    return value;
};
/** @returns {(value: unknown) => unknown} */
export const HostileHardener = () => () => new Proxy({}, {
    get(target, property, receiver) {
        if (property === 'then') throw new Error('then access is blocked');
        return Reflect.get(target, property, receiver);
    },
});
/** @returns {Postprocessor} */
export const ReplaceNamespace = () => () => ({kind: 'replacement'});

/** @returns {Postprocessor} */
export const EnqueueEntry = () => (value) => {
    if (effects.enqueue && effects.queuedEntry === null) {
        effects.queueEvents.push('hook-start');
        effects.queuedEntry = effects.enqueue();
        effects.queueEvents.push('hook-end');
    } else if (effects.queuedEntry !== null) {
        effects.queueEvents.push('queued-entry');
    }
    return value;
};
