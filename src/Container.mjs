// @ts-check

/**
 * @namespace TeqFw_Di_Container
 * @description DI container orchestration entry point.
 */

import TeqFw_Di_Def_Parser from './Def/Parser.mjs';
import {Factory as TeqFw_Di_Dto_Resolver_Config_Factory} from './Dto/Resolver/Config.mjs';
import TeqFw_Di_Resolver from './Container/Resolver.mjs';
import TeqFw_Di_Container_Resolve_GraphResolver from './Container/Resolve/GraphResolver.mjs';
import TeqFw_Di_Container_Instantiate_Instantiator from './Container/Instantiate/Instantiator.mjs';
import TeqFw_Di_Container_Lifecycle_Registry from './Container/Lifecycle/Registry.mjs';
import TeqFw_Di_Container_Wrapper_Executor from './Container/Wrapper/Executor.mjs';
import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from './Internal/Logger.mjs';

/**
 * @typedef {'notConfigured'|'operational'|'failed'} TeqFw_Di_Container_State
 */

/**
 * Container orchestration boundary.
 *
 * Executes immutable linking pipeline:
 * parse -> preprocess -> resolve graph -> instantiate -> postprocess ->
 * lifecycle -> freeze -> return.
 *
 * @LLM-DOC
 * Spec: ./ctx/docs/code/components/container.md
 */
export default class TeqFw_Di_Container {
    /**
     * Creates container instance in `notConfigured` state.
     */
    constructor() {
        /** @type {TeqFw_Di_Container_State} */
        let state = 'notConfigured';
        /** @type {((depId: TeqFw_Di_DepId__DTO) => TeqFw_Di_DepId__DTO)[]} */
        const preprocess = [];
        /** @type {((value: unknown) => unknown)[]} */
        const postprocess = [];
        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace__DTO[]} */
        const namespaceRoots = [];
        /** @type {Map<string, unknown>} */
        const mockRegistry = new Map();
        /** @type {WeakMap<object, object>} */
        const promiseSafeCache = new WeakMap();
        let testMode = false;
        let loggingEnabled = false;

        /** @type {TeqFw_Di_Def_Parser} */
        let parser = new TeqFw_Di_Def_Parser();
        /** @type {TeqFw_Di_Dto_Resolver_Config__Factory} */
        const configFactory = new TeqFw_Di_Dto_Resolver_Config_Factory();
        /** @type {TeqFw_Di_Resolver|undefined} */
        let resolver;
        /** @type {TeqFw_Di_Container_Resolve_GraphResolver|undefined} */
        let graphResolver;
        /** @type {TeqFw_Di_Container_Lifecycle_Registry|undefined} */
        let lifecycle;
        /** @type {{log(message: string): void, error(message: string, error?: unknown): void}} */
        let logger = TeqFw_Di_Internal_Logger_Noop;
        /** @type {TeqFw_Di_Container_Instantiate_Instantiator} */
        const instantiator = new TeqFw_Di_Container_Instantiate_Instantiator();
        /** @type {TeqFw_Di_Container_Wrapper_Executor} */
        const wrapperExecutor = new TeqFw_Di_Container_Wrapper_Executor();

        /**
         * @param {TeqFw_Di_DepId__DTO} depId
         * @returns {string}
         */
        const getKey = function (depId) {
            const exportName = depId.exportName === null ? '' : depId.exportName;
            const life = depId.life === null ? '' : depId.life;
            const wrappers = Array.isArray(depId.wrappers) ? depId.wrappers.join('|') : '';
            return [
                depId.platform,
                depId.moduleName,
                exportName,
                depId.composition,
                life,
                wrappers,
            ].join('::');
        };

        /**
         * Canonical structural identity excluding `origin`.
         *
         * @param {TeqFw_Di_DepId__DTO} depId
         * @returns {string}
         */
        const getMockKey = function (depId) {
            return getKey(depId);
        };

        /**
         * Freezes values that support freezing.
         *
         * @param {unknown} value
         * @returns {unknown}
         */
        const freeze = function (value) {
            if ((value === null) || (value === undefined)) return value;
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return value;
            if (Object.prototype.toString.call(value) === '[object Module]') return value;
            if (Object.isFrozen(value)) return value;
            try {
                Object.freeze(value);
            } catch (error) {
                logger.log(`Container.freeze: skipped (${String(error)}).`);
            }
            return value;
        };

