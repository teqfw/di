// @ts-check

/**
 * @namespace TeqFw_Di_Node_Registry_Package
 * @description Deterministic Node.js composition-stage graph of installed runtime packages.
 */

/**
 * @typedef {object} TeqFw_Di_Node_Registry_Package_Dependencies
 * @property {typeof import('node:fs/promises')} fs
 * @property {typeof import('node:path')} path
 * @property {string} appRoot
 */

/**
 * Builds a deterministic immutable dependency-first list of root and installed runtime packages.
 */
export default class TeqFw_Di_Node_Registry_Package {
    /**
     * @param {TeqFw_Di_Node_Registry_Package_Dependencies} deps
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
         * @returns {Promise<ReadonlyArray<TeqFw_Di_Node_Registry_Package_Record>>}
         */
        this.build = async function () {
            /** @type {Map<string, TeqFw_Di_Node_Registry_Package_Record>} */
            const recordsByRoot = new Map();
            /** @type {Set<string>} */
            const visitingRoots = new Set();
            /** @type {TeqFw_Di_Node_Registry_Package_Record[]} */
            const records = [];
            /** @type {string[]} */
            const pathStack = [];

            /**
             * Visits a package after all of its dependencies.
             *
             * @param {string} rootAbs
             * @returns {Promise<string>}
             */
            const visit = async function (rootAbs) {
                let rootReal;
                try {
                    rootReal = await fs.realpath(rootAbs);
                } catch (error) {
                    throw new Error('Unable to resolve package root ' + rootAbs + ': ' + String(error) + '.');
                }
                if (recordsByRoot.has(rootReal)) return rootReal;
                if (visitingRoots.has(rootReal)) {
                    const cycleStart = pathStack.indexOf(rootReal);
                    const cycle = [...pathStack.slice(cycleStart), rootReal].join(' -> ');
                    throw new Error('Cyclic package dependency detected: ' + cycle + '.');
                }
                visitingRoots.add(rootReal);
                pathStack.push(rootReal);

                const metadata = await readPackageMetadata(rootAbs);
                const packageJson = /** @type {Readonly<Record<string, unknown>>} */ (freezeDeep(metadata.packageJson));
                /** @type {string[]} */
                const dependencies = [];

                for (const dependencyName of metadata.dependencies) {
                    const dependencyRootAbs = await resolveDependencyPackageRoot(dependencyName, rootAbs);
                    dependencies.push(await visit(dependencyRootAbs));
                }

                pathStack.pop();
                visitingRoots.delete(rootReal);
                const record = Object.freeze({
                    name: metadata.name,
                    rootAbs,
                    rootReal,
                    packageJson,
                    dependencies: Object.freeze([...new Set(dependencies)]),
                });
                recordsByRoot.set(rootReal, record);
                records.push(record);
                return rootReal;
            };

            await visit(appRootAbs);
            return Object.freeze(records);
        };
    }
}
