// @ts-check

import TeqFw_Di_Enum_Composition from '../Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../Enum/Platform.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../Dto/DepId.mjs';

/**
 * Parser for CDC identifiers into frozen dependency identity DTO.
*/
export default class TeqFw_Di_Def_Parser {
    /**
     * Creates parser instance.
     */
    constructor() {
        /** @type {TeqFw_Di_Dto_DepId$Factory} Factory used to construct dependency identity DTO. */
        const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();
        /** @type {{log(message: string): void}|null} */
        let logger = null;

        /**
         * Parses one CDC identifier and returns normalized frozen dependency DTO.
         *
         * @param {string} cdc CDC identifier string.
         * @returns {TeqFw_Di_DepId$DTO}
         */
        this.parse = function (cdc) {
            if (logger) logger.log(`Parser.parse: input='${cdc}'.`);
            if (typeof cdc !== 'string') throw new Error('CDC must be a string.');
            if (cdc.length === 0) throw new Error('CDC must be non-empty.');
            if (!/^[\x00-\x7F]+$/.test(cdc)) throw new Error('CDC must be ASCII.');

            /** @type {string} */
            const origin = cdc;
            let source = cdc;
            /** @type {typeof TeqFw_Di_Enum_Platform[keyof typeof TeqFw_Di_Enum_Platform]} */
            let platform = TeqFw_Di_Enum_Platform.TEQ;

            if (source.startsWith('node:')) {
                platform = TeqFw_Di_Enum_Platform.NODE;
                source = source.slice(5);
            } else if (source.startsWith('npm:')) {
                platform = TeqFw_Di_Enum_Platform.NPM;
                source = source.slice(4);
            } else if (source.startsWith('teq:')) {
                throw new Error('Explicit teq: prefix is forbidden.');
            }

            if (source.length === 0) throw new Error('moduleName must be non-empty.');

            /** @type {typeof TeqFw_Di_Enum_Life[keyof typeof TeqFw_Di_Enum_Life] | null} */
            let life = null;
            let lifecycleDeclared = false;
            /** @type {string[]} */
            let wrappers = [];
            let core = source;

            const markerMatch = core.match(/(\${1,3})(?:_[a-z][0-9A-Za-z]*)*$/);
            if (markerMatch) {
                const marker = markerMatch[1];
                const suffix = markerMatch[0].slice(marker.length);
                lifecycleDeclared = true;
                if (marker === '$') life = TeqFw_Di_Enum_Life.SINGLETON;
                else if (marker === '$$') life = TeqFw_Di_Enum_Life.TRANSIENT;
                else if (marker === '$$$') life = null;
                else throw new Error('Lifecycle marker is invalid.');

                core = core.slice(0, markerMatch.index);
                if (suffix.length > 0) {
                    wrappers = suffix.slice(1).split('_');
                }
            } else {
                if (source.includes('$')) throw new Error('Invalid lifecycle encoding.');
                if (/(?:^|[^_])_[a-z][0-9A-Za-z]*$/.test(source)) {
                    throw new Error('Wrapper without lifecycle is forbidden.');
                }
            }

            const firstDelim = core.indexOf('__');
            const lastDelim = core.lastIndexOf('__');
            if ((firstDelim !== -1) && (firstDelim !== lastDelim)) throw new Error('Export delimiter must appear at most once.');
            if (core.startsWith('__') || core.endsWith('__')) throw new Error('Malformed export segment.');

            let moduleName = core;
            /** @type {string|null} */
            let exportName = null;

            if (firstDelim !== -1) {
                moduleName = core.slice(0, firstDelim);
                exportName = core.slice(firstDelim + 2);
                if (!exportName) throw new Error('Export must be non-empty.');
                if (exportName.includes('_')) throw new Error('Export must not contain _.');
                if (exportName.includes('$')) throw new Error('Export must not contain $.');
            }

            if (!moduleName) throw new Error('moduleName must be non-empty.');
            if (moduleName.startsWith('_') || moduleName.startsWith('$')) throw new Error('moduleName must not start with _ or $.');
            if (moduleName.includes('__')) throw new Error('moduleName must not contain __.');
            if (moduleName.includes('$')) throw new Error('moduleName must not contain $.');
            if (platform !== TeqFw_Di_Enum_Platform.NPM) {
                if (!/^[A-Za-z_][$0-9A-Za-z_]*$/.test(moduleName)) {
                    throw new Error('moduleName must satisfy the canonical identifier form.');
                }
            } else if (!/^[@A-Za-z_][$0-9A-Za-z_./-]*$/.test(moduleName)) {
                throw new Error('npm moduleName must satisfy the package specifier form.');
            }

            /** @type {typeof TeqFw_Di_Enum_Composition[keyof typeof TeqFw_Di_Enum_Composition]} */
            let composition = TeqFw_Di_Enum_Composition.AS_IS;
            if (exportName !== null) {
                composition = TeqFw_Di_Enum_Composition.FACTORY;
            } else if (lifecycleDeclared) {
                composition = TeqFw_Di_Enum_Composition.FACTORY;
                exportName = 'default';
            }

            const depId = depIdFactory.create({
                moduleName,
                platform,
                exportName,
                composition,
                life,
                wrappers,
                origin,
            });
            if (logger) logger.log(`Parser.parse: produced='${depId.platform}::${depId.moduleName}'.`);
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
