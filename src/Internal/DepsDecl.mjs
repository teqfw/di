// @ts-check

/**
 * @namespace TeqFw_Di_Internal_DepsDecl
 * @description Shared helper for reading `__deps__` declarations.
 */

/**
 * Reads dependency declaration map for the selected export of a module namespace.
 *
 * @param {object} namespace Loaded module namespace.
 * @param {TeqFw_Di_DepId__DTO} depId Canonical dependency identity.
 * @returns {Record<string, unknown>} Dependency declaration map.
 */
export function readDepsDecl(namespace, depId) {
    /** @type {unknown} */
    const deps = Reflect.get(namespace, '__deps__');
    if (deps === undefined) return {};
    if ((deps === null) || (typeof deps !== 'object') || Array.isArray(deps)) {
        throw new Error('__deps__ must be a plain object.');
    }
    const exportName = depId.exportName === null ? 'default' : depId.exportName;
    const exportScoped = Reflect.get(/** @type {object} */ (deps), exportName);
    if ((exportScoped !== undefined) && (exportScoped !== null) && (typeof exportScoped === 'object') && !Array.isArray(exportScoped)) {
        const values = Object.values(/** @type {Record<string, unknown>} */ (exportScoped));
        if (!values.every((value) => typeof value === 'string')) {
            throw new Error('__deps__ export entries must map dependency names to CDC strings.');
        }
        return /** @type {Record<string, unknown>} */ (exportScoped);
    }
    if (exportName === 'default') {
        const values = Object.values(/** @type {Record<string, unknown>} */ (deps));
        if (values.every((value) => typeof value === 'string')) {
            return /** @type {Record<string, unknown>} */ (deps);
        }
        if (values.every((value) => (value !== null) && (typeof value === 'object') && !Array.isArray(value))) {
            return {};
        }
        throw new Error('__deps__ must be either flat or export-scoped.');
    }
    return {};
}