        /**
         * Ensures async `get()` can resolve objects whose proxy `get('then')` throws.
         *
         * @param {unknown} value
         * @returns {unknown}
         */
        const asPromiseSafe = function (value) {
            if ((value === null) || (value === undefined)) return value;
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return value;
            const obj = /** @type {object} */ (value);
            if (promiseSafeCache.has(obj)) return promiseSafeCache.get(obj);
            try {
                void Reflect.get(obj, 'then');
                return value;
            } catch {
                const wrapped = new Proxy(obj, {
                    get(target, property, receiver) {
                        if (property === 'then') return undefined;
                        return Reflect.get(target, property, receiver);
                    },
                });
                promiseSafeCache.set(obj, wrapped);
                return wrapped;
            }
        };

        /**
         * Applies ordered preprocess pipeline.
         *
         * @param {TeqFw_Di_DepId__DTO} depId
         * @returns {TeqFw_Di_DepId__DTO}
         */
        const applyPreprocess = function (depId) {
            /** @type {TeqFw_Di_DepId__DTO} */
            let current = depId;
            for (const fn of preprocess) {
                current = fn(current);
            }
            return current;
        };

        /**
         * Applies ordered postprocess pipeline.
         *
         * @param {unknown} value
         * @returns {unknown}
         */
        const applyPostprocess = function (value) {
            /** @type {unknown} */
            let current = value;
            for (const fn of postprocess) {
                current = fn(current);
            }
            return current;
        };

        /**
         * @param {object} namespace
         * @param {TeqFw_Di_DepId__DTO} depId
         * @returns {Record<string, unknown>}
         */
        const readDepsDecl = function (namespace, depId) {
            /** @type {unknown} */
            const deps = Reflect.get(namespace, '__deps__');
            if (deps === undefined) return {};
            if ((deps !== null) && (typeof deps === 'object') && !Array.isArray(deps)) {
                const exportName = depId.exportName === null ? 'default' : depId.exportName;
                const exportScoped = Reflect.get(/** @type {object} */ (deps), exportName);
                if ((exportScoped !== undefined) && (exportScoped !== null) && (typeof exportScoped === 'object') && !Array.isArray(exportScoped)) {
                    return /** @type {Record<string, unknown>} */ (exportScoped);
                }
            }
            return /** @type {Record<string, unknown>} */ (deps);
        };

        /**
         * @returns {void}
         */
        const assertBuilderStage = function () {
            if (state !== 'notConfigured') throw new Error('Container configuration is locked.');
        };

        /**
         * Emits builder-stage diagnostics only when logging is enabled.
         *
         * @param {string} message
         * @returns {void}
         */
        const logBuilder = function (message) {
            if (!loggingEnabled) return;
            logger.log(`Container.builder: ${message}`);
        };

