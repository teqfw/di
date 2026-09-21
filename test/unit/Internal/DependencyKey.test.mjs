// @ts-check

/**
 * @namespace TeqFw_Di_Internal_DependencyKey_Test
 */

import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {buildDependencyKey} from '../../../src/Internal/DependencyKey.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_AddressKind from '../../../src/Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../../../src/Enum/Lifestyle.mjs';

/** @type {TeqFw_Di_Dto_DepId__Factory} */
const factory = new TeqFw_Di_Dto_DepId_Factory();

/**
 * @param {Partial<Pick<TeqFw_Di_Dto_DepId, 'addressKind'|'address'|'exportName'|'lifestyle'|'wrappers'>>} [patch]
 * @returns {TeqFw_Di_Dto_DepId}
 */
function createDepId(patch = {}) {
    return factory.create({
        addressKind: TeqFw_Di_Enum_AddressKind.TEQ,
        address: 'App_Mod',
        exportName: 'default',
        lifestyle: TeqFw_Di_Enum_Lifestyle.SINGLETON,
        wrappers: [],
        ...patch,
    });
}

describe('TeqFw_Di_Internal_DependencyKey', () => {
    it('deterministically encodes every semantic Dependency Identifier field', () => {
        const depId = createDepId({wrappers: ['log', 'proxy']});
        assert.strictEqual(
            buildDependencyKey(depId),
            JSON.stringify(['teq', 'App_Mod', 'default', 'S', ['log', 'proxy']])
        );
    });

    it('preserves null Export Selection and Direct Lifestyle', () => {
        const depId = createDepId({
            exportName: null,
            lifestyle: TeqFw_Di_Enum_Lifestyle.DIRECT,
        });
        assert.strictEqual(buildDependencyKey(depId), JSON.stringify(['teq', 'App_Mod', null, 'D', []]));
    });

    it('distinguishes Address Kind, Address, Export Selection, Lifestyle, and ordered Wrappers', () => {
        const baseline = createDepId({wrappers: ['first', 'second']});
        const variants = [
            createDepId({addressKind: TeqFw_Di_Enum_AddressKind.NODE, address: 'App_Mod', wrappers: ['first', 'second']}),
            createDepId({address: 'App_Other', wrappers: ['first', 'second']}),
            createDepId({exportName: 'Factory', wrappers: ['first', 'second']}),
            createDepId({lifestyle: TeqFw_Di_Enum_Lifestyle.TRANSIENT, wrappers: ['first', 'second']}),
            createDepId({wrappers: ['second', 'first']}),
        ];

        for (const variant of variants) {
            assert.notStrictEqual(buildDependencyKey(baseline), buildDependencyKey(variant));
        }
    });

    it('is stable for identical semantic Dependency Identifiers', () => {
        const depId = createDepId({wrappers: ['log']});
        assert.strictEqual(buildDependencyKey(depId), buildDependencyKey(depId));
    });
});
