import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import Factory, {DTO} from '../../../src2/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../../src2/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../../src2/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../../src2/Enum/Platform.mjs';

describe('TeqFw_Di_Dto_DepId', () => {
    const factory = new Factory();

    it('returns DTO for undefined input', () => {
        const dto = factory.create(undefined);
        assert.ok(dto instanceof DTO);
    });

    it('returns DTO with complete structural shape', () => {
        const dto = factory.create(undefined);
        assert.deepStrictEqual(Object.keys(dto).sort(), [
            'composition',
            'exportName',
            'life',
            'moduleName',
            'origin',
            'platform',
            'wrappers',
        ]);
    });

    it('normalizes missing fields', () => {
        const dto = factory.create({});
        assert.strictEqual(dto.moduleName, '');
        assert.strictEqual(dto.platform, TeqFw_Di_Enum_Platform.TEQ);
        assert.strictEqual(dto.exportName, null);
        assert.strictEqual(dto.composition, TeqFw_Di_Enum_Composition.AS_IS);
        assert.strictEqual(dto.life, null);
        assert.deepStrictEqual(dto.wrappers, []);
        assert.strictEqual(dto.origin, '');
    });

    it('accepts valid literal values', () => {
        const dto = factory.create({
            moduleName: 'Ns_Module',
            platform: TeqFw_Di_Enum_Platform.NODE,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
            wrappers: ['w1', 'w2'],
            origin: 'node:Ns_Module$',
        });
        assert.strictEqual(dto.platform, TeqFw_Di_Enum_Platform.NODE);
        assert.strictEqual(dto.composition, TeqFw_Di_Enum_Composition.FACTORY);
        assert.strictEqual(dto.life, TeqFw_Di_Enum_Life.SINGLETON);
        assert.deepStrictEqual(dto.wrappers, ['w1', 'w2']);
    });

    it('rejects invalid literal values structurally without throwing', () => {
        const dto = factory.create({
            platform: 'bad-platform',
            composition: 'bad-composition',
            life: 'bad-life',
            exportName: 123,
            wrappers: ['ok', 1, {}, 'ok2'],
        });
        assert.strictEqual(dto.platform, TeqFw_Di_Enum_Platform.TEQ);
        assert.strictEqual(dto.composition, TeqFw_Di_Enum_Composition.AS_IS);
        assert.strictEqual(dto.life, null);
        assert.strictEqual(dto.exportName, null);
        assert.deepStrictEqual(dto.wrappers, ['ok', 'ok2']);
    });

    it('clones wrappers', () => {
        const wrappers = ['w1'];
        const dto = factory.create({wrappers});
        assert.notStrictEqual(dto.wrappers, wrappers);
    });

    it('freezes wrappers in immutable mode', () => {
        const dto = factory.create({wrappers: ['w1']}, {immutable: true});
        assert.ok(Object.isFrozen(dto.wrappers));
    });

    it('freezes DTO in immutable mode', () => {
        const dto = factory.create({}, {immutable: true});
        assert.ok(Object.isFrozen(dto));
    });

    it('does not freeze in mutable mode', () => {
        const dto = factory.create({}, {immutable: false});
        assert.ok(!Object.isFrozen(dto));
        assert.ok(!Object.isFrozen(dto.wrappers));
    });

    it('does not throw on invalid input', () => {
        assert.doesNotThrow(() => factory.create(null));
        assert.doesNotThrow(() => factory.create(123));
        assert.doesNotThrow(() => factory.create('abc'));
    });
});