        /**
         * Lazily creates infrastructure and locks builder configuration.
         *
         * @returns {void}
         */
        const initializeInfrastructure = function () {
            if (state !== 'notConfigured') return;
            logger.log('Container.transition: notConfigured -> operational.');
            state = 'operational';
            const resolverConfig = configFactory.create({
                namespaces: namespaceRoots,
            });
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            resolver = new TeqFw_Di_Resolver({config: resolverConfig, logger});
            graphResolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser, resolver, logger});
            lifecycle = new TeqFw_Di_Container_Lifecycle_Registry(logger);
        };

        /**
         * Registers preprocess extension before first resolution.
         *
         * @param {(depId: TeqFw_Di_DepId__DTO) => TeqFw_Di_DepId__DTO} fn
         * @returns {void}
         */
        this.addPreprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPreprocess().');
            preprocess.push(fn);
        };

        /**
         * Registers postprocess extension before first resolution.
         *
         * @param {(value: unknown) => unknown} fn
         * @returns {void}
         */
        this.addPostprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPostprocess().');
            postprocess.push(fn);
        };

        /**
         * Replaces default parser before first resolution.
         *
         * @param {TeqFw_Di_Def_Parser} next
         * @returns {void}
         */
        this.setParser = function (next) {
            assertBuilderStage();
            parser = next;
            if (typeof parser.setLogger === 'function') parser.setLogger(loggingEnabled ? logger : null);
            logBuilder('setParser().');
        };

        /**
         * Registers one resolver namespace root before first resolution.
         *
         * @param {string} prefix
         * @param {string} target
         * @param {string} defaultExt
         * @returns {void}
         */
        this.addNamespaceRoot = function (prefix, target, defaultExt) {
            assertBuilderStage();
            logBuilder(`addNamespaceRoot('${prefix}').`);
            namespaceRoots.push({prefix, target, defaultExt});
        };

        /**
         * Enables mock registration capability for test scenarios.
         *
         * @returns {void}
         */
        this.enableTestMode = function () {
            assertBuilderStage();
            logBuilder('enableTestMode().');
            testMode = true;
        };

        /**
         * Enables diagnostic logging before first resolution.
         *
         * @returns {void}
         */
        this.enableLogging = function () {
            assertBuilderStage();
            if (loggingEnabled) return;
            loggingEnabled = true;
            logger = new TeqFw_Di_Internal_Logger();
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            logger.log('Container.builder: enableLogging().');
        };

        /**
         * Registers test mock by CDC structural identity.
         *
         * @param {string} cdc
         * @param {unknown} mock
         * @returns {void}
         */
        this.register = function (cdc, mock) {
            assertBuilderStage();
            logBuilder(`register('${cdc}').`);
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = parser.parse(cdc);
            mockRegistry.set(getMockKey(depId), mock);
        };

        /**
         * Resolves dependency by CDC and returns frozen linked value.
         *
         * @param {string} cdc
         * @returns {Promise<any>}
         */
        this.get = async function (cdc) {
            if (state === 'failed') {
                logger.error(`Container.get: rejected in failed state cdc='${cdc}'.`);
                throw new Error('Container is in failed state.');
            }

            /** @type {string} */
            let stage = 'start';
            try {
                logger.log(`Container.get: cdc='${cdc}'.`);
                initializeInfrastructure();
                logger.log(`Container.state: '${state}'.`);
                /** @type {TeqFw_Di_DepId__DTO} */
                stage = 'parse';
                logger.log('Container.pipeline: parse:entry.');
                const parsed = parser.parse(cdc);
                logger.log(`Container.pipeline: parse:exit '${parsed.platform}::${parsed.moduleName}'.`);
                /** @type {TeqFw_Di_DepId__DTO} */
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
                        return asPromiseSafe(frozenMock);
                    }
                    logger.log(`Container.pipeline: mock-lookup:miss '${key}'.`);
                } else {
                    logger.log('Container.pipeline: mock-lookup:disabled.');
                }
                /** @type {Map<string, {depId: TeqFw_Di_DepId__DTO, namespace: object}>} */
                stage = 'resolve';
                logger.log('Container.pipeline: resolve:entry.');
                const graph = await graphResolver.resolve(root);
                logger.log(`Container.pipeline: resolve:exit nodes=${graph.size}.`);
                /** @type {Map<string, unknown>} */
                const built = new Map();

                /**
                 * @param {string} key
                 * @returns {unknown}
                 */
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
                        for (const [name, cdc] of Object.entries(depsDecl)) {
                            /** @type {string} */
                            const childCdc = /** @type {string} */ (cdc);
                            /** @type {TeqFw_Di_DepId__DTO} */
                            const childDepId = parser.parse(childCdc);
                            deps[name] = build(getKey(childDepId));
                        }
                        /** @type {unknown} */
                        const instantiated = instantiator.instantiate(node.depId, node.namespace, deps);
                        logger.log(`Container.pipeline: instantiate:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                        /** @type {unknown} */
                        stage = 'postprocess';
                        logger.log(`Container.pipeline: postprocess:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                        const postprocessed = applyPostprocess(instantiated);
                        logger.log(`Container.pipeline: postprocess:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                        /** @type {unknown} */
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
                return asPromiseSafe(result);
            } catch (error) {
                logger.error(`Container.pipeline: failed at stage='${stage}'.`, error);
                logger.log('Container.transition: operational -> failed.');
                state = 'failed';
                throw error;
            }
        };
    }
}
