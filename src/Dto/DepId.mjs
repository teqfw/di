// @ts-check

/**
 * @namespace TeqFw_Di_Dto_DepId
 * @description Normalized Dependency Identifier DTO and factory.
 */

import TeqFw_Di_Enum_AddressKind from '../Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../Enum/Lifestyle.mjs';

/**
 * Runtime DTO for one normalized semantic Dependency Identifier.
 */
export default class DTO {
    /** @type {TeqFw_Di_Enum_AddressKind[keyof TeqFw_Di_Enum_AddressKind]} Address classification. */
    addressKind = TeqFw_Di_Enum_AddressKind.TEQ;

    /** @type {string} Prepared address body. */
    address = '';

    /** @type {string|null} Selected export name. */
    exportName = null;

    /** @type {TeqFw_Di_Enum_Lifestyle[keyof TeqFw_Di_Enum_Lifestyle]} Dependency Lifestyle. */
    lifestyle = TeqFw_Di_Enum_Lifestyle.DIRECT;

    /** @type {string[]} Ordered Wrapper names. */
    wrappers = [];
}

/**
 * Factory for immutable dependency identity DTO.
 */
export class Factory {
    /**
     * Creates a frozen Dependency Identifier DTO from coherent internal data.
     *
     * @param {{addressKind: TeqFw_Di_Enum_AddressKind[keyof TeqFw_Di_Enum_AddressKind], address: string, exportName?: string|null, lifestyle: TeqFw_Di_Enum_Lifestyle[keyof TeqFw_Di_Enum_Lifestyle], wrappers?: string[]}} input
     * @returns {TeqFw_Di_Dto_DepId}
     */
    create({
        addressKind,
        address,
        exportName = null,
        lifestyle,
        wrappers = [],
    }) {

        const dto = new DTO();

        dto.addressKind = addressKind;
        dto.address = address;
        dto.exportName = exportName;
        dto.lifestyle = lifestyle;
        dto.wrappers = [...wrappers];

        Object.freeze(dto.wrappers);
        return Object.freeze(dto);
    }
}
