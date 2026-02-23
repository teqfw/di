// @ts-check

/**
 * @typedef {object} TeqFw_Di_Resolver_Dependencies
 * @property {TeqFw_Di_Dto_Resolver_Config$DTO} config Resolver configuration DTO.
 * @property {(specifier: string) => Promise<object>} [importFn] Import function override.
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
    constructor({config, importFn = (specifier) => import(specifier)}) {
        /** @type {Map<string, Promise<object>>} Cache keyed by `(platform,moduleName)`. */
        const cache = new Map();
        /** @type {TeqFw_Di_Dto_Resolver_Config$DTO} Original config reference captured from dependencies. */
        const configInput = config;
        /** @type {{nodeModulesRoot: (string|undefined), namespaces: TeqFw_Di_Resolver_NamespaceRule[]}|undefined} */
        let configSnapshot;
        /** @type {(specifier: string) => Promise<object>} Import function used for namespace loading. */
        const importModule = importFn;

        /**
         * Creates immutable-in-effect structural snapshot used for all post-start resolutions.
         *
         * @param {TeqFw_Di_Dto_Resolver_Config$DTO} input Resolver config DTO.
         * @returns {{nodeModulesRoot: (string|undefined), namespaces: TeqFw_Di_Resolver_NamespaceRule[]}}
         */
        const makeConfigSnapshot = function (input) {
            /** @type {TeqFw_Di_Dto_Resolver_Config$DTO|Record<string, unknown>} */
            const src = (input && (typeof input === 'object')) ? input : {};
            /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$[]} */
            const namespaces = Array.isArray(src.namespaces) ? src.namespaces : [];
            return {
                nodeModulesRoot: (typeof src.nodeModulesRoot === 'string') ? src.nodeModulesRoot : undefined,
                namespaces: namespaces.map((item) => {
                    /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$|Record<string, unknown>} */
                    const ns = (item && (typeof item === 'object')) ? item : {};
                    return {
                        prefix: (typeof ns.prefix === 'string') ? ns.prefix : '',
                        target: (typeof ns.target === 'string') ? ns.target : '',
                        defaultExt: (typeof ns.defaultExt === 'string') ? ns.defaultExt : '',
                    };
                }),
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
                if (typeof one.prefix !== 'string') continue;
                if (!moduleName.startsWith(one.prefix)) continue;
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
            if (platform === 'node') return `node:${moduleName}`;
            if (platform === 'npm') return moduleName;
            if (platform !== 'teq') throw new Error(`Unsupported platform: ${platform}`);

            /** @type {TeqFw_Di_Resolver_NamespaceRule} */
            const rule = selectNamespaceRule(moduleName);
            const remainder = moduleName.slice(rule.prefix.length);
            const relativePath = remainder.split('_').join('/');
            const filePath = appendExt(relativePath, rule.defaultExt);
            return join(rule.target, filePath);
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
                return cache.get(key);
            }

            /** @type {Promise<object>} */
            const promise = (async () => {
                const specifier = deriveSpecifier(platform, moduleName);
                return importModule(specifier);
            })();

            cache.set(key, promise);

            try {
                return await promise;
            } catch (error) {
                cache.delete(key);
                throw error;
            }
        };
    }
}
