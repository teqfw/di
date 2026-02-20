// @ts-check

/**
 * DTO and factory for resolver namespace rule records.
 */

/**
 * Runtime DTO for one namespace resolution rule.
 */
export class DTO {
    /** @type {string|undefined} Namespace prefix in depId module name. */
    prefix;
    /** @type {string|undefined} Import target base for matched namespace. */
    target;
    /** @type {string|undefined} Default extension appended to matched module path. */
    defaultExt;
}

/**
 * Factory for resolver namespace DTO with optional immutability.
 */
export default class Factory {
    /**
     * Creates normalized resolver namespace DTO.
     *
     * @param {Partial<TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$>|Record<string, unknown>} [input] Source values.
     * @param {{immutable?: boolean}|Record<string, unknown>} [options] Factory options.
     * @returns {TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$}
     */
    create(input, options) {
        /** @type {Partial<TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$>|Record<string, unknown>} */
        const source = (input && (typeof input === 'object')) ? input : {};
        /** @type {{immutable?: boolean}|Record<string, unknown>} */
        const mode = (options && (typeof options === 'object')) ? options : {};

        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$} */
        const dto = new DTO();
        dto.prefix = (typeof source.prefix === 'string') ? source.prefix : undefined;
        dto.target = (typeof source.target === 'string') ? source.target : undefined;
        dto.defaultExt = (typeof source.defaultExt === 'string') ? source.defaultExt : undefined;

        if (mode.immutable === true) {
            Object.freeze(dto);
        }

        return dto;
    }
}
