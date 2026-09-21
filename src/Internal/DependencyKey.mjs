// @ts-check

/**
 * @namespace TeqFw_Di_Internal_DependencyKey
 * @description Shared helper for structural dependency identity keys.
 */

/**
 * Builds deterministic structural key for dependency identity.
 *
 * Every semantic Dependency Identifier field contributes to the key used by
 * cache and graph lookups across runtime components.
 *
 * @param {TeqFw_Di_Dto_DepId} depId Dependency identity DTO.
 * @returns {string} Canonical structural key.
 */
export function buildDependencyKey(depId) {
    return JSON.stringify([
        depId.addressKind,
        depId.address,
        depId.exportName,
        depId.lifestyle,
        depId.wrappers,
    ]);
}
