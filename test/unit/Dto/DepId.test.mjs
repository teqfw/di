import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import DTO, {Factory} from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_AddressKind from '../../../src/Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../../../src/Enum/Lifestyle.mjs';

describe('TeqFw_Di_Dto_DepId', () => {
    const factory = new Factory();

    it('contains exactly the normalized semantic Dependency Identifier fields', () => {
        const dto = factory.create({
            addressKind: TeqFw_Di_Enum_AddressKind.TEQ,
            address: 'Ns_Module',
            lifestyle: TeqFw_Di_Enum_Lifestyle.DIRECT,
        });

        assert.deepStrictEqual(Object.keys(dto).sort(), [
            'address',
            'addressKind',
            'exportName',
            'lifestyle',
            'wrappers',
        ]);
        assert.strictEqual(dto.addressKind, TeqFw_Di_Enum_AddressKind.TEQ);
        assert.strictEqual(dto.address, 'Ns_Module');
        assert.strictEqual(dto.exportName, null);
        assert.strictEqual(dto.lifestyle, TeqFw_Di_Enum_Lifestyle.DIRECT);
        assert.deepStrictEqual(dto.wrappers, []);
    });

    it('retains coherent supplied semantic values', () => {
        const dto = factory.create({
            addressKind: TeqFw_Di_Enum_AddressKind.NODE,
            address: 'fs/promises',
            exportName: 'readFile',
            lifestyle: TeqFw_Di_Enum_Lifestyle.SINGLETON,
            wrappers: ['log', 'proxy'],
        });

        assert.strictEqual(dto.addressKind, TeqFw_Di_Enum_AddressKind.NODE);
        assert.strictEqual(dto.address, 'fs/promises');
        assert.strictEqual(dto.exportName, 'readFile');
        assert.strictEqual(dto.lifestyle, TeqFw_Di_Enum_Lifestyle.SINGLETON);
        assert.deepStrictEqual(dto.wrappers, ['log', 'proxy']);
    });

    it('clones and freezes wrappers', () => {
        const wrappers = ['w1'];
        const dto = factory.create({
            addressKind: TeqFw_Di_Enum_AddressKind.TEQ,
            address: 'Ns_Module',
            lifestyle: TeqFw_Di_Enum_Lifestyle.DIRECT,
            wrappers,
        });

        assert.notStrictEqual(dto.wrappers, wrappers);
        assert.ok(Object.isFrozen(dto.wrappers));
    });

    it('returns a frozen DTO instance', () => {
        const dto = factory.create({
            addressKind: TeqFw_Di_Enum_AddressKind.TEQ,
            address: 'Ns_Module',
            lifestyle: TeqFw_Di_Enum_Lifestyle.DIRECT,
        });

        assert.ok(dto instanceof DTO);
        assert.ok(Object.isFrozen(dto));
    });
});
