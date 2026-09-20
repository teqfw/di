// @ts-check

/**
 * @namespace TeqFw_Di_Enum_ObservationEvent
 * @description Structured observation event kind constants.
 */

/**
 * Closed vocabulary for events emitted by the active resolution pipeline.
 */
const TeqFw_Di_Enum_ObservationEvent = {
    REQUESTED: 'requested',
    PREPROCESS: 'preprocess',
    EFFECTIVE: 'effective',
    CACHE: 'cache',
    ROUTE: 'route',
    EXPORT: 'export',
    ACQUISITION: 'acquisition',
    CHILD: 'child',
    PRODUCER_INVOCATION: 'producer invocation',
    POSTPROCESS: 'postprocess',
    WRAPPERS: 'wrappers',
    HARDENING: 'hardening',
    FAILURE: 'failure',
    STATE: 'state',
};

export default Object.freeze(TeqFw_Di_Enum_ObservationEvent);
