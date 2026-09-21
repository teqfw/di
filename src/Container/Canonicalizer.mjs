// @ts-check

/**
 * @namespace TeqFw_Di_Container_Canonicalizer
 * @description Converts requested serialized identifiers into effective identities.
 */

import {buildDependencyKey} from '../Internal/DependencyKey.mjs';
import {createResolutionContext} from './ResolutionContext.mjs';

/**
 * @typedef {{index: number, before: TeqFw_Di_Dto_DepId, after: TeqFw_Di_Dto_DepId, changed: boolean}} TeqFw_Di_Container_Canonicalizer_PreprocessEffect
 */

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
         * @returns {{requested: TeqFw_Di_Dto_DepId, effective: TeqFw_Di_Dto_DepId, preprocessing: TeqFw_Di_Container_Canonicalizer_PreprocessEffect[]}}
         */
        this.canonicalize = function (specifier, ancestors = []) {
            const requested = this.parse(specifier);
            return {requested, ...this.preprocess(requested, ancestors)};
        };
    }
}
