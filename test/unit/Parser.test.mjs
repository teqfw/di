import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Parser from '../../src/Parser.mjs';
import TeqFw_Di_Dto_DepId_DTO from '../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_AddressKind from '../../src/Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../../src/Enum/Lifestyle.mjs';

const ADDRESS = 'Project_Package_Module';
const NAMED_EXPORT = 'namedExport';
const WRAPPER_LOG = 'log';
const WRAPPER_PROXY = 'proxy';

/**
 * @param {TeqFw_Di_Dto_DepId} dto
 * @param {{addressKind: string, address: string, exportName: string|null, lifestyle: string, wrappers: string[]}} expected
 */
function assertDepId(dto, expected) {
    assert.deepStrictEqual({
        addressKind: dto.addressKind,
        address: dto.address,
        exportName: dto.exportName,
        lifestyle: dto.lifestyle,
        wrappers: [...dto.wrappers],
    }, expected);
}

/**
 * @param {string} addressKind
 * @param {string} address
 * @param {string|null} exportName
 * @param {string} lifestyle
 * @param {string[]} [wrappers]
 */
function expected(addressKind, address, exportName, lifestyle, wrappers = []) {
    return {addressKind, address, exportName, lifestyle, wrappers};
}

describe('TeqFw_Di_Parser', () => {
    const parser = new TeqFw_Di_Parser();

    describe('accepted forms', () => {
        /** @type {[string, {addressKind: string, address: string, exportName: string|null, lifestyle: string, wrappers: string[]}][]} */
        const cases = [
            [ADDRESS, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, null, TeqFw_Di_Enum_Lifestyle.DIRECT)],
            [`${ADDRESS}__${NAMED_EXPORT}`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, NAMED_EXPORT, TeqFw_Di_Enum_Lifestyle.DIRECT)],
            [`${ADDRESS}__default`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.DIRECT)],
            [`${ADDRESS}$`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.SINGLETON)],
            [`${ADDRESS}__default$`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.SINGLETON)],
            [`${ADDRESS}$$`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.TRANSIENT)],
            [`${ADDRESS}__default$$`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.TRANSIENT)],
            [`${ADDRESS}$$$`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.DIRECT)],
            [`${ADDRESS}__default$$$`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.DIRECT)],
            [`${ADDRESS}$_${WRAPPER_LOG}`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.SINGLETON, [WRAPPER_LOG])],
            [`${ADDRESS}$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.TRANSIENT, [WRAPPER_LOG, WRAPPER_PROXY])],
            [`${ADDRESS}$$$_${WRAPPER_LOG}`, expected(TeqFw_Di_Enum_AddressKind.TEQ, ADDRESS, 'default', TeqFw_Di_Enum_Lifestyle.DIRECT, [WRAPPER_LOG])],
            ['node:fs', expected(TeqFw_Di_Enum_AddressKind.NODE, 'fs', null, TeqFw_Di_Enum_Lifestyle.DIRECT)],
            ['node:fs/promises', expected(TeqFw_Di_Enum_AddressKind.NODE, 'fs/promises', null, TeqFw_Di_Enum_Lifestyle.DIRECT)],
            ['node:child_process__execFile', expected(TeqFw_Di_Enum_AddressKind.NODE, 'child_process', 'execFile', TeqFw_Di_Enum_Lifestyle.DIRECT)],
            ['npm:@vendor/package', expected(TeqFw_Di_Enum_AddressKind.NPM, '@vendor/package', null, TeqFw_Di_Enum_Lifestyle.DIRECT)],
            ['npm:@vendor/package__default$$', expected(TeqFw_Di_Enum_AddressKind.NPM, '@vendor/package', 'default', TeqFw_Di_Enum_Lifestyle.TRANSIENT)],
        ];

        for (const [specifier, value] of cases) {
            it(`parses '${specifier}'`, () => {
                assertDepId(parser.parse(specifier), /** @type {{addressKind: string, address: string, exportName: string|null, lifestyle: string, wrappers: string[]}} */ (value));
            });
        }
    });

    it('normalizes unmarked and explicit Direct forms to D', () => {
        const unmarked = parser.parse(ADDRESS);
        const explicit = parser.parse(`${ADDRESS}$$$`);

        assert.strictEqual(unmarked.lifestyle, TeqFw_Di_Enum_Lifestyle.DIRECT);
        assert.strictEqual(explicit.lifestyle, TeqFw_Di_Enum_Lifestyle.DIRECT);
    });

    describe('semantic equivalence', () => {
        const cases = [
            [`${ADDRESS}$`, `${ADDRESS}__default$`],
            [`${ADDRESS}$$`, `${ADDRESS}__default$$`],
            [`${ADDRESS}$$$`, `${ADDRESS}__default$$$`],
            [`${ADDRESS}$_${WRAPPER_LOG}`, `${ADDRESS}__default$_${WRAPPER_LOG}`],
        ];

        for (const [leftSpecifier, rightSpecifier] of cases) {
            it(`equates '${leftSpecifier}' and '${rightSpecifier}'`, () => {
                const left = parser.parse(leftSpecifier);
                const right = parser.parse(rightSpecifier);
                assertDepId(left, {
                    addressKind: right.addressKind,
                    address: right.address,
                    exportName: right.exportName,
                    lifestyle: right.lifestyle,
                    wrappers: [...right.wrappers],
                });
            });
        }
    });

    describe('Address Kind', () => {
        /** @type {[string, string][]} */
        const cases = [
            [ADDRESS, TeqFw_Di_Enum_AddressKind.TEQ],
            ['node:fs__default$', TeqFw_Di_Enum_AddressKind.NODE],
            ['npm:@vendor/package__default$$', TeqFw_Di_Enum_AddressKind.NPM],
        ];

        for (const [specifier, addressKind] of cases) {
            it(`classifies '${specifier}' as ${addressKind}`, () => {
                assert.strictEqual(parser.parse(specifier).addressKind, addressKind);
            });
        }

        it('rejects explicit teq: Address Kind syntax', () => {
            assert.throws(() => parser.parse('teq:Module'), Error);
        });
    });

    describe('rejections', () => {
        const invalidCases = [
            '', 'teq:Module', 'teq:Module$', 'node:', 'node:fs:promises', 'npm:',
            'node:fs$__default', 'npm:@vendor/package__named_export',
            'Project_Package_Module_wrapper', 'Project_Package_Module__named_export_wrapper',
            'Project_Package_Module____$', 'Project_Package_Module$____',
            'Project_Package_Module$$_', 'Project_Package_Module$$_Default',
            'Project_Package_Module$$$$', 'Project_Package_Module__default__extra',
            'Project_Package_Module__', '_Project_Package_Module', '$Project_Package_Module',
            'Project_Package_Module__named_Export',
        ];

        for (const specifier of invalidCases) {
            it(`throws on '${specifier}'`, () => {
                assert.throws(() => parser.parse(specifier), Error);
            });
        }
    });

    describe('DTO shape', () => {
        it('returns a frozen DepId DTO and Wrapper Selection', () => {
            const dto = parser.parse(`${ADDRESS}$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`);
            assert.ok(dto instanceof TeqFw_Di_Dto_DepId_DTO);
            assert.ok(Object.isFrozen(dto));
            assert.ok(Object.isFrozen(dto.wrappers));
        });
    });
});
