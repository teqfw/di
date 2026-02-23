// @ts-check

/**
 * @typedef {object} TeqFw_Di_Resolver_Dependencies
 * @property {TeqFw_Di_Dto_Resolver_Config$DTO} config Resolver configuration DTO.
 * @property {(specifier: string) => Promise<object>} [importFn] Import function override.
 * @property {{log(message: string): void, error(message: string, error?: unknown): void}|null} [logger]
 */

/**
 * @typedef {{prefix: string, target: string, defaultExt: string}} TeqFw_Di_Resolver_NamespaceRule
 */

/**
 * Infrastructure resolver that derives module specifiers, loads module namespace objects,
 * and caches them by `(platform, moduleName)`.
 */
export default class TeqFw_Di_Resolver {
    /**
     * Initializes resolver with runtime dependencies.
     *
     * @param {TeqFw_Di_Resolver_Dependencies} param0 Resolver dependencies descriptor.
     */
    constructor({config, importFn = (specifier) => import(specifier), logger = null}) {
        /** @type {Map<string, Promise<object>>} Cache keyed by `(platform,moduleName)`. */
        const cache = new Map();
        /** @type {TeqFw_Di_Dto_Resolver_Config$DTO} Original config reference captured from dependencies. */
        const configInput = config;
        /** @type {{nodeModulesRoot: (string|undefined), namespaces: TeqFw_Di_Resolver_NamespaceRule[]}|undefined} */
        let configSnapshot;
        /** @type {(specifier: string) => Promise<object>} Import function used for namespace loading. */
        const importModule = importFn;
        /** @type {{log(message: string): void, error(message: string, error?: unknown): void}|null} */
        const log = logger;

        /**
         * Creates immutable-in-effect structural snapshot used for all post-start resolutions.
         *
         * @param {TeqFw_Di_Dto_Resolver_Config$DTO} input Resolver config DTO.
         * @returns {{nodeModulesRoot: (string|undefined), namespaces: TeqFw_Di_Resolver_NamespaceRule[]}}
         */
        const makeConfigSnapshot = function (input) {
            return {
                nodeModulesRoot: input.nodeModulesRoot,
                namespaces: input.namespaces.map((one) => ({
                    prefix: one.prefix,
                    target: one.target,
                    defaultExt: one.defaultExt,
                })),
            };
        };

        /**
         * Selects namespace rule with deterministic longest-prefix match.
         *
         * @param {string} moduleName Teq module namespace.
         * @returns {TeqFw_Di_Resolver_NamespaceRule}
         */
        const selectNamespaceRule = function (moduleName) {
            /** @type {TeqFw_Di_Resolver_NamespaceRule|null} */
            let found = null;
            let foundLen = -1;
            /** @type {TeqFw_Di_Resolver_NamespaceRule[]} */
            const items = configSnapshot.namespaces;
            for (const one of items) {
                const match = moduleName.startsWith(one.prefix);
                if (log) log.log(`Resolver.namespace: prefix='${one.prefix}' match=${String(match)} module='${moduleName}'.`);
                if (!match) continue;
                if (one.prefix.length > foundLen) {
                    found = one;
                    foundLen = one.prefix.length;
                }
            }
            if (!found) throw new Error(`Namespace rule is not found for '${moduleName}'.`);
            return found;
        };

        /**
         * Appends default extension exactly once.
         *
         * @param {string} path Relative module path.
         * @param {string} defaultExt Namespace default extension.
         * @returns {string}
         */
        const appendExt = function (path, defaultExt) {
            if (!defaultExt) return path;
            if (path.endsWith(defaultExt)) return path;
            return `${path}${defaultExt}`;
        };

        /**
         * Joins namespace target and relative path without path normalization.
         *
         * @param {string} target Namespace target.
         * @param {string} path Relative module path.
         * @returns {string}
         */
        const join = function (target, path) {
            if (!target) return path;
            if (target.endsWith('/')) return `${target}${path}`;
            return `${target}/${path}`;
        };

        /**
         * Derives module specifier from depId structural fields.
         *
         * @param {TeqFw_Di_Enum_Platform[keyof TeqFw_Di_Enum_Platform]} platform DepId platform.
         * @param {string} moduleName DepId module namespace.
         * @returns {string}
         */
        const deriveSpecifier = function (platform, moduleName) {
            if (platform === 'node') {
                const specifier = `node:${moduleName}`;
                if (log) log.log(`Resolver.specifier: module='${moduleName}' -> '${specifier}'.`);
                return specifier;
            }
            if (platform === 'npm') {
                const specifier = moduleName;
                if (log) log.log(`Resolver.specifier: module='${moduleName}' -> '${specifier}'.`);
                return specifier;
            }
            if (platform !== 'teq') throw new Error(`Unsupported platform: ${platform}`);

            /** @type {TeqFw_Di_Resolver_NamespaceRule} */
            const rule = selectNamespaceRule(moduleName);
            const remainder = moduleName.slice(rule.prefix.length);
            const relativePath = remainder.split('_').join('/');
            const filePath = appendExt(relativePath, rule.defaultExt);
            const specifier = join(rule.target, filePath);
            if (log) log.log(`Resolver.specifier: module='${moduleName}' -> '${specifier}'.`);
            return specifier;
        };

        /**
         * Resolves module namespace object by depId platform and moduleName.
         *
         * @param {TeqFw_Di_DepId$DTO} depId Validated dependency identity DTO.
         * @returns {Promise<object>} Promise resolved with ES module namespace object.
         */
        this.resolve = async function (depId) {
            await Promise.resolve();

            if (!configSnapshot) {
                configSnapshot = makeConfigSnapshot(configInput);
            }

            const platform = depId.platform;
            const moduleName = depId.moduleName;
            const key = `${platform}::${moduleName}`;

            if (cache.has(key)) {
                if (log) log.log(`Resolver.cache: hit key='${key}'.`);
                return cache.get(key);
            }
            if (log) log.log(`Resolver.cache: miss key='${key}'.`);

            /** @type {Promise<object>} */
            const promise = (async () => {
                const specifier = deriveSpecifier(platform, moduleName);
                if (log) log.log(`Resolver.import: '${specifier}'.`);
                return importModule(specifier);
            })();

            cache.set(key, promise);

            try {
                return await promise;
            } catch (error) {
                cache.delete(key);
                if (log) log.error(`Resolver.cache: evict key='${key}' after failure.`, error);
                throw error;
            }
        };
    }
}
