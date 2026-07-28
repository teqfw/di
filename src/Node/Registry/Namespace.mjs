// @ts-check

import TeqFw_Di_Node_Registry_Package from './Package.mjs';

/**
 * @namespace TeqFw_Di_Node_Registry_Namespace
 * @description Deterministic Node.js namespace registry derived from the runtime package graph.
 */

/**
 * @typedef {object} TeqFw_Di_Node_Registry_Namespace_Dependencies
 * @property {{readFile(path: string, encoding: string): Promise<string>, realpath(path: string): Promise<string>, stat(path: string): Promise<{isDirectory(): boolean}>}} fs
 * @property {{join(...paths: string[]): string, dirname(path: string): string, relative(from: string, to: string): string, resolve(...paths: string[]): string, isAbsolute(path: string): boolean}} path
 * @property {string} appRoot
 */

/**
 * @typedef {object} TeqFw_Di_Node_Registry_Namespace_Entry
 * @property {string} prefix
 * @property {string} dirAbs
 * @property {string} ext
 */

/**
 * Builds a deterministic immutable Node.js namespace registry from runtime package records.
 */
export default class TeqFw_Di_Node_Registry_Namespace {
    /**
     * @param {TeqFw_Di_Node_Registry_Namespace_Dependencies} deps
     */
    constructor({fs, path, appRoot}) {
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
         * @param {string} packageRootAbs
         * @param {string} dirAbs
         * @returns {Promise<void>}
         */
        const assertInsidePackageRoot = async function (packageRootAbs, dirAbs) {
            const packageRootReal = await fs.realpath(packageRootAbs);
            const dirReal = await fs.realpath(dirAbs);
            if (!isInside(packageRootReal, dirReal)) {
                throw new Error('Namespace path resolves outside package root: ' + dirAbs + '.');
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
            const normalized = ext.startsWith('.') ? ext : '.' + ext;
            if ((normalized !== '.mjs') && (normalized !== '.js')) {
                throw new Error('Namespace extension is not ESM-compatible: ' + normalized + '.');
            }
            return normalized;
        };

        /**
         * @param {unknown} raw
         * @param {string} packageRootAbs
         * @returns {Promise<TeqFw_Di_Node_Registry_Namespace_Entry>}
         */
        const normalizeEntry = async function (raw, packageRootAbs) {
            if ((raw === null) || (typeof raw !== 'object')) {
                throw new Error('Namespace entry must be an object.');
            }
            const item = /** @type {Record<string, unknown>} */ (raw);
            const prefix = item.prefix;
            if ((typeof prefix !== 'string') || (prefix.length === 0) || !prefix.endsWith('_')) {
                throw new Error('Namespace prefix is invalid: ' + String(prefix) + '.');
            }

            const rawPath = item.path;
            if ((typeof rawPath !== 'string') || (rawPath.length === 0) || path.isAbsolute(rawPath)) {
                throw new Error('Namespace path must be a non-empty relative path: ' + String(rawPath) + '.');
            }
            const dirAbs = path.resolve(packageRootAbs, rawPath);
            if (!(await isDirectory(dirAbs))) {
                throw new Error('Namespace path does not point to existing directory: ' + dirAbs + '.');
            }
            await assertInsidePackageRoot(packageRootAbs, dirAbs);
            return {prefix, dirAbs, ext: normalizeExt(item.ext)};
        };

        /**
         * @returns {Promise<ReadonlyArray<TeqFw_Di_Node_Registry_Namespace_Entry>>}
         */
        this.build = async function () {
            const packages = await new TeqFw_Di_Node_Registry_Package({fs, path, appRoot}).build();
            /** @type {Set<string>} */
            const uniquePrefixes = new Set();
            /** @type {TeqFw_Di_Node_Registry_Namespace_Entry[]} */
            const entries = [];

            for (const onePackage of packages) {
                const packageJson = onePackage.packageJson;
                const teqfw = (packageJson.teqfw && typeof packageJson.teqfw === 'object')
                    ? /** @type {Record<string, unknown>} */ (packageJson.teqfw)
                    : {};
                const namespaces = Array.isArray(teqfw.namespaces) ? teqfw.namespaces : [];

                for (const raw of namespaces) {
                    const normalized = await normalizeEntry(raw, onePackage.rootAbs);
                    if (uniquePrefixes.has(normalized.prefix)) {
                        throw new Error('Duplicate namespace prefix is not allowed: ' + normalized.prefix + '.');
                    }
                    uniquePrefixes.add(normalized.prefix);
                    entries.push(normalized);
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
