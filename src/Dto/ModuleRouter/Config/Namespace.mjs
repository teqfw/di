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
    /** @type {string} Namespace prefix. */
    prefix = '';

    /** @type {string} Module-location root. */
    target = '';

    /** @type {string} Default module extension. */
    defaultExt = '';
}

/**
 * Factory for immutable Namespace Mapping DTOs.
 */
export class Factory {
    /**
     * Creates one frozen prepared Namespace Mapping.
     *
     * @param {TeqFw_Di_Dto_ModuleRouter_Config_Namespace} input
     * @returns {TeqFw_Di_Dto_ModuleRouter_Config_Namespace}
     */
    create({prefix, target, defaultExt}) {
        if ((prefix === undefined) || (target === undefined) || (defaultExt === undefined)) {
            throw new Error('Prepared Namespace Mapping requires prefix, target, and defaultExt.');
        }
        /** @type {TeqFw_Di_Dto_ModuleRouter_Config_Namespace} */
        const dto = new DTO();
        dto.prefix = prefix;
        dto.target = target;
        dto.defaultExt = defaultExt;
        return Object.freeze(dto);
    }
}
