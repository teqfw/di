// @ts-check

/**
 * @namespace TeqFw_Di_Internal_DependencyKey
 * @description Shared helper for structural dependency identity keys.
 */

/**
 * Builds deterministic structural key for dependency identity.
 *
 * The key excludes `origin` and preserves field order used by cache and graph
 * lookups across runtime components.
 *
 * @param {TeqFw_Di_DepId__DTO} depId Dependency identity DTO.
 * @returns {string} Canonical structural key.
 */
export function buildDependencyKey(depId) {
    const exportName = depId.exportName === null ? '' : depId.exportName;
    const life = depId.life === null ? '' : depId.life;
    const wrappers = Array.isArray(depId.wrappers) ? depId.wrappers.join('|') : '';
    return [
        depId.platform,
        depId.moduleName,
        exportName,
        depId.composition,
        life,
        wrappers,
    ].join('::');
}
