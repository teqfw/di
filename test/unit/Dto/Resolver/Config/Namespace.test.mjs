import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import DTO, {Factory} from '../../../../../src/Dto/Resolver/Config/Namespace.mjs';

describe('TeqFw_Di_Dto_Resolver_Config_Namespace', () => {
    const factory = new Factory();

    it('creates DTO with default values', () => {
        const dto = factory.create(undefined);
        assert.ok(dto instanceof DTO);
        assert.deepStrictEqual(Object.keys(dto).sort(), ['defaultExt', 'prefix', 'target']);
        assert.strictEqual(dto.prefix, undefined);
        assert.strictEqual(dto.target, undefined);
        assert.strictEqual(dto.defaultExt, undefined);
    });

    it('normalizes undefined and partial inputs', () => {
        const dto = factory.create({prefix: 'App_'});
        assert.strictEqual(dto.prefix, 'App_');
        assert.strictEqual(dto.target, undefined);
        assert.strictEqual(dto.defaultExt, undefined);
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

    it('is deterministic for identical input', () => {
        const input = {defaultExt: 'mjs', prefix: 'Ns_', target: '/path'};
        const one = factory.create(input);
        const two = factory.create(input);
        assert.notStrictEqual(one, two);
        assert.deepStrictEqual(one, two);
    });
});
