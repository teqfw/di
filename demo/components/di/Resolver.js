/**
 * This function converts the name of the ES6 module to the path of the sources and loads the sources.
 * This is a backend only resolver.
 */
import {dirname, join} from 'node:path';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const bin = dirname(script);
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
 * @return {Promise<*>}
 */
export default async function (data) {
    const name = data.moduleName;
    const path = composePath(name);
    return await import(path);
};