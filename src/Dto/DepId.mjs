// @ts-check

/**
 * @namespace TeqFw_Di_Dto_DepId
 * @description Dependency identity DTO and factory.
 */

import TeqFw_Di_Enum_Composition from '../Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../Enum/Platform.mjs';

/**
 * DTO for dependency identity records and its factory.
 */

/** @type {typeof TeqFw_Di_Enum_Platform[keyof typeof TeqFw_Di_Enum_Platform]} */
const DFLT_PLATFORM = TeqFw_Di_Enum_Platform.TEQ;
/**
 * Runtime DTO for parsed dependency identity.
 */
export default class DTO {
    /** @type {string} Resolved module namespace. */
    moduleName = '';

    /** @type {TeqFw_Di_Enum_Platform[keyof TeqFw_Di_Enum_Platform]} Module platform. */
    platform = TeqFw_Di_Enum_Platform.TEQ;

    /** @type {string|null} Requested export name. */
    exportName = null;

    /** @type {TeqFw_Di_Enum_Composition[keyof TeqFw_Di_Enum_Composition]} Composition mode. */
    composition = TeqFw_Di_Enum_Composition.AS_IS;

    /** @type {TeqFw_Di_Enum_Life[keyof TeqFw_Di_Enum_Life] | null} Lifecycle mode. */
    life = null;

    /** @type {string[]} Ordered Wrapper names. */
    wrappers = [];

    /** @type {string} Original Dependency Identifier string. */
    origin = '';
}

/**
 * Factory for immutable dependency identity DTO.
 */
export class Factory {
    /**
     * Creates a frozen dependency identity DTO from coherent internal data.
     *
     * @param {Partial<TeqFw_Di_Dto_DepId>} [input]
     * @returns {TeqFw_Di_Dto_DepId}
     */
    create({
        moduleName = '',
        platform = DFLT_PLATFORM,
        exportName = null,
        life = null,
        wrappers = [],
        origin = '',
    } = {}) {

        const dto = new DTO();

        dto.moduleName = moduleName;
        dto.platform = platform;
        dto.exportName = exportName;
        dto.life = life;

        dto.composition = dto.life === null
            ? TeqFw_Di_Enum_Composition.AS_IS
            : TeqFw_Di_Enum_Composition.FACTORY;

        dto.wrappers = [...wrappers];
        dto.origin = origin;

        Object.freeze(dto.wrappers);
        return Object.freeze(dto);
    }
}
