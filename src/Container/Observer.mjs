// @ts-check

/**
 * @namespace TeqFw_Di_Container_Observer
 * @description Structured observation session with non-interfering operations.
 */

import TeqFw_Di_Enum_ObservationEvent from '../Enum/ObservationEvent.mjs';

/** @typedef {{index: number, kind: string, [key: string]: unknown}} TeqFw_Di_Container_Observer_TraceEvent */
/** @typedef {'Configurable'|'Resolving'|'Resolved'|'Failed'} TeqFw_Di_Container_State */

/**
 * @typedef {object} TeqFw_Di_Container_Observer_Contract
 * @property {(data: Record<string, unknown>) => void} addNode
 * @property {(data: Record<string, unknown>) => void} addEdge
 * @property {(kind: string, data: Record<string, unknown>) => void} record
 * @property {(outcome: 'success'|'failure', state: TeqFw_Di_Container_State) => void} complete
 * @property {() => object|null} getSnapshot
 */

/**
 * Executes one observer operation without allowing diagnostic failure to cross
 * into resolution. This is the only observation non-interference boundary.
 *
 * @param {() => void} operation
 * @returns {void}
 */
const safely = function (operation) {
    try {
        operation();
    } catch {
        // Observation is diagnostic and cannot change resolution semantics.
    }
};

/**
 * Wraps any observer implementation with the non-interference contract.
 *
 * @param {TeqFw_Di_Container_Observer_Contract} observer
 * @returns {TeqFw_Di_Container_Observer_Contract}
 */
const protectObserver = function (observer) {
    return {
        addNode(data) {
            safely(() => observer.addNode(data));
        },
        addEdge(data) {
            safely(() => observer.addEdge(data));
        },
        record(kind, data) {
            safely(() => observer.record(kind, data));
        },
        complete(outcome, state) {
            safely(() => observer.complete(outcome, state));
        },
        getSnapshot() {
            return observer.getSnapshot();
        },
    };
}

/**
 * Creates a no-op observer for disabled introspection. It has the same contract
 * as a real session, so the resolution corridor contains no publication guards.
 *
 * @returns {TeqFw_Di_Container_Observer_Contract}
 */
export function createNoopObserver() {
    return {
        addNode() {},
        addEdge() {},
        record() {},
        complete() {},
        getSnapshot() {
            return null;
        },
    };
}

/**
 * Creates one graph, trace, and explanation session for a root request.
 *
 * @param {string} specifier
 * @returns {TeqFw_Di_Container_Observer_Contract}
 */
