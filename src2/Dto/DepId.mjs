// @ts-check

import TeqFw_Di_Enum_Composition from '../Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../Enum/Platform.mjs';

/**
 * DTO and factory for dependency identity records.
 */

/** @type {typeof TeqFw_Di_Enum_Platform[keyof typeof TeqFw_Di_Enum_Platform]} */
const DFLT_PLATFORM = TeqFw_Di_Enum_Platform.TEQ;
/** @type {typeof TeqFw_Di_Enum_Composition[keyof typeof TeqFw_Di_Enum_Composition]} */
const DFLT_COMPOSITION = TeqFw_Di_Enum_Composition.AS_IS;

/** @type {Set<string>} */
const PLATFORM_VALUES = new Set(Object.values(TeqFw_Di_Enum_Platform));
/** @type {Set<string>} */
const COMPOSITION_VALUES = new Set(Object.values(TeqFw_Di_Enum_Composition));
/** @type {Set<string>} */
const LIFE_VALUES = new Set(Object.values(TeqFw_Di_Enum_Life));

/**
 * Runtime DTO for parsed dependency identity.
 */
export class DTO {
    /** @type {string} Resolved module namespace. */
    moduleName;

    /** @type {TeqFw_Di_Enum_Platform[keyof TeqFw_Di_Enum_Platform]} Module platform. */
    platform;

    /** @type {string|null} Requested export name. */
    exportName;

    /** @type {TeqFw_Di_Enum_Composition[keyof TeqFw_Di_Enum_Composition]} Composition mode. */
    composition;

    /** @type {TeqFw_Di_Enum_Life[keyof TeqFw_Di_Enum_Life] | null} Lifecycle mode. */
    life;

    /** @type {string[]} Wrapper pipeline names. */
    wrappers;

    /** @type {string} Original EDD string. */
    origin;
}

/**
 * Factory for dependency identity DTO with optional immutability.
 */
export default class Factory {
    /**
     * Creates normalized dependency identity DTO.
     *
     * @param {unknown} [input]
     * @param {{immutable?: boolean}} [options]
     * @returns {TeqFw_Di_DepId$DTO}
     */
    create(input, options) {
        /** @type {Record<string, unknown>} */
        const source = (input && typeof input === 'object')
            ? /** @type {Record<string, unknown>} */ (input)
            : {};

        const dto = new DTO();

        dto.moduleName =
            typeof source.moduleName === 'string'
                ? source.moduleName
                : '';

        const platform =
            typeof source.platform === 'string'
                ? source.platform
                : undefined;

        dto.platform =
            platform && PLATFORM_VALUES.has(platform)
                ? platform
                : DFLT_PLATFORM;

        /** @type {string|null} */
        let exportName = null;

        if (source.exportName === null) {
            exportName = null;
        } else if (typeof source.exportName === 'string') {
            exportName = source.exportName;
        }

        dto.exportName = exportName;

        const composition =
            typeof source.composition === 'string'
                ? source.composition
                : undefined;

        dto.composition =
            composition && COMPOSITION_VALUES.has(composition)
                ? composition
                : DFLT_COMPOSITION;

        const life =
            typeof source.life === 'string'
                ? source.life
                : undefined;

        dto.life =
            life && LIFE_VALUES.has(life)
                ? life
                : null;

        dto.wrappers =
            Array.isArray(source.wrappers)
                ? source.wrappers.filter(item => typeof item === 'string')
                : [];

        dto.origin =
            typeof source.origin === 'string'
                ? source.origin
                : '';

        if (options?.immutable === true) {
            Object.freeze(dto.wrappers);
            Object.freeze(dto);
        }

        return dto;
    }
}
