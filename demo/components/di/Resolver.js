/**
 * This function converts the name of the ES6 module to the path of the sources and loads the sources.
 * This is a backend only resolver.
 */
import {dirname, join} from 'node:path';

/* Resolve paths to main folders */
const bin = dirname(import.meta.url);
const root = join(bin, '..'); // ../../components

// FUNCS

function composePath(moduleName) {
    let res = root;
    const parts = moduleName.split('.');
    for (const part of parts)
        res = join(res, part);
    return `${res}.js`;
}

// MAIN

/**
 *
 * @param {Di.Dto.ObjectKey} data
 * @returns {Promise<*>}
 */
export default async function (data) {
    const name = data.moduleName;
    const path = composePath(name);
    return await import(path);
};