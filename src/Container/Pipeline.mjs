// @ts-check

/**
 * @namespace TeqFw_Di_Container_Pipeline
 * @description Internal resolution pipeline executor for the container entry point.
 */

import {buildDependencyKey} from '../Internal/DependencyKey.mjs';
import {readDepsDecl} from '../Internal/DepsDecl.mjs';
import {makePromiseSafe} from '../Internal/PromiseSafe.mjs';
import {createResolutionContext} from './ResolutionContext.mjs';

/**
 * @typedef {object} TeqFw_Di_Container_Pipeline_Context
 * @property {TeqFw_Di_Resolver|undefined} resolver
 * @property {TeqFw_Di_Container_Lifecycle|undefined} lifecycle
 * @property {TeqFw_Di_Container_Instantiate} instantiator
 * @property {TeqFw_Di_Container_Executor} wrapperExecutor
 * @property {TeqFw_Di_Internal_Logger_Contract} logger
 * @property {(value: unknown) => unknown} freeze
 * @property {(specifier: string, ancestors?: readonly TeqFw_Di_Dto_DepId[]) => {requested: TeqFw_Di_Dto_DepId, effective: TeqFw_Di_Dto_DepId}} canonicalize
 * @property {(depId: TeqFw_Di_Dto_DepId) => {found: boolean, value: unknown}} findMock
 * @property {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} applyPostprocess
 * @property {{record(kind: string, data: Record<string, unknown>): void}|null} [observer]
 */

/**
 * Converts an internal identity carrier into public-observation facts.
 *
 * @param {TeqFw_Di_Dto_DepId} depId
 * @returns {{addressKind: string, address: string, exportName: string|null, life: string|null, wrappers: string[], origin: string}}
 */
const describeDepId = function (depId) {
    return {
        addressKind: depId.platform,
        address: depId.moduleName,
        exportName: depId.exportName,
        life: depId.life,
        wrappers: [...depId.wrappers],
        origin: depId.origin,
    };
};

/**
 * Executes the full container pipeline for a Dependency Specifier.
 *
 * @param {TeqFw_Di_Container_Pipeline_Context} ctx
 * @param {string} specifier
 * @returns {Promise<any>}
 */
export async function executeContainerPipeline(ctx, specifier) {
    const {
        resolver,
        lifecycle,
        instantiator,
        wrapperExecutor,
        logger,
        freeze,
        canonicalize,
        findMock,
        applyPostprocess,
        observer = null,
    } = ctx;

    if (!resolver || !lifecycle) {
        throw new Error('Container infrastructure is not initialized.');
    }

    /** @type {Set<string>} */
    const active = new Set();
    /** @type {string[]} */
    const chain = [];

    /**
     * Records one best-effort structured observation without changing resolution.
     *
     * @param {string} kind
     * @param {Record<string, unknown>} data
     * @returns {void}
     */
    const observe = function (kind, data) {
        if (observer) observer.record(kind, data);
    };

    /**
     * Resolves one requested specifier through its effective identity.
     *
     * @param {string} requestedSpecifier
     * @param {readonly TeqFw_Di_Dto_DepId[]} ancestors
     * @param {string|null} parentKey
     * @param {string|null} dependencyName
     * @returns {Promise<unknown>}
     */
    const resolveOne = async function (requestedSpecifier, ancestors, parentKey, dependencyName) {
        const identifiers = canonicalize(requestedSpecifier, ancestors);
        const requested = identifiers.requested;
        const depId = identifiers.effective;
        const context = createResolutionContext(depId, ancestors);
        const key = buildDependencyKey(depId);
        const mock = findMock(depId);

        observe('identifier', {
            key,
            parentKey,
            dependencyName,
            requested: describeDepId(requested),
            effective: describeDepId(depId),
        });
        if (parentKey !== null) {
            observe('edge', {parentKey, childKey: key, dependencyName});
        }

        const cache = lifecycle.lookup(depId);
        observe('cache', {key, outcome: cache});
        logger.log(`Container.pipeline: cache:${cache} '${depId.platform}::${depId.moduleName}'.`);

        return lifecycle.apply(depId, async function () {
            if (active.has(key)) {
                throw new Error(`Cyclic dependency detected: ${[...chain, key].join(' -> ')}`);
            }
            active.add(key);
            chain.push(key);

            try {
                /** @type {object} */
                let namespace = {};
                /** @type {unknown} */
                let acquired;

                if (mock.found) {
                    observe('acquisition', {key, mode: 'test-substitution'});
                    logger.log(`Container.pipeline: mock-lookup:hit '${key}'.`);
                    if (depId.wrappers.length > 0) {
                        const resolved = await resolver.resolveWithDetails(depId);
                        namespace = resolved.namespace;
                        observe('route', {key, addressKind: depId.platform, moduleSpecifier: resolved.specifier, cache: resolved.cache});
                    }
                    acquired = mock.value;
                } else {
                    logger.log(`Container.pipeline: resolve:entry '${depId.platform}::${depId.moduleName}'.`);
                    const resolved = await resolver.resolveWithDetails(depId);
                    namespace = resolved.namespace;
                    observe('route', {key, addressKind: depId.platform, moduleSpecifier: resolved.specifier, cache: resolved.cache});
                    observe('export', {key, exportName: depId.exportName});

                    /** @type {Record<string, unknown>} */
                    const dependencies = {};
                    if (depId.life !== null) {
                        observe('acquisition', {key, mode: 'producer'});
                        const declared = readDepsDecl(namespace, depId);
                        for (const [name, childSpecifier] of Object.entries(declared)) {
                            dependencies[name] = await resolveOne(
                                /** @type {string} */ (childSpecifier),
                                context.stack,
                                key,
                                name
                            );
                        }
                    } else {
                        observe('acquisition', {key, mode: 'direct'});
                    }

                    acquired = instantiator.instantiate(depId, namespace, dependencies);
                }

                logger.log(`Container.pipeline: postprocess:entry '${depId.platform}::${depId.moduleName}'.`);
                const postprocessed = applyPostprocess(acquired, context);
                observe('postprocess', {key});
                const wrapped = wrapperExecutor.execute(depId, postprocessed, namespace);
                observe('wrappers', {key, wrappers: [...depId.wrappers]});
                const hardened = makePromiseSafe(freeze(wrapped));
                observe('hardening', {key});
                logger.log(`Container.pipeline: return:node '${depId.platform}::${depId.moduleName}'.`);
                return hardened;
            } finally {
                chain.pop();
                active.delete(key);
            }
        });
    };

    try {
        logger.log(`Container.get: specifier='${specifier}'.`);
        return makePromiseSafe(await resolveOne(specifier, [], null, null));
    } catch (error) {
        logger.error('Container.pipeline: failed.', error);
        observe('failure', {
            message: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
