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

    it('preserves prepared mapping fields exactly', () => {
        const dto = factory.create({prefix: 'Ns_', target: '/modules', defaultExt: '.js'});
        assert.equal(dto.prefix, 'Ns_');
        assert.equal(dto.target, '/modules');
        assert.equal(dto.defaultExt, '.js');
    });

    it('rejects an incomplete prepared mapping', () => {
        assert.throws(
            () => factory.create(/** @type {any} */ ({prefix: 'Ns_'})),
            /requires prefix, target, and defaultExt/,
        );
    });
});
