// @ts-check

/**
 * @namespace TeqFw_Di_Dto_ModuleRouter_Config_Namespace
 * @description ModuleRouter Namespace Mapping DTO and factory.
 */

/**
 * Runtime DTO for one ModuleRouter Namespace Mapping.
 */
/** @typedef {import('./Namespace.mjs').default} TeqFw_Di_Dto_ModuleRouter_Config_Namespace */
export default class DTO {
    /** @type {string|undefined} Namespace prefix. */
    prefix;

    /** @type {string|undefined} Module-location root. */
    target;

    /** @type {string|undefined} Default module extension. */
    defaultExt;
}

/**
 * Factory for immutable Namespace Mapping DTOs.
 */
export class Factory {
    /**
     * Creates one normalized frozen Namespace Mapping.
     *
     * @param {Partial<TeqFw_Di_Dto_ModuleRouter_Config_Namespace>|Record<string, unknown>} [input]
     * @returns {TeqFw_Di_Dto_ModuleRouter_Config_Namespace}
     */
    create(input) {
        /** @type {Partial<TeqFw_Di_Dto_ModuleRouter_Config_Namespace>|Record<string, unknown>} */
        const source = (input && typeof input === 'object') ? input : {};
        /** @type {TeqFw_Di_Dto_ModuleRouter_Config_Namespace} */
        const dto = new DTO();
        dto.prefix = typeof source.prefix === 'string' ? source.prefix : undefined;
        dto.target = typeof source.target === 'string' ? source.target : undefined;
        dto.defaultExt = typeof source.defaultExt === 'string' ? source.defaultExt : undefined;
        return Object.freeze(dto);
    }
}
