// @ts-check

/**
 * @namespace TeqFw_Di_Node_Registry_Package
 * @description Deterministic Node.js composition-stage graph of installed TeqFW participants.
 */

/**
 * @typedef {object} TeqFw_Di_Node_Registry_Package_Dependencies
 * @property {typeof import('node:fs/promises')} fs
 * @property {typeof import('node:path')} path
 * @property {string} appRoot
 */

/**
 * Builds a deterministic immutable dependency-first list of the host and immediate TeqFW packages.
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
         * @param {boolean} [host]
         * @returns {Promise<{name: string, packageJson: Record<string, unknown>, dependencies: string[]}|undefined>}
         */
        const readPackageMetadata = async function (packageRootAbs, host = false) {
            const packageJsonAbs = path.join(packageRootAbs, 'package.json');
            const packageJson = await readJson(packageJsonAbs);
            if (!host && !Object.hasOwn(packageJson, 'teqfw')) return undefined;
            if (Object.hasOwn(packageJson, 'teqfw') && !isRecord(packageJson.teqfw)) {
                throw new Error('Invalid TeqFW metadata ' + packageJsonAbs + ': teqfw must be an object.');
            }
            const name = packageJson.name;
            if ((typeof name !== 'string') || (name.length === 0)) {
                throw new Error('Invalid package metadata ' + packageJsonAbs + ': name must be a non-empty string.');
            }

            /** @type {Set<string>} */
            const declaredNames = new Set();
            for (const field of ['dependencies', 'devDependencies']) {
                const declarations = packageJson[field];
                if (declarations === undefined) continue;
                if (!isRecord(declarations)) {
                    throw new Error('Invalid dependency metadata ' + packageJsonAbs + ': ' + field + ' must be an object.');
                }
                for (const [dependencyName, dependencyRange] of Object.entries(declarations)) {
                    if ((dependencyName.length === 0) || (typeof dependencyRange !== 'string') || (dependencyRange.length === 0)) {
                        throw new Error('Invalid dependency metadata ' + packageJsonAbs + ': ' + dependencyName + ' must have a non-empty string declaration.');
                    }
                    declaredNames.add(dependencyName);
                }
            }
            return {name, packageJson, dependencies: [...declaredNames].sort()};
        };

        /**
         * @param {string} absPath
         * @returns {Promise<boolean>}
         */
        const isDirectory = async function (absPath) {
            try {
                return (await fs.stat(absPath)).isDirectory();
            } catch (error) {
                if (/** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') return false;
                throw error;
            }
        };

        /**
         * @param {string} candidateAbs
         * @returns {Promise<boolean>}
         */
        const hasPackageJson = async function (candidateAbs) {
            try {
                await fs.stat(path.join(candidateAbs, 'package.json'));
                return true;
            } catch (error) {
                if (/** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') return false;
                throw error;
            }
        };

        /**
         * @param {string} directory
         * @returns {Promise<string[]>}
         */
        const readNames = async function (directory) {
            try {
                return (await fs.readdir(directory)).sort();
            } catch (error) {
                if (/** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') return [];
                throw error;
            }
        };

        /**
         * @returns {Promise<ReadonlyArray<TeqFw_Di_Node_Registry_Package_Record>>}
         */
        this.build = async function () {
            /** @type {Map<string, {rootAbs: string, rootReal: string, metadata: {name: string, packageJson: Record<string, unknown>, dependencies: string[]}}>} */
            const participants = new Map();
            /** @type {Map<string, string>} */
            const rootsByName = new Map();

            /** @param {string} rootAbs @param {string | undefined} installedName @param {boolean} host */
            const discover = async function (rootAbs, installedName, host) {
                if (!host && (!(await isDirectory(rootAbs)) || !(await hasPackageJson(rootAbs)))) return;
                const rootReal = await fs.realpath(rootAbs);
                if (participants.has(rootReal)) {
                    if (installedName !== undefined) rootsByName.set(installedName, rootReal);
                    return;
                }
                const metadata = await readPackageMetadata(rootAbs, host);
                if (metadata === undefined) return;
                participants.set(rootReal, {rootAbs, rootReal, metadata});
                if (installedName !== undefined) rootsByName.set(installedName, rootReal);
            };

            await discover(appRootAbs, undefined, true);
            const modules = path.join(appRootAbs, 'node_modules');
            for (const name of await readNames(modules)) {
                if (name.startsWith('.')) continue;
                const entry = path.join(modules, name);
                if (name.startsWith('@')) {
                    if (!(await isDirectory(entry))) continue;
                    for (const scoped of await readNames(entry)) {
                        await discover(path.join(entry, scoped), name + '/' + scoped, false);
                    }
                } else {
                    await discover(entry, name, false);
                }
            }

            /** @type {Set<string>} */
            const visited = new Set();
            /** @type {Set<string>} */
            const visitingRoots = new Set();
            /** @type {TeqFw_Di_Node_Registry_Package_Record[]} */
            const records = [];
            /** @type {string[]} */
            const pathStack = [];

            /**
             * Visits a package after all of its dependencies.
             *
             * @param {string} rootReal
             * @returns {void}
             */
            const visit = function (rootReal) {
                if (visited.has(rootReal)) return;
                if (visitingRoots.has(rootReal)) {
                    const cycleStart = pathStack.indexOf(rootReal);
                    const cycle = [...pathStack.slice(cycleStart), rootReal].join(' -> ');
                    throw new Error('Cyclic package dependency detected: ' + cycle + '.');
                }
                visitingRoots.add(rootReal);
                pathStack.push(rootReal);

                const participant = participants.get(rootReal);
                if (!participant) throw new Error('Missing discovered participant ' + rootReal + '.');
                const {rootAbs, metadata} = participant;
                const packageJson = /** @type {Readonly<Record<string, unknown>>} */ (freezeDeep(metadata.packageJson));
                /** @type {string[]} */
                const dependencies = [];

                for (const dependencyName of metadata.dependencies) {
                    const target = rootsByName.get(dependencyName);
                    if (target !== undefined && target !== rootReal && !dependencies.includes(target)) {
                        visit(target);
                        dependencies.push(target);
                    }
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
                visited.add(rootReal);
                records.push(record);
            };

            for (const rootReal of participants.keys()) visit(rootReal);
            return Object.freeze(records);
        };
    }
}
