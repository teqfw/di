import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Def_Parser from '../../../src/Def/Parser.mjs';
import {DTO as TeqFw_Di_Dto_DepId_DTO} from '../../../src/Dto/DepId.mjs';
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

function parseAndAssert(parser, cdc, expected) {
    const dto = parser.parse(cdc);
    assertDepId(dto, expected);
}

describe('TeqFw_Di_Def_Parser', () => {
    const parser = new TeqFw_Di_Def_Parser();

    describe('teq platform positive cases', () => {
        const cases = [
            // no lifecycle, no wrappers
            {cdc: `${MODULE}`, exp: {life: null, exportName: null, composition: TeqFw_Di_Enum_Composition.AS_IS, wrappers: []}},
            {cdc: `${MODULE}__${NAMED_EXPORT}`, exp: {life: null, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: []}},
            // singleton
            {cdc: `${MODULE}$`, exp: {life: TeqFw_Di_Enum_Life.SINGLETON, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: []}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$`, exp: {life: TeqFw_Di_Enum_Life.SINGLETON, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: []}},
            {cdc: `${MODULE}$_${WRAPPER_LOG}`, exp: {life: TeqFw_Di_Enum_Life.SINGLETON, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG]}},
            {cdc: `${MODULE}$_${WRAPPER_LOG}_${WRAPPER_PROXY}`, exp: {life: TeqFw_Di_Enum_Life.SINGLETON, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG, WRAPPER_PROXY]}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$_${WRAPPER_LOG}`, exp: {life: TeqFw_Di_Enum_Life.SINGLETON, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG]}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$_${WRAPPER_LOG}_${WRAPPER_PROXY}`, exp: {life: TeqFw_Di_Enum_Life.SINGLETON, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG, WRAPPER_PROXY]}},
            // transient
            {cdc: `${MODULE}$$`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: []}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$$`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: []}},
            {cdc: `${MODULE}$$_${WRAPPER_LOG}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG]}},
            {cdc: `${MODULE}$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG, WRAPPER_PROXY]}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$$_${WRAPPER_LOG}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG]}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG, WRAPPER_PROXY]}},
            // explicit direct marker
            {cdc: `${MODULE}$$$`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: []}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$$$`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: []}},
            {cdc: `${MODULE}$$$_${WRAPPER_LOG}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG]}},
            {cdc: `${MODULE}$$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: 'default', composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG, WRAPPER_PROXY]}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$$$_${WRAPPER_LOG}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG]}},
            {cdc: `${MODULE}__${NAMED_EXPORT}$$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`, exp: {life: TeqFw_Di_Enum_Life.TRANSIENT, exportName: NAMED_EXPORT, composition: TeqFw_Di_Enum_Composition.FACTORY, wrappers: [WRAPPER_LOG, WRAPPER_PROXY]}},
        ];

        for (const one of cases) {
            it(`parses '${one.cdc}'`, () => {
                parseAndAssert(parser, one.cdc, {
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: MODULE,
                    ...one.exp,
                });
            });
        }

        it('maps implicit direct (no lifecycle marker) to direct', () => {
            parseAndAssert(parser, MODULE, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: null,
                life: null,
                composition: TeqFw_Di_Enum_Composition.AS_IS,
                wrappers: [],
            });
        });

        it('enforces transient to factory semantic rule', () => {
            parseAndAssert(parser, `${MODULE}$$`, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.TRANSIENT,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
        });

        it('enforces exportName=null to composition=as-is rule', () => {
            parseAndAssert(parser, `${MODULE}`, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: null,
                life: null,
                composition: TeqFw_Di_Enum_Composition.AS_IS,
                wrappers: [],
            });
        });
    });

    describe('implicit default equivalence', () => {
        it('treats Module$ and Module__default$ as structurally equivalent', () => {
            const left = parser.parse(`${MODULE}$`);
            const right = parser.parse(`${MODULE}__default$`);
            assertDepId(left, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.SINGLETON,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
            assertDepId(right, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.SINGLETON,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
            assert.strictEqual(left.platform, right.platform);
            assert.strictEqual(left.moduleName, right.moduleName);
            assert.strictEqual(left.exportName, right.exportName);
            assert.strictEqual(left.life, right.life);
            assert.strictEqual(left.composition, right.composition);
            assert.deepStrictEqual(left.wrappers, right.wrappers);
        });

        it('treats Module$$ and Module__default$$ as structurally equivalent', () => {
            const left = parser.parse(`${MODULE}$$`);
            const right = parser.parse(`${MODULE}__default$$`);
            assertDepId(left, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.TRANSIENT,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
            assertDepId(right, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.TRANSIENT,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
            assert.strictEqual(left.platform, right.platform);
            assert.strictEqual(left.moduleName, right.moduleName);
            assert.strictEqual(left.exportName, right.exportName);
            assert.strictEqual(left.life, right.life);
            assert.strictEqual(left.composition, right.composition);
            assert.deepStrictEqual(left.wrappers, right.wrappers);
        });
    });

    describe('invalid teq cases', () => {
        const invalidCases = [
            'Project_Package_Module_log',
            'Project_Package_Module__namedExport_log',
            '_log_Project_Package_Module$',
            'Project_Package_Module__named_Export$',
            'Project_Package_Module____$',
            'Project_Package_Module$$$$',
            // wrapper without lifecycle
            'Project_Package_Module_wrapper',
            // lifecycle longer than 3 markers
            'Project_Package_Module_____',
            // malformed export
            'Project_Package_Module__$',
            // moduleName starting with '$'
            '$Project_Package_Module$',
        ];

        for (const cdc of invalidCases) {
            it(`throws standard Error for '${cdc}'`, () => {
                assert.throws(() => parser.parse(cdc), Error);
            });
        }
    });

    describe('platform smoke tests', () => {
        it('uses teq platform when CDC has no platform prefix', () => {
            parseAndAssert(parser, `${MODULE}$`, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.SINGLETON,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
        });

        it('parses node platform without export', () => {
            parseAndAssert(parser, `node_${MODULE}$`, {
                platform: TeqFw_Di_Enum_Platform.NODE,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.SINGLETON,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
        });

        it('parses node platform with export', () => {
            parseAndAssert(parser, `node_${MODULE}__${NAMED_EXPORT}$$`, {
                platform: TeqFw_Di_Enum_Platform.NODE,
                moduleName: MODULE,
                exportName: NAMED_EXPORT,
                life: TeqFw_Di_Enum_Life.TRANSIENT,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
        });

        it('throws for invalid node wrapper usage', () => {
            assert.throws(() => parser.parse(`node_${MODULE}_log`), Error);
        });

        it('parses npm platform without export', () => {
            parseAndAssert(parser, `npm_${MODULE}$`, {
                platform: TeqFw_Di_Enum_Platform.NPM,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.SINGLETON,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
        });

        it('parses npm platform with export', () => {
            parseAndAssert(parser, `npm_${MODULE}__${NAMED_EXPORT}$$`, {
                platform: TeqFw_Di_Enum_Platform.NPM,
                moduleName: MODULE,
                exportName: NAMED_EXPORT,
                life: TeqFw_Di_Enum_Life.TRANSIENT,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [],
            });
        });

        it('throws for explicit teq prefix', () => {
            assert.throws(() => parser.parse(`teq_${MODULE}$`), Error);
        });
    });

    describe('spec ambiguity notes', () => {
        it('keeps lifecycle-before-wrapper interpretation used by valid examples', () => {
            // The grammar examples accept strings like `Module$$_log`.
            // A strict "maximal trailing '$'" interpretation would reject these strings.
            // This test locks behavior to examples and wrapper-after-lifecycle semantics.
            parseAndAssert(parser, `${MODULE}$$_${WRAPPER_LOG}`, {
                platform: TeqFw_Di_Enum_Platform.TEQ,
                moduleName: MODULE,
                exportName: 'default',
                life: TeqFw_Di_Enum_Life.TRANSIENT,
                composition: TeqFw_Di_Enum_Composition.FACTORY,
                wrappers: [WRAPPER_LOG],
            });
        });
    });

    describe('dto and immutability', () => {
        it('returns DepId DTO instance', () => {
            const dto = parser.parse(`${MODULE}$`);
            assert.ok(dto instanceof TeqFw_Di_Dto_DepId_DTO);
        });

        it('returns frozen DepId DTO and frozen wrappers', () => {
            const dto = parser.parse(`${MODULE}$$_${WRAPPER_LOG}_${WRAPPER_PROXY}`);
            assert.ok(Object.isFrozen(dto));
            assert.ok(Object.isFrozen(dto.wrappers));
        });
    });
});
