export class DTO {
    prefix;
    target;
    defaultExt;
}

export default class Factory {
    create(input, options) {
        const source = (input && (typeof input === 'object')) ? input : {};
        const mode = (options && (typeof options === 'object')) ? options : {};

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
