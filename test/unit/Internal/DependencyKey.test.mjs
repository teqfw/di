// @ts-check

/**
 * @namespace TeqFw_Di_Internal_DependencyKey_Test
 */

import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {buildDependencyKey} from '../../../src/Internal/DependencyKey.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../../src/Enum/Platform.mjs';

/** @type {TeqFw_Di_Dto_DepId__Factory} */
const factory = new TeqFw_Di_Dto_DepId_Factory();

describe('TeqFw_Di_Internal_DependencyKey', () => {
    it('builds key with all fields populated', () => {
        const depId = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
            wrappers: ['log', 'proxy'],
            origin: 'App_Mod$_log_proxy',
        });
        const key = buildDependencyKey(depId);
        assert.strictEqual(key, 'teq::App_Mod::default::F::S::log|proxy');
    });

    it('builds key with null exportName and null life', () => {
        const depId = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
        });
        const key = buildDependencyKey(depId);
        assert.strictEqual(key, 'teq::App_Mod::::A::::');
    });

    it('builds key for node platform', () => {
        const depId = factory.create({
            moduleName: 'fs',
            platform: TeqFw_Di_Enum_Platform.NODE,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        const key = buildDependencyKey(depId);
        assert.strictEqual(key, 'node::fs::::A::::');
    });

    it('builds key for npm platform with scoped package', () => {
        const depId = factory.create({
            moduleName: '@vendor/package',
            platform: TeqFw_Di_Enum_Platform.NPM,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        const key = buildDependencyKey(depId);
        assert.strictEqual(key, 'npm::@vendor/package::default::F::S::');
    });

    it('excludes origin from key', () => {
        const depId1 = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            origin: 'App_Mod$',
        });
        const depId2 = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            origin: 'App_Mod__default$',
        });
        assert.strictEqual(buildDependencyKey(depId1), buildDependencyKey(depId2));
    });

    it('distinguishes different export names from same module', () => {
        const depId1 = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        const depId2 = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'Factory',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        assert.notStrictEqual(buildDependencyKey(depId1), buildDependencyKey(depId2));
    });

    it('distinguishes different lifecycle modes', () => {
        const depId1 = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        const depId2 = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
        });
        assert.notStrictEqual(buildDependencyKey(depId1), buildDependencyKey(depId2));
    });

    it('distinguishes different platforms', () => {
        const depId1 = factory.create({
            moduleName: 'fs',
            platform: TeqFw_Di_Enum_Platform.NODE,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        const depId2 = factory.create({
            moduleName: 'fs',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        assert.notStrictEqual(buildDependencyKey(depId1), buildDependencyKey(depId2));
    });

    it('is deterministic for identical inputs', () => {
        const depId = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
            wrappers: ['log'],
        });
        const k1 = buildDependencyKey(depId);
        const k2 = buildDependencyKey(depId);
        assert.strictEqual(k1, k2);
    });
});
