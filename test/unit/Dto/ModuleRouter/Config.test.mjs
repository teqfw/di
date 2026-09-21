import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import DTO, {Factory} from '../../../../src/Dto/ModuleRouter/Config.mjs';
import NamespaceDTO from '../../../../src/Dto/ModuleRouter/Config/Namespace.mjs';

describe('TeqFw_Di_Dto_ModuleRouter_Config', () => {
    const factory = new Factory();

    it('creates a frozen DTO with namespace mappings only', () => {
        const dto = factory.create({namespaces: [{prefix: 'App_', target: '/app', defaultExt: '.mjs'}]});
        assert.ok(dto instanceof DTO);
        assert.ok(dto.namespaces[0] instanceof NamespaceDTO);
        assert.deepStrictEqual(Object.keys(dto), ['namespaces']);
        assert.ok(Object.isFrozen(dto));
        assert.ok(Object.isFrozen(dto.namespaces));
        assert.ok(Object.isFrozen(dto.namespaces[0]));
    });

    it('uses each prepared Namespace Mapping without compatibility fields', () => {
        const dto = factory.create({namespaces: [{prefix: 'App_', target: '/app', defaultExt: '.mjs'}]});
        assert.deepStrictEqual(Object.keys(dto), ['namespaces']);
        assert.equal(dto.namespaces[0].prefix, 'App_');
        assert.equal(dto.namespaces[0].target, '/app');
        assert.equal(dto.namespaces[0].defaultExt, '.mjs');
    });

    it('is deterministic for identical input', () => {
        const input = {namespaces: [{defaultExt: 'mjs', prefix: 'Ns_', target: '/path'}]};
        const one = factory.create(input);
        const two = factory.create(input);
        assert.notStrictEqual(one, two);
        assert.deepStrictEqual(one, two);
    });
});
