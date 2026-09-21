// @ts-check

/**
 * @namespace TeqFw_Di_Container_Canonicalizer
 * @description Converts requested serialized identifiers into effective identities.
 */

import {buildDependencyKey} from '../Internal/DependencyKey.mjs';
import TeqFw_Di_Enum_AddressKind from '../Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../Enum/Lifestyle.mjs';
import {createResolutionContext} from './ResolutionContext.mjs';

/**
 * @typedef {{index: number, before: TeqFw_Di_Dto_DepId, after: TeqFw_Di_Dto_DepId, changed: boolean}} TeqFw_Di_Container_Canonicalizer_PreprocessEffect
 */

/**
 * Ensures a substituted Dependency Identifier is coherent before it becomes
 * effective resolution identity.
 *
 * @param {TeqFw_Di_Dto_DepId} depId
 * @returns {void}
 */
const assertCoherentDepId = function (depId) {
    const {addressKind, address, exportName, lifestyle, wrappers} = depId;
    if (!Object.values(TeqFw_Di_Enum_AddressKind).includes(addressKind)) {
        throw new Error(`Unsupported Address Kind: ${String(addressKind)}.`);
    }
    if (!Object.values(TeqFw_Di_Enum_Lifestyle).includes(lifestyle)) {
        throw new Error(`Unsupported Dependency Lifestyle: ${String(lifestyle)}.`);
    }
    if ((typeof address !== 'string') || !address) {
        throw new Error('Dependency Address must be a non-empty string.');
    }
    if ((exportName !== null) && ((typeof exportName !== 'string') || !exportName || exportName.includes('_') || exportName.includes('$'))) {
        throw new Error('Export Selection must be null or a supported export name.');
    }
    if (!Array.isArray(wrappers) || !wrappers.every((name) => typeof name === 'string' && /^[a-z][0-9A-Za-z]*$/.test(name))) {
        throw new Error('Wrapper Selection must contain supported ordered names.');
    }
    if ((address.startsWith('_')) || address.startsWith('$') || address.includes('__') || address.includes('$')) {
        throw new Error('Dependency Address contains reserved identifier syntax.');
    }
    if (addressKind === TeqFw_Di_Enum_AddressKind.TEQ && !/^[A-Za-z_][$0-9A-Za-z_]*$/.test(address)) {
        throw new Error('Teq Address must satisfy the canonical identifier form.');
    }
    if (addressKind === TeqFw_Di_Enum_AddressKind.NODE && !/^[A-Za-z_][$0-9A-Za-z_/-]*$/.test(address)) {
        throw new Error('Node Address must satisfy the built-in specifier form.');
    }
    if (addressKind === TeqFw_Di_Enum_AddressKind.NPM && !/^[@A-Za-z_][$0-9A-Za-z_./-]*$/.test(address)) {
        throw new Error('npm Address must satisfy the package specifier form.');
    }
};

/**
 * @typedef {object} TeqFw_Di_Container_Canonicalizer_Dependencies
 * @property {TeqFw_Di_Parser} parser
 * @property {TeqFw_Di_Dto_DepId__Factory} depIdFactory
 */

/**
 * Owns the requested-identity to effective-identity boundary. Parser owns the
 * serialized grammar; this component owns the ordered host substitutions.
 */
export default class TeqFw_Di_Container_Canonicalizer {
    /**
     * @param {TeqFw_Di_Container_Canonicalizer_Dependencies} deps
     */
    constructor({parser, depIdFactory}) {
        /** @type {((depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId)[]} */
        const preprocessors = [];

        /**
         * Registers one ordered substitution.
         *
         * @param {(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId} fn
         * @returns {void}
         */
        this.add = function (fn) {
            preprocessors.push(fn);
        };

        /**
         * Parses one requested serialized Dependency Identifier.
         *
         * @param {string} specifier
         * @returns {TeqFw_Di_Dto_DepId}
         */
        this.parse = function (specifier) {
            return parser.parse(specifier);
        };

        /**
         * Applies configured substitutions to one parsed requested identity.
         *
         * @param {TeqFw_Di_Dto_DepId} requested
         * @param {readonly TeqFw_Di_Dto_DepId[]} [ancestors]
         * @returns {{effective: TeqFw_Di_Dto_DepId, preprocessing: TeqFw_Di_Container_Canonicalizer_PreprocessEffect[]}}
         */
        this.preprocess = function (requested, ancestors = []) {
            /** @type {TeqFw_Di_Dto_DepId} */
            let effective = requested;
            /** @type {TeqFw_Di_Container_Canonicalizer_PreprocessEffect[]} */
            const preprocessing = [];
            for (const [index, fn] of preprocessors.entries()) {
                const before = effective;
                effective = depIdFactory.create(fn(
                    effective,
                    createResolutionContext(effective, ancestors)
                ));
                assertCoherentDepId(effective);
                preprocessing.push({
                    index,
                    before,
                    after: effective,
                    changed: buildDependencyKey(before) !== buildDependencyKey(effective),
                });
            }

            return {effective, preprocessing};
        };

        /**
         * Parses and applies all configured substitutions.
         *
         * @param {string} specifier
         * @param {readonly TeqFw_Di_Dto_DepId[]} [ancestors]
         * @returns {{specifier: string, requested: TeqFw_Di_Dto_DepId, effective: TeqFw_Di_Dto_DepId, preprocessing: TeqFw_Di_Container_Canonicalizer_PreprocessEffect[]}}
         */
        this.canonicalize = function (specifier, ancestors = []) {
            const requested = this.parse(specifier);
            return {specifier, requested, ...this.preprocess(requested, ancestors)};
        };
    }
}
