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
         * @param {unknown} value
         * @returns {value is Record<string, unknown>}
         */
        const isRecord = function (value) {
            return (value !== null) && (typeof value === 'object') && !Array.isArray(value);
        };

        /**
         * @param {{name: string, rootAbs: string}} publisher
         * @returns {string}
         */
        const publisherLabel = function (publisher) {
            return `package '${publisher.name}' at '${publisher.rootAbs}'`;
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
         * @param {{name: string, rootAbs: string}} publisher
         * @returns {Promise<TeqFw_Di_Node_Registry_Namespace_Entry>}
         */
        const normalizeEntry = async function (raw, publisher) {
            const packageRootAbs = publisher.rootAbs;
            const source = publisherLabel(publisher);
            if (!isRecord(raw)) {
                throw new Error(`DI namespace declared by ${source} must be an object.`);
            }
            const item = raw;
            const prefix = item.prefix;
            if ((typeof prefix !== 'string') || (prefix.length === 0) || !prefix.endsWith('_')) {
                throw new Error(`DI namespace prefix declared by ${source} is invalid: ${String(prefix)}.`);
            }

            const rawPath = item.path;
            if ((typeof rawPath !== 'string') || (rawPath.length === 0) || path.isAbsolute(rawPath)) {
                throw new Error(`DI namespace path declared by ${source} must be a non-empty relative path: ${String(rawPath)}.`);
            }
            const dirAbs = path.resolve(packageRootAbs, rawPath);
            if (!isInside(packageRootAbs, dirAbs)) {
                throw new Error(`DI namespace path declared by ${source} lexically escapes its package root: ${rawPath}.`);
            }
            if (!(await isDirectory(dirAbs))) {
                throw new Error(`DI namespace path declared by ${source} does not point to an existing directory: ${dirAbs}.`);
            }
            try {
                await assertInsidePackageRoot(packageRootAbs, dirAbs);
            } catch (error) {
                throw new Error(`DI namespace path declared by ${source} resolves outside its package root: ${dirAbs}.`, {cause: error});
            }
            try {
                return {prefix, dirAbs, ext: normalizeExt(item.ext)};
            } catch (error) {
                throw new Error(`DI namespace extension declared by ${source} is invalid: ${String(error)}.`, {cause: error});
            }
        };

        /**
         * @param {Readonly<Record<string, unknown>>} packageJson
         * @param {{name: string, rootAbs: string}} publisher
         * @returns {unknown|undefined}
         */
        const readNamespace = function (packageJson, publisher) {
            const teqfw = packageJson.teqfw;
            if (teqfw === undefined) return undefined;
            if (!isRecord(teqfw)) throw new Error(`TeqFW metadata for ${publisherLabel(publisher)} must be an object.`);
            const fw = teqfw.fw;
            if (fw === undefined) return undefined;
            if (!isRecord(fw)) throw new Error(`TeqFW framework metadata for ${publisherLabel(publisher)} must be an object.`);
            const di = fw.di;
            if (di === undefined) return undefined;
            if (!isRecord(di)) throw new Error(`TeqFW DI metadata for ${publisherLabel(publisher)} must be an object.`);
            return di.namespace;
        };

        /**
         * @returns {Promise<ReadonlyArray<TeqFw_Di_Node_Registry_Namespace_Entry>>}
         */
        this.build = async function () {
            const packages = await new TeqFw_Di_Node_Registry_Package({fs, path, appRoot}).build();
            /** @type {Map<string, {name: string, rootAbs: string}>} */
            const publisherByPrefix = new Map();
            /** @type {TeqFw_Di_Node_Registry_Namespace_Entry[]} */
            const entries = [];

            for (const onePackage of packages) {
                const packageJson = onePackage.packageJson;
                const publisher = {name: onePackage.name, rootAbs: onePackage.rootAbs};
                const raw = readNamespace(packageJson, publisher);
                if (raw === undefined) continue;
                const normalized = await normalizeEntry(raw, publisher);
                const existingPublisher = publisherByPrefix.get(normalized.prefix);
                if (existingPublisher) {
                    throw new Error(`Duplicate DI namespace prefix '${normalized.prefix}' declared by ${publisherLabel(publisher)} conflicts with ${publisherLabel(existingPublisher)}.`);
                }
                publisherByPrefix.set(normalized.prefix, publisher);
                entries.push(normalized);
            }

            entries.sort((a, b) => (b.prefix.length - a.prefix.length) || a.prefix.localeCompare(b.prefix));
            for (const entry of entries) {
                Object.freeze(entry);
            }
            return Object.freeze(entries);
        };
    }
}
