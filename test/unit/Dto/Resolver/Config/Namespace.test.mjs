import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import * as Module from '../../../../../src/Dto/Resolver/Config/Namespace.mjs';
import DTO, {Factory} from '../../../../../src/Dto/Resolver/Config/Namespace.mjs';

describe('TeqFw_Di_Dto_Resolver_Config_Namespace', () => {
    const factory = new Factory();

    it('exports only factory and DTO', () => {
        assert.deepStrictEqual(Object.keys(Module).sort(), ['Factory', 'default']);
    });

    it('factory exposes only create public method', () => {
        assert.deepStrictEqual(
            Object.getOwnPropertyNames(Factory.prototype).filter((name) => name !== 'constructor'),
            ['create'],
        );
    });

    it('DTO class contains no user-defined methods', () => {
        assert.deepStrictEqual(
            Object.getOwnPropertyNames(DTO.prototype).filter((name) => name !== 'constructor'),
            [],
        );
    });

    it('creates DTO with complete structural shape only', () => {
        const dto = factory.create(undefined);
        assert.ok(dto instanceof DTO);
        assert.deepStrictEqual(Object.keys(dto).sort(), ['defaultExt', 'prefix', 'target']);
    });

    it('normalizes undefined and partial inputs without throwing', () => {
        assert.doesNotThrow(() => factory.create(undefined));
        assert.doesNotThrow(() => factory.create({prefix: 'App_'}));
        assert.doesNotThrow(() => factory.create(null));
        assert.doesNotThrow(() => factory.create(123));
        assert.doesNotThrow(() => factory.create('abc'));

        const dto = factory.create({prefix: 'App_'});
        assert.ok('prefix' in dto);
        assert.ok('target' in dto);
        assert.ok('defaultExt' in dto);
    });

    it('drops extra input fields', () => {
        const dto = factory.create({
            defaultExt: 'mjs',
            extra: 'must-be-removed',
            prefix: 'Ns_',
            target: '/app/src',
        });
        assert.deepStrictEqual(Object.keys(dto).sort(), ['defaultExt', 'prefix', 'target']);
        assert.strictEqual(Object.prototype.hasOwnProperty.call(dto, 'extra'), false);
    });

    it('is frozen after creation', () => {
        const dto = factory.create({});
        assert.ok(Object.isFrozen(dto));
    });

    it('rejects mutation after creation', () => {
        const dto = factory.create({});
        assert.ok(Object.isFrozen(dto));
        assert.throws(() => {
            dto.prefix = 'Changed_';
        }, TypeError);
    });

    it('is deterministic for identical input', () => {
        const input = {defaultExt: 'mjs', prefix: 'Ns_', target: '/path'};
        const one = factory.create(input);
        const two = factory.create(input);
        assert.notStrictEqual(one, two);
        assert.deepStrictEqual(one, two);
    });
});
