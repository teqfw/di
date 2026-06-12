// @ts-check

/**
 * @namespace TeqFw_Di_Internal_DepsDecl_Test
 */

import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {readDepsDecl} from '../../../src/Internal/DepsDecl.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../../src/Enum/Platform.mjs';

/** @type {TeqFw_Di_Dto_DepId__Factory} */
const factory = new TeqFw_Di_Dto_DepId_Factory();

describe('TeqFw_Di_Internal_DepsDecl', () => {
    it('returns empty object when __deps__ is absent', () => {
        const depId = factory.create({
            moduleName: 'Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        const result = readDepsDecl({}, depId);
        assert.deepStrictEqual(result, {});
    });

    it('throws when __deps__ is not a plain object', () => {
        const depId = factory.create({
            moduleName: 'Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        assert.throws(() => readDepsDecl({__deps__: []}, depId));
        assert.throws(() => readDepsDecl({__deps__: null}, depId));
        assert.throws(() => readDepsDecl({__deps__: 42}, depId));
    });

    it('returns flat __deps__ for default export', () => {
        const depId = factory.create({
            moduleName: 'Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        const namespace = {
            __deps__: {repo: 'App_Repo$', log: 'App_Log$'},
        };
        const result = readDepsDecl(namespace, depId);
        assert.deepStrictEqual(result, {repo: 'App_Repo$', log: 'App_Log$'});
    });

    it('returns export-scoped __deps__ for named export', () => {
        const depId = factory.create({
            moduleName: 'Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'Factory',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        const namespace = {
            __deps__: {
                default: {repo: 'App_Repo$'},
                Factory: {repo: 'App_FactoryRepo$'},
            },
        };
        const result = readDepsDecl(namespace, depId);
        assert.deepStrictEqual(result, {repo: 'App_FactoryRepo$'});
    });

    it('returns empty object for named export not present in scoped __deps__', () => {
        const depId = factory.create({
            moduleName: 'Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'Other',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: null,
        });
        const namespace = {
            __deps__: {
                default: {repo: 'App_Repo$'},
            },
        };
        const result = readDepsDecl(namespace, depId);
        assert.deepStrictEqual(result, {});
    });

    it('throws when __deps__ contains mixed flat and nested values', () => {
        const depId = factory.create({
            moduleName: 'Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        const namespace = {
            __deps__: {repo: 'App_Repo$', inner: {sub: 'App_Sub$'}},
        };
        assert.throws(() => readDepsDecl(namespace, depId));
    });

    it('is deterministic for identical inputs', () => {
        const depId = factory.create({
            moduleName: 'Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        const namespace = {__deps__: {a: 'X$', b: 'Y$'}};
        const r1 = readDepsDecl(namespace, depId);
        const r2 = readDepsDecl(namespace, depId);
        assert.deepStrictEqual(r1, r2);
    });
});
