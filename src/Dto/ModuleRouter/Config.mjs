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
         * Creates frozen ModuleRouter configuration from prepared mappings.
         *
         * @param {Partial<TeqFw_Di_Dto_ModuleRouter_Config>} [input]
         * @returns {TeqFw_Di_Dto_ModuleRouter_Config}
         */
        this.create = function ({namespaces = []} = {}) {
            /** @type {TeqFw_Di_Dto_ModuleRouter_Config} */
            const dto = new DTO();
            dto.namespaces = namespaces.map((item) => namespaceFactory.create(item));
            Object.freeze(dto.namespaces);
            return Object.freeze(dto);
        };
    }
}
