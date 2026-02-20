// @ts-check

import TeqFw_Di_Dto_Resolver_Config_Namespace from './Config/Namespace.mjs';

/**
 * DTO and factory for resolver configuration records.
 */

/**
 * Runtime DTO for resolver configuration.
 */
export class DTO {
    /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$[]} Namespace resolution rules. */
    namespaces;
    /** @type {string|undefined} Optional node_modules root prefix for npm modules. */
    nodeModulesRoot;
}

/**
 * Factory for resolver configuration DTO with optional immutability.
 */
export default class Factory {
    /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace} Factory for namespace DTO records. */
    #nsFactory = new TeqFw_Di_Dto_Resolver_Config_Namespace();

    /**
     * Creates normalized resolver configuration DTO.
     *
     * @param {Partial<TeqFw_Di_Dto_Resolver_Config$DTO>|Record<string, unknown>} [input] Source values.
     * @param {{immutable?: boolean}|Record<string, unknown>} [options] Factory options.
     * @returns {TeqFw_Di_Dto_Resolver_Config$DTO}
     */
    create(input, options) {
        /** @type {Partial<TeqFw_Di_Dto_Resolver_Config$DTO>|Record<string, unknown>} */
        const source = (input && (typeof input === 'object')) ? input : {};
        /** @type {{immutable?: boolean}|Record<string, unknown>} */
        const mode = (options && (typeof options === 'object')) ? options : {};

        /** @type {TeqFw_Di_Dto_Resolver_Config$DTO} */
        const dto = new DTO();
        /** @type {unknown[]} */
        const items = Array.isArray(source.namespaces) ? source.namespaces : [];
        dto.namespaces = items.map((item) => this.#nsFactory.create(item, mode));
        dto.nodeModulesRoot = (typeof source.nodeModulesRoot === 'string') ? source.nodeModulesRoot : undefined;

        if (mode.immutable === true) {
            Object.freeze(dto.namespaces);
            Object.freeze(dto);
        }

        return dto;
    }
}
