// @ts-check

/**
 * @namespace TeqFw_Di_Dto_Resolver_Config
 * @description Resolver configuration DTO and factory.
 */

import {Factory as TeqFw_Di_Dto_Resolver_Config_Namespace_Factory} from './Config/Namespace.mjs';

/**
 * DTO for resolver configuration records and its factory.
 */

/**
 * Runtime DTO for resolver configuration.
 */
export default class DTO {
    /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace__DTO[]} Namespace resolution rules. */
    namespaces;

    /** @type {string|undefined} Optional node_modules root prefix for npm modules. */
    nodeModulesRoot;
}

/**
 * Factory for immutable resolver configuration DTO.
 */
export class Factory {
    /**
     * Creates factory instance.
     */
    constructor() {
        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace_Factory} */
        const nsFactory = new TeqFw_Di_Dto_Resolver_Config_Namespace_Factory();

        /**
         * Creates normalized frozen resolver configuration DTO.
         *
         * @param {Partial<TeqFw_Di_Dto_Resolver_Config__DTO>|Record<string, unknown>} [input] Source values.
         * @returns {TeqFw_Di_Dto_Resolver_Config__DTO}
         */
        this.create = function (input) {
            /** @type {Partial<TeqFw_Di_Dto_Resolver_Config__DTO>|Record<string, unknown>} */
            const source = (input && (typeof input === 'object')) ? input : {};

            /** @type {TeqFw_Di_Dto_Resolver_Config__DTO} */
            const dto = new DTO();
            /** @type {unknown[]} */
            const items = Array.isArray(source.namespaces) ? source.namespaces : [];
            dto.namespaces = items.map((item) => nsFactory.create(item));
            dto.nodeModulesRoot = (typeof source.nodeModulesRoot === 'string') ? source.nodeModulesRoot : undefined;

            Object.freeze(dto.namespaces);
            return Object.freeze(dto);
        };
    }
}
