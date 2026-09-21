// @ts-check

/**
 * @namespace TeqFw_Di_Enum_ResolutionStage
 * @description Closed vocabulary for stable resolution failure stages.
 */

/**
 * Canonical stage values used by failure observation and Container state.
 */
const TeqFw_Di_Enum_ResolutionStage = {
    IDENTIFIER_PARSING: 'identifier parsing',
    PREPROCESSING: 'preprocessing',
    CYCLE_DETECTION: 'cycle detection',
    SINGLETON_CACHE_LOOKUP: 'Singleton cache lookup',
    TEST_SUBSTITUTION: 'test substitution',
    ROUTE_SELECTION: 'route selection',
    MODULE_LOADING: 'module loading',
    EXPORT_SELECTION: 'Export Selection',
    PRODUCER_ACQUISITION: 'producer acquisition',
    CHILD_DEPENDENCY_RESOLUTION: 'child dependency resolution',
    PRODUCER_INVOCATION: 'producer invocation',
    DIRECT_ACQUISITION: 'Direct acquisition',
    POSTPROCESSOR_EXECUTION: 'Postprocessor execution',
    WRAPPER_EXECUTION: 'Wrapper execution',
    HARDENING: 'hardening',
    VALUE_EXPOSURE: 'value exposure',
    CONTAINER_STATE: 'Container state',
};

export default Object.freeze(TeqFw_Di_Enum_ResolutionStage);
