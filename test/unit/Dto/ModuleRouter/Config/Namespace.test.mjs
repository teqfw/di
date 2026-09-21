import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import DTO, {Factory} from '../../../../../src/Dto/ModuleRouter/Config/Namespace.mjs';

describe('TeqFw_Di_Dto_ModuleRouter_Config_Namespace', () => {
    const factory = new Factory();

    it('creates a frozen Namespace Mapping DTO', () => {
        const dto = factory.create({prefix: 'App_', target: '/app', defaultExt: '.mjs'});
        assert.ok(dto instanceof DTO);
        assert.deepStrictEqual(Object.keys(dto).sort(), ['defaultExt', 'prefix', 'target']);
        assert.ok(Object.isFrozen(dto));
    });

    it('normalizes partial inputs and drops extra fields', () => {
        const dto = factory.create({extra: true, prefix: 'Ns_'});
        assert.equal(dto.prefix, 'Ns_');
        assert.equal(dto.target, undefined);
        assert.equal(dto.defaultExt, undefined);
    });
});
