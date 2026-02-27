import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Instantiate_Instantiator from '../../../../src/Container/Instantiate/Instantiator.mjs';
import TeqFw_Di_Enum_Composition from '../../../../src/Enum/Composition.mjs';

/**
 * @param {Partial<TeqFw_Di_DepId$DTO>} [patch]
 * @returns {TeqFw_Di_DepId$DTO}
 */
function createDepId(patch = {}) {
    return /** @type {TeqFw_Di_DepId$DTO} */ ({
        moduleName: 'Ns_App_Module',
        platform: 'teq',
        exportName: null,
        composition: TeqFw_Di_Enum_Composition.AS_IS,
        life: 'direct',
        wrappers: [],
        origin: 'unit-test',
        ...patch,
    });
}

describe('TeqFw_Di_Container_Instantiate_Instantiator', () => {
    const instantiator = new TeqFw_Di_Container_Instantiate_Instantiator();

    it('as-is returns namespace', () => {
        const namespace = {default: 1, named: 2};
        const depId = createDepId({
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS
        });

        const result = instantiator.instantiate(depId, namespace, {});

        assert.strictEqual(result, namespace);
    });

    it('as-is returns named export', () => {
        const expected = {ok: true};
        const namespace = {named: expected};
        const depId = createDepId({
            exportName: 'named',
            composition: TeqFw_Di_Enum_Composition.AS_IS
        });

        const result = instantiator.instantiate(depId, namespace, {});

        assert.strictEqual(result, expected);
    });

    it('factory invokes function', () => {
        const resolvedDeps = {a: 1};
        const namespace = {
            make: (deps) => ({deps}),
        };
        const depId = createDepId({
            exportName: 'make',
            composition: TeqFw_Di_Enum_Composition.FACTORY
        });

        const result = instantiator.instantiate(depId, namespace, resolvedDeps);

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
        const depId = createDepId({
            exportName: 'Service',
            composition: TeqFw_Di_Enum_Composition.FACTORY
        });

        const result = instantiator.instantiate(depId, namespace, resolvedDeps);

        assert.ok(result instanceof Service);
        assert.strictEqual(result.deps, resolvedDeps);
    });

    it('missing export throws', () => {
        const depId = createDepId({
            exportName: 'missing',
            composition: TeqFw_Di_Enum_Composition.AS_IS
        });
        assert.throws(() => instantiator.instantiate(depId, {present: 1}, {}), Error);
    });

    it('non-callable factory throws', () => {
        const depId = createDepId({
            exportName: 'bad',
            composition: TeqFw_Di_Enum_Composition.FACTORY
        });
        assert.throws(() => instantiator.instantiate(depId, {bad: 123}, {}), Error);
    });

    it('async factory returns Promise and throws', () => {
        const depId = createDepId({
            exportName: 'asyncFactory',
            composition: TeqFw_Di_Enum_Composition.FACTORY
        });
        const namespace = {
            asyncFactory: () => Promise.resolve(1),
        };
        assert.throws(() => instantiator.instantiate(depId, namespace, {}), Error);
    });

    it('constructor error is propagated', () => {
        class Broken {
            constructor() {
                throw new Error('boom');
            }
        }
        const depId = createDepId({
            exportName: 'Broken',
            composition: TeqFw_Di_Enum_Composition.FACTORY
        });
        const namespace = {Broken};

        assert.throws(() => instantiator.instantiate(depId, namespace, {}), /boom/);
    });

    it('deterministic across repeated calls', () => {
        const expected = {same: true};
        const depId = createDepId({
            exportName: 'value',
            composition: TeqFw_Di_Enum_Composition.AS_IS
        });
        const namespace = {value: expected};
        const resolvedDeps = {x: 1};

        const first = instantiator.instantiate(depId, namespace, resolvedDeps);
        const second = instantiator.instantiate(depId, namespace, resolvedDeps);

        assert.strictEqual(first, expected);
        assert.strictEqual(second, expected);
        assert.strictEqual(first, second);
        assert.deepStrictEqual(resolvedDeps, {x: 1});
    });

    it('invalid composition state throws', () => {
        const depId = createDepId({
            exportName: 'named',
            composition: /** @type {TeqFw_Di_DepId$DTO['composition']} */ ('unsupported'),
        });
        assert.throws(() => instantiator.instantiate(depId, {named: 1}, {}), Error);
    });

    it('does not pre-validate namespace shape and fails at point of use', () => {
        const depId = createDepId({
            exportName: 'named',
            composition: TeqFw_Di_Enum_Composition.AS_IS
        });
        assert.throws(() => instantiator.instantiate(depId, null, {}), TypeError);
        assert.throws(() => instantiator.instantiate(depId, 'bad', {}), TypeError);
    });
});
