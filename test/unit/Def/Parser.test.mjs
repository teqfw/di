import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Def_Parser from '../../../src/Def/Parser.mjs';
import TeqFw_Di_Dto_DepId_DTO from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../../src/Enum/Platform.mjs';

const MODULE = 'Project_Package_Module';
const NAMED_EXPORT = 'namedExport';
const WRAPPER_LOG = 'log';
const WRAPPER_PROXY = 'proxy';

function assertDepId(dto, expected) {
    assert.strictEqual(dto.platform, expected.platform);
    assert.strictEqual(dto.moduleName, expected.moduleName);
    assert.strictEqual(dto.exportName, expected.exportName);
    assert.strictEqual(dto.life, expected.life);
    assert.strictEqual(dto.composition, expected.composition);
    assert.deepStrictEqual(dto.wrappers, expected.wrappers);
}

describe('TeqFw_Di_Def_Parser', () => {
    const parser = new TeqFw_Di_Def_Parser();

    describe('accepted forms', () => {
        const cases = [
            {
                cdc: MODULE,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: null,
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.AS_IS,
                    wrappers: [],
                },
            },
            {
                cdc: `${MODULE}__${NAMED_EXPORT}`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: NAMED_EXPORT,
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [],
                },
            },
            {
                cdc: `${MODULE}$`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: 'default',
                    life: TeqFw_Di_Enum_Life.SINGLETON,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [],
                },
            },
            {
                cdc: `${MODULE}$$`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: 'default',
                    life: TeqFw_Di_Enum_Life.TRANSIENT,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [],
                },
            },
            {
                cdc: `${MODULE}$$$`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: 'default',
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [],
                },
            },
            {
                cdc: `${MODULE}$_${WRAPPER_LOG}`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: 'default',
                    life: TeqFw_Di_Enum_Life.SINGLETON,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [WRAPPER_LOG],
                },
            },
            {
                cdc: `${MODULE}$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: 'default',
                    life: TeqFw_Di_Enum_Life.TRANSIENT,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [WRAPPER_LOG, WRAPPER_PROXY],
                },
            },
            {
                cdc: `${MODULE}$$$_${WRAPPER_LOG}`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    exportName: 'default',
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [WRAPPER_LOG],
                },
            },
            {
                cdc: `node:fs`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NODE,
                    moduleName: 'fs',
                    exportName: null,
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.AS_IS,
                    wrappers: [],
                },
            },
            {
                cdc: `node:fs/promises`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NODE,
                    moduleName: 'fs/promises',
                    exportName: null,
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.AS_IS,
                    wrappers: [],
                },
            },
            {
                cdc: `node:child_process`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NODE,
                    moduleName: 'child_process',
                    exportName: null,
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.AS_IS,
                    wrappers: [],
                },
            },
            {
                cdc: `node:worker_threads`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NODE,
                    moduleName: 'worker_threads',
                    exportName: null,
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.AS_IS,
                    wrappers: [],
                },
            },
            {
                cdc: `node:worker_threads$`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NODE,
                    moduleName: 'worker_threads',
                    exportName: 'default',
                    life: TeqFw_Di_Enum_Life.SINGLETON,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [],
                },
            },
            {
                cdc: `node:child_process__execFile`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NODE,
                    moduleName: 'child_process',
                    exportName: 'execFile',
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [],
                },
            },
            {
                cdc: `npm:@vendor/package`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NPM,
                    moduleName: '@vendor/package',
                    exportName: null,
                    life: null,
                    composition: TeqFw_Di_Enum_Composition.AS_IS,
                    wrappers: [],
                },
            },
            {
                cdc: `npm:@vendor/package__default$$`,
                expected: {
                    platform: TeqFw_Di_Enum_Platform.NPM,
                    moduleName: '@vendor/package',
                    exportName: 'default',
                    life: TeqFw_Di_Enum_Life.TRANSIENT,
                    composition: TeqFw_Di_Enum_Composition.FACTORY,
                    wrappers: [],
                },
            },
        ];

        for (const one of cases) {
            it(`parses '${one.cdc}'`, () => {
                const dto = parser.parse(one.cdc);
                assertDepId(dto, one.expected);
            });
        }
    });

    describe('equivalence', () => {
        it('treats Module$ and Module__default$ as identical', () => {
            const left = parser.parse(`${MODULE}$`);
            const right = parser.parse(`${MODULE}__default$`);
            assert.strictEqual(left.platform, right.platform);
            assert.strictEqual(left.moduleName, right.moduleName);
            assert.strictEqual(left.exportName, right.exportName);
            assert.strictEqual(left.life, right.life);
            assert.strictEqual(left.composition, right.composition);
            assert.deepStrictEqual(left.wrappers, right.wrappers);
        });
    });

    describe('rejections', () => {
        const invalidCases = [
            '',
            'teq:Module',
            'teq:Module$',
            'node:',
            'node:fs:promises',
            'npm:',
            'node:fs$__default',
            'npm:@vendor/package__named_export',
            'Project_Package_Module_wrapper',
            'Project_Package_Module__named_export_wrapper',
            'Project_Package_Module____$',
            'Project_Package_Module$____',
            'Project_Package_Module$$_',
            'Project_Package_Module$$_Default',
            'Project_Package_Module$$$$',
            'Project_Package_Module__default__extra',
            'Project_Package_Module__',
            '_Project_Package_Module',
            '$Project_Package_Module',
            'Project_Package_Module__named_Export',
        ];

        for (const cdc of invalidCases) {
            it(`throws on '${cdc}'`, () => {
                assert.throws(() => parser.parse(cdc), Error);
            });
        }
    });

    describe('DTO shape', () => {
        it('returns DepId DTO instance', () => {
            const dto = parser.parse(MODULE);
            assert.ok(dto instanceof TeqFw_Di_Dto_DepId_DTO);
        });

        it('returns frozen DTO and wrappers', () => {
            const dto = parser.parse(`${MODULE}$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`);
            assert.ok(Object.isFrozen(dto));
            assert.ok(Object.isFrozen(dto.wrappers));
        });
    });
});
