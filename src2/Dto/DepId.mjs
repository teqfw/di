import TeqFw_Di_Enum_Composition from '../Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../Enum/Platform.mjs';

const DFLT_PLATFORM = TeqFw_Di_Enum_Platform.SRC;
const DFLT_COMPOSITION = TeqFw_Di_Enum_Composition.AS_IS;

const PLATFORM_VALUES = new Set(Object.values(TeqFw_Di_Enum_Platform));
const COMPOSITION_VALUES = new Set(Object.values(TeqFw_Di_Enum_Composition));
const LIFE_VALUES = new Set(Object.values(TeqFw_Di_Enum_Life));

export class DTO {
    moduleName;
    platform;
    exportName;
    composition;
    life;
    wrappers;
    origin;
}

export default class Factory {
    create(input, options) {
        const source = (input && (typeof input === 'object')) ? input : {};
        const mode = (options && (typeof options === 'object')) ? options : {};

        const dto = new DTO();
        dto.moduleName = (typeof source.moduleName === 'string') ? source.moduleName : '';
        dto.platform = PLATFORM_VALUES.has(source.platform) ? source.platform : DFLT_PLATFORM;
        dto.exportName = ((source.exportName === null) || (typeof source.exportName === 'string')) ? source.exportName : null;
        dto.composition = COMPOSITION_VALUES.has(source.composition) ? source.composition : DFLT_COMPOSITION;
        dto.life = LIFE_VALUES.has(source.life) ? source.life : null;
        dto.wrappers = Array.isArray(source.wrappers) ? source.wrappers.filter((item) => (typeof item === 'string')) : [];
        dto.origin = (typeof source.origin === 'string') ? source.origin : '';

        if (mode.immutable === true) {
            Object.freeze(dto.wrappers);
            Object.freeze(dto);
        }

        return dto;
    }
}
