// @ts-check

/**
 * @namespace TeqFw_Di_Config_PackageRegistry
 * @description Deterministic composition-stage graph of installed runtime packages.
 */

/**
 * @typedef {object} TeqFw_Di_Config_PackageRegistry_Dependencies
 * @property {{readFile(path: string, encoding: string): Promise<string>, realpath(path: string): Promise<string>, stat(path: string): Promise<{isDirectory(): boolean}>}} fs
 * @property {{join(...paths: string[]): string, dirname(path: string): string, relative(from: string, to: string): string, resolve(...paths: string[]): string, isAbsolute(path: string): boolean}} path
 * @property {string} appRoot
 */

/**
 * Builds a deterministic immutable graph of root and installed runtime packages.
 */
export default class TeqFw_Di_Config_PackageRegistry {
    /**
     * @param {TeqFw_Di_Config_PackageRegistry_Dependencies} deps
     */
    constructor({fs, path, appRoot}) {
        const appRootAbs = path.resolve(appRoot);

        /**
         * @param {unknown} value
         * @returns {value is Record<string, unknown>}
         */
        const isRecord = function (value) {
            return (value !== null) && (typeof value === 'object') && !Array.isArray(value);
        };

        /**
         * @param {object} value
         * @returns {object}
         */
        const freezeDeep = function (value) {
            for (const nested of Object.values(value)) {
                if ((nested !== null) && (typeof nested === 'object') && !Object.isFrozen(nested)) {
                    freezeDeep(nested);
                }
            }
            return Object.freeze(value);
        };

        /**
         * @param {string} fileAbs
         * @returns {Promise<Record<string, unknown>>}
         */
        const readJson = async function (fileAbs) {
            let content;
            try {
                content = await fs.readFile(fileAbs, 'utf8');
            } catch (error) {
                throw new Error('Unable to read package metadata ' + fileAbs + ': ' + String(error) + '.');
            }
            try {
                const value = JSON.parse(content);
                if (!isRecord(value)) {
                    throw new Error('root must be an object');
                }
                return value;
            } catch (error) {
                throw new Error('Invalid package metadata ' + fileAbs + ': ' + String(error) + '.');
            }
        };

        /**
         * @param {string} packageRootAbs
         * @returns {Promise<{name: string, packageJson: Record<string, unknown>, dependencies: string[]}>}
         */
        const readPackageMetadata = async function (packageRootAbs) {
            const packageJsonAbs = path.join(packageRootAbs, 'package.json');
            const packageJson = await readJson(packageJsonAbs);
            const name = packageJson.name;
            if ((typeof name !== 'string') || (name.length === 0)) {
                throw new Error('Invalid package metadata ' + packageJsonAbs + ': name must be a non-empty string.');
            }

            const rawDependencies = packageJson.dependencies;
            if (rawDependencies === undefined) {
                return {name, packageJson, dependencies: []};
            }
            if (!isRecord(rawDependencies)) {
                throw new Error('Invalid dependency metadata ' + packageJsonAbs + ': dependencies must be an object.');
            }
            const dependencies = Object.keys(rawDependencies).sort();
            for (const dependencyName of dependencies) {
                const dependencyRange = rawDependencies[dependencyName];
                if ((dependencyName.length === 0) || (typeof dependencyRange !== 'string') || (dependencyRange.length === 0)) {
                    throw new Error('Invalid dependency metadata ' + packageJsonAbs + ': ' + dependencyName + ' must have a non-empty string declaration.');
                }
            }
            return {name, packageJson, dependencies};
        };

        /**
         * @param {string} absPath
         * @returns {Promise<boolean>}
         */
        const isDirectory = async function (absPath) {
            try {
                return (await fs.stat(absPath)).isDirectory();
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
         * @param {string} candidateAbs
         * @returns {Promise<boolean>}
         */
        const hasPackageJson = async function (candidateAbs) {
            try {
                await fs.stat(path.join(candidateAbs, 'package.json'));
                return true;
            } catch {
                return false;
            }
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
                if ((await isDirectory(candidate)) && (await hasPackageJson(candidate))) {
                    return path.resolve(candidate);
                }
                if (cursor === appRootAbs) break;
                const parent = path.dirname(cursor);
                if (parent === cursor) break;
                cursor = parent;
            }
            throw new Error('Installed dependency is not found: ' + packageName + ' from ' + fromPackageRootAbs + '.');
        };

        /**
         * @returns {Promise<ReadonlyArray<TeqFw_Di_Config_PackageRegistry_Record>>}
         */
        this.build = async function () {
            /** @type {{rootAbs: string}[]} */
            const queue = [{rootAbs: appRootAbs}];
            /** @type {Set<string>} */
            const visitedRoots = new Set();
            /** @type {TeqFw_Di_Config_PackageRegistry_Record[]} */
            const records = [];

            while (queue.length > 0) {
                const current = queue.shift();
                const rootAbs = current.rootAbs;
                let rootReal;
                try {
                    rootReal = await fs.realpath(rootAbs);
                } catch (error) {
                    throw new Error('Unable to resolve package root ' + rootAbs + ': ' + String(error) + '.');
                }
                if (visitedRoots.has(rootReal)) continue;
                visitedRoots.add(rootReal);

                const metadata = await readPackageMetadata(rootAbs);
                const packageJson = /** @type {Readonly<Record<string, unknown>>} */ (freezeDeep(metadata.packageJson));
                records.push(Object.freeze({name: metadata.name, rootAbs, rootReal, packageJson}));

                for (const dependencyName of metadata.dependencies) {
                    queue.push({rootAbs: await resolveDependencyPackageRoot(dependencyName, rootAbs)});
                }
            }
            return Object.freeze(records);
        };
    }
}
