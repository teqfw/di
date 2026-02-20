import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import * as ModuleConfig from '../../../../src2/Dto/Resolver/Config.mjs';
import Factory, {DTO} from '../../../../src2/Dto/Resolver/Config.mjs';
import NamespaceFactory, {DTO as NamespaceDTO} from '../../../../src2/Dto/Resolver/Config/Namespace.mjs';

describe('TeqFw_Di_Dto_Resolver_Config', () => {
    const factory = new Factory();

    it('exports only factory and DTO', () => {
        assert.deepStrictEqual(Object.keys(ModuleConfig).sort(), ['DTO', 'default']);
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
        assert.deepStrictEqual(Object.keys(dto).sort(), ['namespaces', 'nodeModulesRoot']);
    });

    it('normalizes namespaces to empty array for missing or invalid input', () => {
        assert.strictEqual(Array.isArray(factory.create(undefined).namespaces), true);
        assert.strictEqual(Array.isArray(factory.create({}).namespaces), true);
        assert.strictEqual(Array.isArray(factory.create({namespaces: null}).namespaces), true);
        assert.strictEqual(Array.isArray(factory.create({namespaces: 'bad'}).namespaces), true);
        assert.strictEqual(Array.isArray(factory.create({namespaces: 123}).namespaces), true);
        assert.deepStrictEqual(factory.create({namespaces: null}).namespaces, []);
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

    it('does not throw on malformed input and does not validate business semantics', () => {
        assert.doesNotThrow(() => factory.create(null));
        assert.doesNotThrow(() => factory.create(123));
        assert.doesNotThrow(() => factory.create('abc'));
        assert.doesNotThrow(() => factory.create({nodeModulesRoot: {unexpected: true}}));
    });

    it('is mutable by default', () => {
        const dto = factory.create({});
        assert.ok(!Object.isFrozen(dto));
        assert.ok(!Object.isFrozen(dto.namespaces));
        dto.nodeModulesRoot = '/changed';
        dto.namespaces.push({unexpected: true});
        assert.strictEqual(dto.nodeModulesRoot, '/changed');
        assert.strictEqual(dto.namespaces.length, 1);
    });

    it('is frozen in immutable mode at factory structural level', () => {
        const dto = factory.create(
            {namespaces: [{prefix: 'A_', target: '/a', defaultExt: 'mjs'}], nodeModulesRoot: '/root'},
            {immutable: true},
        );
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
