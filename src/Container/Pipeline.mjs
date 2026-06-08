// @ts-check

/**
 * @namespace TeqFw_Di_Container_Pipeline
 * @description Internal resolution pipeline executor for the container entry point.
 */

import {buildDependencyKey} from '../Internal/DependencyKey.mjs';
import {readDepsDecl} from '../Internal/DepsDecl.mjs';
import {makePromiseSafe} from '../Internal/PromiseSafe.mjs';

/**
 * @typedef {object} TeqFw_Di_Container_Pipeline_Context
 * @property {TeqFw_Di_Parser} parser
 * @property {TeqFw_Di_Resolver|undefined} resolver
 * @property {TeqFw_Di_Container_Resolve_GraphResolver|undefined} graphResolver
 * @property {TeqFw_Di_Container_Lifecycle_Registry|undefined} lifecycle
 * @property {TeqFw_Di_Container_Instantiate_Instantiator} instantiator
 * @property {TeqFw_Di_Container_Wrapper_Executor} wrapperExecutor
 * @property {{log(message: string): void, error(message: string, error?: unknown): void}} logger
 * @property {boolean} testMode
 * @property {Map<string, unknown>} mockRegistry
 * @property {(value: unknown) => unknown} freeze
 * @property {(depId: TeqFw_Di_DepId__DTO) => TeqFw_Di_DepId__DTO} applyPreprocess
 * @property {(value: unknown) => unknown} applyPostprocess
 */

/**
 * Executes full container get pipeline for a CDC.
 *
 * @param {TeqFw_Di_Container_Pipeline_Context} ctx
 * @param {string} cdc
 * @returns {Promise<any>}
 */
export async function executeContainerPipeline(ctx, cdc) {
    const {
        parser,
        resolver,
        graphResolver,
        lifecycle,
        instantiator,
        wrapperExecutor,
        logger,
        testMode,
        mockRegistry,
        freeze,
        applyPreprocess,
        applyPostprocess,
    } = ctx;

    if (!resolver || !graphResolver || !lifecycle) {
        throw new Error('Container infrastructure is not initialized.');
    }

    const getKey = buildDependencyKey;
    const getMockKey = buildDependencyKey;

    /** @type {string} */
    let stage = 'start';
    try {
        logger.log(`Container.get: cdc='${cdc}'.`);
        stage = 'parse';
        logger.log('Container.pipeline: parse:entry.');
        const parsed = parser.parse(cdc);
        logger.log(`Container.pipeline: parse:exit '${parsed.platform}::${parsed.moduleName}'.`);
        stage = 'preprocess';
        logger.log('Container.pipeline: preprocess:entry.');
        const root = applyPreprocess(parsed);
        logger.log(`Container.pipeline: preprocess:exit '${root.platform}::${root.moduleName}'.`);
        if (testMode === true) {
            stage = 'mock';
            logger.log('Container.pipeline: mock-lookup:entry.');
            const key = getMockKey(root);
            if (mockRegistry.has(key)) {
                logger.log(`Container.pipeline: mock-lookup:hit '${key}'.`);
                stage = 'freeze';
                logger.log('Container.pipeline: freeze:entry.');
                const frozenMock = freeze(mockRegistry.get(key));
                logger.log('Container.pipeline: freeze:exit.');
                logger.log('Container.pipeline: return:success.');
                return makePromiseSafe(frozenMock);
            }
            logger.log(`Container.pipeline: mock-lookup:miss '${key}'.`);
        } else {
            logger.log('Container.pipeline: mock-lookup:disabled.');
        }
        stage = 'resolve';
        logger.log('Container.pipeline: resolve:entry.');
        const graph = await graphResolver.resolve(root);
        logger.log(`Container.pipeline: resolve:exit nodes=${graph.size}.`);
        /** @type {Map<string, unknown>} */
        const built = new Map();

        const build = function (key) {
            if (built.has(key)) return built.get(key);
            if (!graph.has(key)) throw new Error(`Resolved graph node is missing for '${key}'.`);
            const node = graph.get(key);
            stage = 'lifecycle';
            logger.log(`Container.pipeline: lifecycle:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
            const value = lifecycle.apply(node.depId, function () {
                stage = 'instantiate';
                logger.log(`Container.pipeline: instantiate:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                /** @type {Record<string, unknown>} */
                const deps = {};
                /** @type {Record<string, unknown>} */
                const depsDecl = readDepsDecl(node.namespace, node.depId);
                for (const [name, cdcValue] of Object.entries(depsDecl)) {
                    const childDepId = parser.parse(/** @type {string} */ (cdcValue));
                    deps[name] = build(getKey(childDepId));
                }
                const instantiated = instantiator.instantiate(node.depId, node.namespace, deps);
                logger.log(`Container.pipeline: instantiate:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                stage = 'postprocess';
                logger.log(`Container.pipeline: postprocess:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                const postprocessed = applyPostprocess(instantiated);
                logger.log(`Container.pipeline: postprocess:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                const wrapped = wrapperExecutor.execute(node.depId, postprocessed, node.namespace);
                stage = 'freeze';
                logger.log(`Container.pipeline: freeze:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                const frozen = freeze(wrapped);
                logger.log(`Container.pipeline: freeze:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                return frozen;
            });
            logger.log(`Container.pipeline: lifecycle:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
            built.set(key, value);
            return value;
        };

        const result = build(getKey(root));
        logger.log('Container.pipeline: return:success.');
        return makePromiseSafe(result);
    } catch (error) {
        logger.error(`Container.pipeline: failed at stage='${stage}'.`, error);
        throw error;
    }
}
