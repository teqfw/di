import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Instantiate from '../../../src/Container/Instantiate.mjs';

/**
 * @param {Partial<TeqFw_Di_Dto_DepId>} [patch]
 * @returns {TeqFw_Di_Dto_DepId}
 */
function createDepId(patch = {}) {
    return /** @type {TeqFw_Di_Dto_DepId} */ ({
        moduleName: 'Ns_App_Module',
        platform: 'teq',
        exportName: null,
        composition: 'A',
        life: 'direct',
        wrappers: [],
        origin: 'unit-test',
        ...patch,
    });
}

describe('TeqFw_Di_Container_Instantiate', () => {
    const instantiator = new TeqFw_Di_Container_Instantiate();

    it('selects the whole namespace when no export is requested', () => {
        const namespace = {default: 1, named: 2};
        const depId = createDepId({exportName: null});

        const result = instantiator.select(depId, namespace);

        assert.strictEqual(result, namespace);
    });

    it('selects a named export without invoking it', () => {
        const expected = {ok: true};
        const namespace = {named: expected};
        const depId = createDepId({exportName: 'named'});

        const result = instantiator.select(depId, namespace);

        assert.strictEqual(result, expected);
    });

    it('factory invokes function', () => {
        const resolvedDeps = {a: 1};
        const namespace = {
            make: (/** @type {object} */ deps) => ({deps}),
        };
        const depId = createDepId({exportName: 'make'});

        const result = instantiator.produce(instantiator.select(depId, namespace), resolvedDeps);

        assert.deepStrictEqual(result, {deps: resolvedDeps});
    });

    it('factory invokes class with new', () => {
        class Service {
            /**
             * @param {Record<string, unknown>} deps
             */
            constructor(deps) {
                this.deps = deps;
            }
        }
        const resolvedDeps = {b: 2};
        const namespace = {Service};
        const depId = createDepId({exportName: 'Service'});

        const result = instantiator.produce(instantiator.select(depId, namespace), resolvedDeps);

        assert.ok(result instanceof Service);
        assert.strictEqual(result.deps, resolvedDeps);
    });

    it('missing export throws', () => {
        const depId = createDepId({exportName: 'missing'});
        assert.throws(() => instantiator.select(depId, {present: 1}), Error);
    });

    it('non-callable factory throws', () => {
        assert.throws(() => instantiator.produce(123, {}), Error);
    });

    it('async factory returns Promise and throws', () => {
        const namespace = {
            asyncFactory: () => Promise.resolve(1),
        };
        assert.throws(() => instantiator.produce(namespace.asyncFactory, {}), Error);
    });

    it('factory result may be proxy that throws on `.then` access', () => {
        const proxy = new Proxy({ok: true}, {
            get(target, prop, receiver) {
                if (prop === 'then') throw new Error('then access denied');
                return Reflect.get(target, prop, receiver);
            }
        });
        const namespace = {
            make: () => proxy,
        };

        const result = instantiator.produce(namespace.make, {});

        assert.strictEqual(result, proxy);
    });

    it('constructor error is propagated', () => {
        class Broken {
            constructor() {
                throw new Error('boom');
            }
        }
        const namespace = {Broken};

        assert.throws(() => instantiator.produce(namespace.Broken, {}), /boom/);
    });

    it('deterministic across repeated calls', () => {
        const expected = {same: true};
        const depId = createDepId({exportName: 'value'});
        const namespace = {value: expected};
        const resolvedDeps = {x: 1};

        const first = instantiator.select(depId, namespace);
        const second = instantiator.select(depId, namespace);

        assert.strictEqual(first, expected);
        assert.strictEqual(second, expected);
        assert.strictEqual(first, second);
        assert.deepStrictEqual(resolvedDeps, {x: 1});
    });

    it('does not pre-validate namespace shape and fails at point of use', () => {
        const depId = createDepId({exportName: 'named'});
        assert.throws(() => instantiator.select(depId, /** @type {object} */ (/** @type {unknown} */ (null))), TypeError);
        assert.throws(() => instantiator.select(depId, /** @type {object} */ (/** @type {unknown} */ ('bad'))), TypeError);
    });
});
