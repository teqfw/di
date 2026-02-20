import TeqFw_Di_Dto_Resolver_Config_Namespace from './Config/Namespace.mjs';

export class DTO {
    namespaces;
    nodeModulesRoot;
}

export default class Factory {
    #nsFactory = new TeqFw_Di_Dto_Resolver_Config_Namespace();

    create(input, options) {
        const source = (input && (typeof input === 'object')) ? input : {};
        const mode = (options && (typeof options === 'object')) ? options : {};

        const dto = new DTO();
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
