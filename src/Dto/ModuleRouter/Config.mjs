// @ts-check

/**
 * @namespace TeqFw_Di_Dto_ModuleRouter_Config
 * @description ModuleRouter configuration DTO and factory.
 */

import {Factory as TeqFw_Di_Dto_ModuleRouter_Config_Namespace_Factory} from './Config/Namespace.mjs';

/** @typedef {import('./Config/Namespace.mjs').default} TeqFw_Di_Dto_ModuleRouter_Config_Namespace */

/**
 * Runtime DTO for ModuleRouter configuration.
 */
export default class DTO {
    /** @type {TeqFw_Di_Dto_ModuleRouter_Config_Namespace[]} Namespace mappings. */
    namespaces = [];
}

/** @typedef {DTO} TeqFw_Di_Dto_ModuleRouter_Config */

/**
 * Factory for immutable ModuleRouter configuration DTO.
 */
export class Factory {
    constructor() {
        /** @type {TeqFw_Di_Dto_ModuleRouter_Config_Namespace_Factory} */
        const namespaceFactory = new TeqFw_Di_Dto_ModuleRouter_Config_Namespace_Factory();

        /**
         * Creates normalized frozen ModuleRouter configuration.
         *
         * @param {Partial<TeqFw_Di_Dto_ModuleRouter_Config>|Record<string, unknown>} [input]
         * @returns {TeqFw_Di_Dto_ModuleRouter_Config}
         */
        this.create = function (input) {
            /** @type {Partial<TeqFw_Di_Dto_ModuleRouter_Config>|Record<string, unknown>} */
            const source = (input && typeof input === 'object') ? input : {};
            /** @type {TeqFw_Di_Dto_ModuleRouter_Config} */
            const dto = new DTO();
            /** @type {unknown[]} */
            const items = Array.isArray(source.namespaces) ? source.namespaces : [];
            dto.namespaces = items.map((item) => namespaceFactory.create(/** @type {Record<string, unknown>} */ (item)));
            Object.freeze(dto.namespaces);
            return Object.freeze(dto);
        };
    }
}
