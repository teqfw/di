// @ts-check

import TeqFw_Di_Def_Parser from './Def/Parser.mjs';
import TeqFw_Di_Dto_Resolver_Config from './Dto/Resolver/Config.mjs';
import TeqFw_Di_Resolver from './Resolver.mjs';
import TeqFw_Di_Container_Resolve_GraphResolver from './Container/Resolve/GraphResolver.mjs';
import TeqFw_Di_Container_Instantiate_Instantiator from './Container/Instantiate/Instantiator.mjs';
import TeqFw_Di_Container_Lifecycle_Registry from './Container/Lifecycle/Registry.mjs';
import TeqFw_Di_Container_Wrapper_Executor from './Container/Wrapper/Executor.mjs';

/**
 * @typedef {'notConfigured'|'operational'|'failed'} TeqFw_Di_Container_State
 */

/**
 * Container orchestration boundary.
 *
 * Executes immutable linking pipeline:
 * parse -> preprocess -> resolve graph -> instantiate -> postprocess ->
 * lifecycle -> freeze -> return.
 */
export default class TeqFw_Di_Container {
    /**
     * Creates container instance in `notConfigured` state.
     */
    constructor() {
        /** @type {TeqFw_Di_Container_State} */
        let state = 'notConfigured';
        /** @type {((depId: TeqFw_Di_DepId$DTO) => TeqFw_Di_DepId$DTO)[]} */
        const preprocess = [];
        /** @type {((value: unknown) => unknown)[]} */
        const postprocess = [];
        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$[]} */
        const namespaceRoots = [];
        /** @type {Map<string, unknown>} */
        const mockRegistry = new Map();
        let testMode = false;
        let loggingEnabled = false;

        /** @type {TeqFw_Di_Def_Parser} */
        let parser = new TeqFw_Di_Def_Parser();
        /** @type {TeqFw_Di_Dto_Resolver_Config} */
        const configFactory = new TeqFw_Di_Dto_Resolver_Config();
        /** @type {TeqFw_Di_Resolver|undefined} */
        let resolver;
        /** @type {TeqFw_Di_Container_Resolve_GraphResolver|undefined} */
        let graphResolver;
        /** @type {TeqFw_Di_Container_Instantiate_Instantiator} */
        const instantiator = new TeqFw_Di_Container_Instantiate_Instantiator();
        /** @type {TeqFw_Di_Container_Lifecycle_Registry} */
        const lifecycle = new TeqFw_Di_Container_Lifecycle_Registry();
        /** @type {TeqFw_Di_Container_Wrapper_Executor} */
        const wrapperExecutor = new TeqFw_Di_Container_Wrapper_Executor();

        /**
         * @param {TeqFw_Di_DepId$DTO} depId
         * @returns {string}
         */
        const getKey = function (depId) {
            return `${depId.platform}::${depId.moduleName}`;
        };

        /**
         * Canonical structural identity excluding `origin`.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @returns {string}
         */
        const getMockKey = function (depId) {
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
            Object.freeze(value);
            return value;
        };

        /**
         * Applies ordered preprocess pipeline.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @returns {TeqFw_Di_DepId$DTO}
         */
        const applyPreprocess = function (depId) {
            /** @type {TeqFw_Di_DepId$DTO} */
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
         * @returns {Record<string, unknown>}
         */
        const readDepsDecl = function (namespace) {
            /** @type {unknown} */
            const deps = Reflect.get(namespace, '__deps__');
            if (deps === undefined) return {};
            if (!deps || (typeof deps !== 'object') || Array.isArray(deps)) {
                throw new Error('Invalid \'__deps__\' declaration: object expected.');
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
         * Lazily creates infrastructure and locks builder configuration.
         *
         * @returns {void}
         */
        const initializeInfrastructure = function () {
            if (state !== 'notConfigured') return;
            if (loggingEnabled === true) console.debug('[teqfw/di] Container: initialize operational infrastructure.');
            state = 'operational';
            const resolverConfig = configFactory.create({
                namespaces: namespaceRoots,
            }, {immutable: true});
            resolver = new TeqFw_Di_Resolver({config: resolverConfig});
            graphResolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser, resolver});
        };

        /**
         * Emits diagnostic message when logging mode is enabled.
         *
         * @param {string} message
         * @returns {void}
         */
        const log = function (message) {
            if (loggingEnabled === true) console.debug(`[teqfw/di] ${message}`);
        };

        /**
         * Registers preprocess extension before first resolution.
         *
         * @param {(depId: TeqFw_Di_DepId$DTO) => TeqFw_Di_DepId$DTO} fn
         * @returns {void}
         */
        this.addPreprocess = function (fn) {
            assertBuilderStage();
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
            namespaceRoots.push({prefix, target, defaultExt});
        };

        /**
         * Enables mock registration capability for test scenarios.
         *
         * @returns {void}
         */
        this.enableTestMode = function () {
            assertBuilderStage();
            testMode = true;
        };

        /**
         * Enables diagnostic logging before first resolution.
         *
         * @returns {void}
         */
        this.enableLogging = function () {
            assertBuilderStage();
            loggingEnabled = true;
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
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = parser.parse(cdc);
            mockRegistry.set(getMockKey(depId), mock);
        };

        /**
         * Resolves dependency by CDC and returns frozen linked value.
         *
         * @param {string} cdc
         * @returns {Promise<unknown>}
         */
        this.get = async function (cdc) {
            if (state === 'failed') throw new Error('Container is in failed state.');

            try {
                initializeInfrastructure();
                /** @type {TeqFw_Di_DepId$DTO} */
                const parsed = parser.parse(cdc);
                log(`parse: ${parsed.platform}::${parsed.moduleName}`);
                /** @type {TeqFw_Di_DepId$DTO} */
                const root = applyPreprocess(parsed);
                log(`preprocess: ${root.platform}::${root.moduleName}`);
                if (testMode === true) {
                    const key = getMockKey(root);
                    if (mockRegistry.has(key)) {
                        log(`mock-hit: ${key}`);
                        return freeze(mockRegistry.get(key));
                    }
                }
                /** @type {Map<string, {depId: TeqFw_Di_DepId$DTO, namespace: object}>} */
                const graph = await graphResolver.resolve(root);
                log(`resolve-graph: nodes=${graph.size}`);
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
                    const value = lifecycle.apply(node.depId, function () {
                        /** @type {Record<string, unknown>} */
                        const deps = {};
                        /** @type {Record<string, unknown>} */
                        const depsDecl = readDepsDecl(node.namespace);
                        for (const [name, edd] of Object.entries(depsDecl)) {
                            if (typeof edd !== 'string') {
                                throw new Error(`Invalid '__deps__' entry '${name}': EDD string expected.`);
                            }
                            /** @type {TeqFw_Di_DepId$DTO} */
                            const childDepId = parser.parse(edd);
                            deps[name] = build(getKey(childDepId));
                        }
                        /** @type {unknown} */
                        const instantiated = instantiator.instantiate(node.depId, node.namespace, deps);
                        /** @type {unknown} */
                        const postprocessed = applyPostprocess(instantiated);
                        /** @type {unknown} */
                        const wrapped = wrapperExecutor.execute(node.depId, postprocessed, node.namespace);
                        log(`build: ${node.depId.platform}::${node.depId.moduleName}`);
                        return freeze(wrapped);
                    });
                    built.set(key, value);
                    return value;
                };

                return build(getKey(root));
            } catch (error) {
                state = 'failed';
                throw error;
            }
        };
    }
}
