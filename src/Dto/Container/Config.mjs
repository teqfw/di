// @ts-check

/**
 * @namespace TeqFw_Di_Dto_Container_Config
 * @description Immutable JSON-safe construction policy for one Container.
 */

import {Factory as TeqFw_Di_Dto_ModuleRouter_Config_Namespace_Factory} from '../ModuleRouter/Config/Namespace.mjs';

/** @typedef {import('../ModuleRouter/Config/Namespace.mjs').default} TeqFw_Di_Dto_ModuleRouter_Config_Namespace */

/**
 * @typedef {object} TeqFw_Di_Dto_Container_Config_Mock
 * @property {string} specifier
 * @property {unknown} value
 */

/**
 * Immutable Container construction policy.
 */
export default class TeqFw_Di_Dto_Container_Config {
    /** @type {ReadonlyArray<TeqFw_Di_Dto_ModuleRouter_Config_Namespace>} */
    namespaces = [];
    /** @type {ReadonlyArray<string>} */
    preprocessors = [];
    /** @type {ReadonlyArray<string>} */
    postprocessors = [];
    /** @type {string|null} */
    hardener = null;
    /** @type {boolean} */
    logging = false;
    /** @type {boolean} */
    introspection = false;
    /** @type {ReadonlyArray<TeqFw_Di_Dto_Container_Config_Mock>} */
    mocks = [];
}

/**
 * Creates immutable Container configuration DTOs from JSON-safe values.
 */
export class Factory {
    constructor() {
        const namespaceFactory = new TeqFw_Di_Dto_ModuleRouter_Config_Namespace_Factory();

        /**
         * @param {{namespaces?: Array<{prefix: string, target: string, defaultExt: string}>, preprocessors?: string[], postprocessors?: string[], hardener?: string|null, logging?: boolean, introspection?: boolean, mocks?: TeqFw_Di_Dto_Container_Config_Mock[]}} [data]
         * @returns {TeqFw_Di_Dto_Container_Config}
         */
        this.create = function (data = {}) {
            const dto = new TeqFw_Di_Dto_Container_Config();
            dto.namespaces = Object.freeze((data.namespaces ?? []).map((item) => namespaceFactory.create(item)));
            dto.preprocessors = Object.freeze([...(data.preprocessors ?? [])]);
            dto.postprocessors = Object.freeze([...(data.postprocessors ?? [])]);
            dto.hardener = data.hardener ?? null;
            dto.logging = data.logging === true;
            dto.introspection = data.introspection === true;
            dto.mocks = Object.freeze((data.mocks ?? []).map((item) => Object.freeze({
                specifier: item.specifier,
                value: item.value,
            })));
            return Object.freeze(dto);
        };
    }
}
