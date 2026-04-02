// @ts-check

/**
 * @namespace TeqFw_Di_Dto_Resolver_Config_Namespace
 * @description Resolver namespace rule DTO and factory.
 */

/**
 * DTO for resolver namespace rule records and its factory.
 */

/**
 * Runtime DTO for one namespace resolution rule.
 */
export default class DTO {
    /** @type {string|undefined} Namespace prefix in depId module name. */
    prefix;

    /** @type {string|undefined} Import target base for matched namespace. */
    target;

    /** @type {string|undefined} Default extension appended to matched module path. */
    defaultExt;
}

/**
 * Factory for immutable resolver namespace DTO.
 */
export class Factory {
    /**
     * Creates normalized frozen resolver namespace DTO.
     *
     * @param {Partial<TeqFw_Di_Dto_Resolver_Config_Namespace__DTO>|Record<string, unknown>} [input] Source values.
     * @returns {TeqFw_Di_Dto_Resolver_Config_Namespace__DTO}
     */
    create(input) {
        /** @type {Partial<TeqFw_Di_Dto_Resolver_Config_Namespace__DTO>|Record<string, unknown>} */
        const source = (input && (typeof input === 'object')) ? input : {};

        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace__DTO} */
        const dto = new DTO();
        dto.prefix = (typeof source.prefix === 'string') ? source.prefix : undefined;
        dto.target = (typeof source.target === 'string') ? source.target : undefined;
        dto.defaultExt = (typeof source.defaultExt === 'string') ? source.defaultExt : undefined;

        return Object.freeze(dto);
    }
}
