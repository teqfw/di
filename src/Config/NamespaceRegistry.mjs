// @ts-check

/**
 * @typedef {object} TeqFw_Di_Config_NamespaceRegistry_Dependencies
 * @property {{readFile(path: string, encoding: string): Promise<string>, readdir(path: string): Promise<string[]>, realpath(path: string): Promise<string>, stat(path: string): Promise<{isDirectory(): boolean}>}} fs
 * @property {{join(...paths: string[]): string, dirname(path: string): string, relative(from: string, to: string): string, resolve(...paths: string[]): string, isAbsolute(path: string): boolean}} path
 * @property {string} appRoot
 */

/**
 * @typedef {object} TeqFw_Di_Config_NamespaceRegistry_Entry
 * @property {string} prefix
 * @property {string} dirAbs
 * @property {string} ext
 */

/**
 * Builds deterministic immutable namespace registry from root package and installed dependencies.
 */
export default class TeqFw_Di_Config_NamespaceRegistry {
    /**
     * @param {TeqFw_Di_Config_NamespaceRegistry_Dependencies} dependencies
     */
    constructor({fs, path, appRoot}) {
        const appRootAbs = path.resolve(appRoot);

        /**
         * @param {string} fileAbs
         * @returns {Promise<Record<string, unknown>>}
         */
        const readJson = async function (fileAbs) {
            const content = await fs.readFile(fileAbs, 'utf8');
            return /** @type {Record<string, unknown>} */ (JSON.parse(content));
        };

        /**
         * @param {string} absPath
         * @returns {Promise<boolean>}
         */
        const isDirectory = async function (absPath) {
            try {
                const stat = await fs.stat(absPath);
                return stat.isDirectory();
            } catch {
                return false;
            }
        };

        /**
         * @param {string} rootAbs
         * @param {string} candidateAbs
         * @returns {boolean}
         */
        const isInside = function (rootAbs, candidateAbs) {
            const rel = path.relative(rootAbs, candidateAbs);
            return (rel === '') || (!rel.startsWith('..') && !path.isAbsolute(rel));
        };

        /**
         * @param {string} packageRootAbs
         * @param {string} dirAbs
         * @returns {Promise<void>}
         */
        const assertInsidePackageRoot = async function (packageRootAbs, dirAbs) {
            const packageRootReal = await fs.realpath(packageRootAbs);
            const dirReal = await fs.realpath(dirAbs);
            if (!isInside(packageRootReal, dirReal)) {
                throw new Error(`Namespace path resolves outside package root: '${dirAbs}'.`);
            }
        };

        /**
         * @param {unknown} ext
         * @returns {string}
         */
        const normalizeExt = function (ext) {
            if (ext === undefined) return '.mjs';
            if ((typeof ext !== 'string') || (ext.length === 0)) {
                throw new Error('Namespace extension must be a non-empty string.');
            }
            const normalized = ext.startsWith('.') ? ext : `.${ext}`;
            if ((normalized !== '.mjs') && (normalized !== '.js')) {
                throw new Error(`Namespace extension is not ESM-compatible: '${normalized}'.`);
            }
            return normalized;
        };

        /**
         * @param {unknown} raw
         * @param {string} packageRootAbs
         * @returns {Promise<TeqFw_Di_Config_NamespaceRegistry_Entry>}
         */
        const normalizeEntry = async function (raw, packageRootAbs) {
            if ((raw === null) || (typeof raw !== 'object')) {
                throw new Error('Namespace entry must be an object.');
            }
            const item = /** @type {Record<string, unknown>} */ (raw);

            const prefix = item.prefix;
            if ((typeof prefix !== 'string') || (prefix.length === 0) || !prefix.endsWith('_')) {
                throw new Error(`Namespace prefix is invalid: '${String(prefix)}'.`);
            }

            const rawPath = item.path;
            if ((typeof rawPath !== 'string') || (rawPath.length === 0) || path.isAbsolute(rawPath)) {
                throw new Error(`Namespace path must be a non-empty relative path: '${String(rawPath)}'.`);
            }
            const dirAbs = path.resolve(packageRootAbs, rawPath);
            if (!(await isDirectory(dirAbs))) {
                throw new Error(`Namespace path does not point to existing directory: '${dirAbs}'.`);
            }
            await assertInsidePackageRoot(packageRootAbs, dirAbs);

            const ext = normalizeExt(item.ext);

            return {prefix, dirAbs, ext};
        };

        /**
         * @param {string} packageRootAbs
         * @returns {Promise<{namespaces: unknown[], dependencies: string[]}>}
         */
        const readPackageMetadata = async function (packageRootAbs) {
            const packageJsonAbs = path.join(packageRootAbs, 'package.json');
            const packageJson = await readJson(packageJsonAbs);
            const teqfw = (packageJson.teqfw && typeof packageJson.teqfw === 'object')
                ? /** @type {Record<string, unknown>} */ (packageJson.teqfw)
                : {};
            const namespaces = Array.isArray(teqfw.namespaces) ? teqfw.namespaces : [];
            const dependencies = (packageJson.dependencies && typeof packageJson.dependencies === 'object')
                ? Object.keys(/** @type {Record<string, unknown>} */ (packageJson.dependencies)).sort()
                : [];
            return {namespaces, dependencies};
        };

        /**
         * @param {string} packageName
         * @param {string} fromPackageRootAbs
         * @returns {Promise<string>}
         */
        const resolveDependencyPackageRoot = async function (packageName, fromPackageRootAbs) {
            let cursor = fromPackageRootAbs;
            while (isInside(appRootAbs, cursor)) {
                const candidate = path.join(cursor, 'node_modules', packageName);
                if (await isDirectory(candidate)) {
                    const packageJsonAbs = path.join(candidate, 'package.json');
                    const hasPackageJson = await (async () => {
                        try {
                            await fs.stat(packageJsonAbs);
                            return true;
                        } catch {
                            return false;
                        }
                    })();
                    if (hasPackageJson) {
                        return path.resolve(candidate);
                    }
                }
                if (cursor === appRootAbs) break;
                const parent = path.dirname(cursor);
                if (parent === cursor) break;
                cursor = parent;
            }
            throw new Error(`Installed dependency is not found: '${packageName}' from '${fromPackageRootAbs}'.`);
        };

        /**
         * @returns {Promise<Readonly<TeqFw_Di_Config_NamespaceRegistry_Entry[]>>}
         */
        this.build = async function () {
            /** @type {{name: string, rootAbs: string}[]} */
            const queue = [{name: '<root>', rootAbs: appRootAbs}];
            /** @type {Set<string>} */
            const visitedRoots = new Set();
            /** @type {Set<string>} */
            const uniquePrefixes = new Set();
            /** @type {TeqFw_Di_Config_NamespaceRegistry_Entry[]} */
            const entries = [];

            while (queue.length > 0) {
                const current = queue.shift();
                const packageRootAbs = current.rootAbs;
                const packageRootReal = await fs.realpath(packageRootAbs);
                if (visitedRoots.has(packageRootReal)) continue;
                visitedRoots.add(packageRootReal);

                const meta = await readPackageMetadata(packageRootAbs);
                for (const raw of meta.namespaces) {
                    const normalized = await normalizeEntry(raw, packageRootAbs);
                    if (uniquePrefixes.has(normalized.prefix)) {
                        throw new Error(`Duplicate namespace prefix is not allowed: '${normalized.prefix}'.`);
                    }
                    uniquePrefixes.add(normalized.prefix);
                    entries.push(normalized);
                }

                for (const depName of meta.dependencies) {
                    const depRootAbs = await resolveDependencyPackageRoot(depName, packageRootAbs);
                    queue.push({name: depName, rootAbs: depRootAbs});
                }
            }

            entries.sort((a, b) => b.prefix.length - a.prefix.length);
            for (const entry of entries) {
                Object.freeze(entry);
            }
            return Object.freeze(entries);
        };
    }
}
