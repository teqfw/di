import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import DTO, {Factory} from '../../../../src/Dto/Resolver/Config.mjs';
import NamespaceDTO, {Factory as NamespaceFactory} from '../../../../src/Dto/Resolver/Config/Namespace.mjs';

describe('TeqFw_Di_Dto_Resolver_Config', () => {
    const factory = new Factory();

    it('creates DTO with default values', () => {
        const dto = factory.create(undefined);
        assert.ok(dto instanceof DTO);
        assert.deepStrictEqual(dto.namespaces, []);
        assert.strictEqual(dto.nodeModulesRoot, undefined);
    });

    it('preserves nodeModulesRoot structurally and keeps key when missing', () => {
        const withValue = factory.create({nodeModulesRoot: '/app/node_modules'});
        assert.strictEqual(withValue.nodeModulesRoot, '/app/node_modules');

        const missing = factory.create({});
        assert.ok(Object.prototype.hasOwnProperty.call(missing, 'nodeModulesRoot'));
        assert.strictEqual(missing.nodeModulesRoot, undefined);
    });

    it('drops extra input fields', () => {
        const dto = factory.create({
            extra: 'must-be-removed',
            namespaces: [],
            nodeModulesRoot: '/app/node_modules',
        });
        assert.deepStrictEqual(Object.keys(dto).sort(), ['namespaces', 'nodeModulesRoot']);
        assert.strictEqual(Object.prototype.hasOwnProperty.call(dto, 'extra'), false);
    });

    it('converts namespace items using namespace DTO factory and forbids direct object reuse', () => {
        const inputItem = {defaultExt: 'mjs', prefix: 'App_', target: '/app/src'};
        const dto = factory.create({namespaces: [inputItem]});
        assert.strictEqual(dto.namespaces.length, 1);
        assert.ok(dto.namespaces[0] instanceof NamespaceDTO);
        assert.notStrictEqual(dto.namespaces[0], inputItem);
    });

    it('invokes nested namespace factory', () => {
        let called = 0;
        const origin = NamespaceFactory.prototype.create;
        NamespaceFactory.prototype.create = function (...args) {
            called += 1;
            return origin.apply(this, args);
        };
        try {
            factory.create({
                namespaces: [{prefix: 'A_', target: '/a', defaultExt: 'mjs'}, {prefix: 'B_', target: '/b', defaultExt: 'js'}],
            });
            assert.strictEqual(called, 2);
        } finally {
            NamespaceFactory.prototype.create = origin;
        }
    });

    it('is frozen after creation', () => {
        const dto = factory.create({});
        assert.ok(Object.isFrozen(dto));
        assert.ok(Object.isFrozen(dto.namespaces));
    });

    it('freezes nested namespace DTOs as well', () => {
        const dto = factory.create({
            namespaces: [{prefix: 'A_', target: '/a', defaultExt: 'mjs'}],
            nodeModulesRoot: '/root',
        });
        assert.ok(Object.isFrozen(dto));
        assert.ok(Object.isFrozen(dto.namespaces));
        assert.ok(Object.isFrozen(dto.namespaces[0]));
        assert.throws(() => {
            dto.nodeModulesRoot = '/changed';
        }, TypeError);
        assert.throws(() => {
            dto.namespaces.push('x');
        }, TypeError);
    });

    it('is deterministic for identical input', () => {
        const input = {
            namespaces: [{defaultExt: 'mjs', prefix: 'Ns_', target: '/path'}],
            nodeModulesRoot: '/app/node_modules',
        };
        const one = factory.create(input);
        const two = factory.create(input);
        assert.notStrictEqual(one, two);
        assert.deepStrictEqual(one, two);
    });
});
