// @ts-check

/**
 * @namespace TeqFw_Di_Parser
 * @description Dependency Identifier parser that builds normalized semantic DTOs.
 */

import TeqFw_Di_Enum_AddressKind from './Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from './Enum/Lifestyle.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from './Dto/DepId.mjs';

/**
 * Parser for Dependency Identifiers into frozen dependency identity DTOs.
*/
export default class TeqFw_Di_Parser {
    /**
     * Creates parser instance.
     */
    constructor() {
        /** @type {TeqFw_Di_Dto_DepId__Factory} Factory used to construct dependency identity DTO. */
        const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();
        /** @type {{log(message: string): void}|null} */
        let logger = null;

        /**
         * Detects Address Kind prefix and strips it from the source string.
         *
         * @param {string} source Dependency Identifier source without validation.
         * @returns {{addressKind: typeof TeqFw_Di_Enum_AddressKind[keyof typeof TeqFw_Di_Enum_AddressKind], source: string}}
         */
        const detectAddressKind = function (source) {
            /** @type {typeof TeqFw_Di_Enum_AddressKind[keyof typeof TeqFw_Di_Enum_AddressKind]} */
            let addressKind = TeqFw_Di_Enum_AddressKind.TEQ;
            if (source.startsWith('node:')) {
                addressKind = TeqFw_Di_Enum_AddressKind.NODE;
                return {addressKind, source: source.slice(5)};
            }
            if (source.startsWith('npm:')) {
                addressKind = TeqFw_Di_Enum_AddressKind.NPM;
                return {addressKind, source: source.slice(4)};
            }
            if (source.startsWith('teq:')) {
                throw new Error('Explicit teq: prefix is forbidden.');
            }
            return {addressKind, source};
        };

        /**
         * Parses Lifestyle and Wrapper suffix from the source string.
         *
         * @param {string} source Dependency Identifier source without Address Kind prefix.
         * @param {typeof TeqFw_Di_Enum_AddressKind[keyof typeof TeqFw_Di_Enum_AddressKind]} addressKind
         * @returns {{core: string, lifestyle: typeof TeqFw_Di_Enum_Lifestyle[keyof typeof TeqFw_Di_Enum_Lifestyle], lifestyleDeclared: boolean, wrappers: string[]}}
         */
        const parseLifestyle = function (source, addressKind) {
            /** @type {typeof TeqFw_Di_Enum_Lifestyle[keyof typeof TeqFw_Di_Enum_Lifestyle]} */
            let lifestyle = TeqFw_Di_Enum_Lifestyle.DIRECT;
            let lifestyleDeclared = false;
            /** @type {string[]} */
            let wrappers = [];
            let core = source;

            const markerMatch = core.match(/(\${1,3})(?:_[a-z][0-9A-Za-z]*)*$/);
            if (markerMatch) {
                const marker = markerMatch[1];
                const suffix = markerMatch[0].slice(marker.length);
                lifestyleDeclared = true;
                if (marker === '$') lifestyle = TeqFw_Di_Enum_Lifestyle.SINGLETON;
                else if (marker === '$$') lifestyle = TeqFw_Di_Enum_Lifestyle.TRANSIENT;
                else if (marker === '$$$') lifestyle = TeqFw_Di_Enum_Lifestyle.DIRECT;
                else throw new Error('Lifestyle marker is invalid.');

                core = core.slice(0, markerMatch.index);
                if (suffix.length > 0) {
                    wrappers = suffix.slice(1).split('_');
                }
                return {core, lifestyle, lifestyleDeclared, wrappers};
            }

            if (source.includes('$')) throw new Error('Invalid Lifestyle encoding.');
            if ((addressKind !== TeqFw_Di_Enum_AddressKind.NODE) && /(?:^|[^_])_[a-z][0-9A-Za-z]*$/.test(source)) {
                throw new Error('Wrapper without a Lifestyle marker is forbidden.');
            }

            return {core, lifestyle, lifestyleDeclared, wrappers};
        };

        /**
         * Splits Address and export names from canonical core string.
         *
         * @param {string} core Dependency Identifier core without Lifestyle suffix.
         * @returns {{address: string, exportName: string|null}}
         */
        const parseAddressExport = function (core) {
            const firstDelim = core.indexOf('__');
            const lastDelim = core.lastIndexOf('__');
            if ((firstDelim !== -1) && (firstDelim !== lastDelim)) throw new Error('Export delimiter must appear at most once.');
            if (core.startsWith('__') || core.endsWith('__')) throw new Error('Malformed export segment.');

            let address = core;
            /** @type {string|null} */
            let exportName = null;

            if (firstDelim !== -1) {
                address = core.slice(0, firstDelim);
                exportName = core.slice(firstDelim + 2);
                if (!exportName) throw new Error('Export must be non-empty.');
                if (exportName.includes('_')) throw new Error('Export must not contain _.');
                if (exportName.includes('$')) throw new Error('Export must not contain $.');
            }

            return {address, exportName};
        };

        /**
         * Validates a prepared Address for Address-Kind-specific rules.
         *
         * @param {string} address
         * @param {typeof TeqFw_Di_Enum_AddressKind[keyof typeof TeqFw_Di_Enum_AddressKind]} addressKind
         * @returns {void}
         */
        const assertAddress = function (address, addressKind) {
            if (!address) throw new Error('Address must be non-empty.');
            if (address.startsWith('_') || address.startsWith('$')) throw new Error('Address must not start with _ or $.');
            if (address.includes('__')) throw new Error('Address must not contain __.');
            if (address.includes('$')) throw new Error('Address must not contain $.');
            if (addressKind !== TeqFw_Di_Enum_AddressKind.NPM) {
                if (addressKind === TeqFw_Di_Enum_AddressKind.NODE) {
                    if (!/^[A-Za-z_][$0-9A-Za-z_/-]*$/.test(address)) {
                        throw new Error('Node Address must satisfy the built-in specifier form.');
                    }
                } else if (!/^[A-Za-z_][$0-9A-Za-z_]*$/.test(address)) {
                    throw new Error('Teq Address must satisfy the canonical identifier form.');
                }
            } else if (!/^[@A-Za-z_][$0-9A-Za-z_./-]*$/.test(address)) {
                throw new Error('npm Address must satisfy the package specifier form.');
            }
        };

        /**
         * Parses one Dependency Identifier and returns a normalized frozen dependency DTO.
         *
         * @param {string} specifier Dependency Identifier string.
         * @returns {TeqFw_Di_Dto_DepId}
         */
        this.parse = function (specifier) {
            if (logger) logger.log(`Parser.parse: input='${specifier}'.`);
            if (typeof specifier !== 'string') throw new Error('Dependency Identifier must be a string.');
            if (specifier.length === 0) throw new Error('Dependency Identifier must be non-empty.');
            if (!/^[\x00-\x7F]+$/.test(specifier)) throw new Error('Dependency Identifier must be ASCII.');

            const detected = detectAddressKind(specifier);
            const addressKind = detected.addressKind;
            const source = detected.source;
            if (source.length === 0) throw new Error('Address must be non-empty.');
            const parsedLifestyle = parseLifestyle(source, addressKind);
            const split = parseAddressExport(parsedLifestyle.core);
            assertAddress(split.address, addressKind);

            let exportName = split.exportName;
            if (parsedLifestyle.lifestyleDeclared) {
                if (exportName === null) {
                    exportName = 'default';
                }
            }

            const depId = depIdFactory.create({
                addressKind,
                address: split.address,
                exportName,
                lifestyle: parsedLifestyle.lifestyle,
                wrappers: parsedLifestyle.wrappers,
            });
            if (logger) logger.log(`Parser.parse: produced='${depId.addressKind}::${depId.address}'.`);
            return depId;
        };

        /**
         * Sets optional internal logger.
         *
         * @param {{log(message: string): void}|null} next
         * @returns {void}
         */
        this.setLogger = function (next) {
            logger = next;
        };
    }
}