export function createObserver(specifier) {
    /** @type {object[]} */
    const nodes = [];
    /** @type {object[]} */
    const edges = [];
    /** @type {TeqFw_Di_Container_Observer_TraceEvent[]} */
    const trace = [];
    /** @type {Map<string, Record<string, unknown>>} */
    const resolutions = new Map();
    /** @type {object[]} */
    const stateTransitions = [];
    /** @type {object|null} */
    let failure = null;
    /** @type {object|null} */
    let snapshot = null;

    /**
     * Makes a recursively immutable observation copy.
     *
     * @param {unknown} value
     * @returns {unknown}
     */
    const copyObservation = function (value) {
        if (Array.isArray(value)) return Object.freeze(value.map(copyObservation));
        if ((value !== null) && (typeof value === 'object')) {
            /** @type {Record<string, unknown>} */
            const copy = {};
            for (const [key, item] of Object.entries(/** @type {Record<string, unknown>} */ (value))) {
                copy[key] = copyObservation(item);
            }
            return Object.freeze(copy);
        }
        return value;
    };

    /** @param {Record<string, unknown>} data @returns {void} */
    const addNode = function (data) {
        const payload = /** @type {Record<string, unknown>} */ (copyObservation(data));
        nodes.push(payload);
        const nodeId = /** @type {string} */ (payload.nodeId);
        resolutions.set(nodeId, {
            nodeId,
            key: payload.key,
            parentNodeId: payload.parentNodeId,
            dependencyName: payload.dependencyName,
            requested: payload.requested,
            effective: payload.effective,
            preprocessing: [],
            children: [],
        });
    };

    /** @param {Record<string, unknown>} data @returns {void} */
    const addEdge = function (data) {
        const payload = /** @type {Record<string, unknown>} */ (copyObservation(data));
        edges.push(payload);
        const parent = resolutions.get(/** @type {string} */ (payload.parentNodeId));
        if (parent) {
            /** @type {object[]} */
            const children = /** @type {object[]} */ (parent.children);
            children.push(Object.freeze({
                nodeId: payload.childNodeId,
                dependencyName: payload.dependencyName,
                requested: payload.requested,
                effective: payload.effective,
            }));
        }
    };

    /**
     * Records one event and updates its explanation projection.
     *
     * @param {string} kind
     * @param {Record<string, unknown>} data
     * @returns {void}
     */
    const record = function (kind, data) {
        const payload = /** @type {Record<string, unknown>} */ (copyObservation(data));
        trace.push(Object.freeze({index: trace.length, kind, ...payload}));
        if (kind === TeqFw_Di_Enum_ObservationEvent.STATE) {
            stateTransitions.push(Object.freeze({...payload}));
            return;
        }
        const nodeId = payload.nodeId;
        const resolution = typeof nodeId === 'string' ? resolutions.get(nodeId) : undefined;
        if (kind === TeqFw_Di_Enum_ObservationEvent.FAILURE) {
            const entry = Object.freeze({
                nodeId: payload.nodeId ?? null,
                key: payload.key ?? null,
                stage: payload.stage ?? null,
                cause: payload.cause ?? payload.message ?? null,
            });
            if (resolution) resolution.failure = entry;
            if (failure === null) failure = entry;
            return;
        }
        if (!resolution) return;
        if (kind === TeqFw_Di_Enum_ObservationEvent.PREPROCESS) {
            /** @type {object[]} */
            const preprocessing = /** @type {object[]} */ (resolution.preprocessing);
            preprocessing.push(Object.freeze({
                index: payload.index,
                before: payload.before,
                after: payload.after,
                changed: payload.changed,
            }));
        } else if (kind === TeqFw_Di_Enum_ObservationEvent.CACHE) {
            resolution.cache = payload.outcome;
        } else if (kind === TeqFw_Di_Enum_ObservationEvent.ROUTE) {
            resolution.route = Object.freeze({
                addressKind: payload.addressKind,
                moduleSpecifier: payload.moduleSpecifier,
                ...(payload.mapping ? {mapping: payload.mapping} : {}),
            });
        } else if (kind === TeqFw_Di_Enum_ObservationEvent.EXPORT) {
            resolution.exportName = payload.exportName;
        } else if (kind === TeqFw_Di_Enum_ObservationEvent.ACQUISITION) {
            resolution.acquisition = payload.mode;
        } else if (kind === TeqFw_Di_Enum_ObservationEvent.POSTPROCESS) {
            resolution.postprocessors = payload.count;
        } else if (kind === TeqFw_Di_Enum_ObservationEvent.WRAPPERS) {
            resolution.wrappers = payload.wrappers;
        } else if (kind === TeqFw_Di_Enum_ObservationEvent.HARDENING) {
            resolution.hardening = Object.freeze({mode: payload.mode});
        }
    };

    /**
     * Completes and freezes the public projections.
     *
     * @param {'success'|'failure'} outcome
     * @param {TeqFw_Di_Container_State} state
     * @returns {void}
     */
    const complete = function (outcome, state) {
        snapshot = Object.freeze({
            graph: Object.freeze({
                nodes: Object.freeze([...nodes]),
                edges: Object.freeze([...edges]),
            }),
            trace: Object.freeze([...trace]),
            explanation: Object.freeze({
                requestedSpecifier: specifier,
                outcome,
                containerState: state,
                stateTransitions: Object.freeze([...stateTransitions]),
                resolutions: Object.freeze([...resolutions.values()].map(copyObservation)),
                ...(failure ? {failure} : {}),
            }),
        });
    };

    /** @returns {object|null} */
    const getSnapshot = function () {
        return snapshot;
    };

    return protectObserver({addNode, addEdge, record, complete, getSnapshot});
}
