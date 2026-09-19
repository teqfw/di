import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Lifecycle from '../../../src/Container/Lifecycle.mjs';
import TeqFw_Di_Enum_Composition from '../../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../../src/Enum/Life.mjs';

/**
 * @param {Partial<TeqFw_Di_Dto_DepId>} [patch]
 * @returns {TeqFw_Di_Dto_DepId}
 */
function createDepId(patch = {}) {
    return /** @type {TeqFw_Di_Dto_DepId} */ ({
        moduleName: 'App_Module',
        platform: 'teq',
        exportName: 'default',
        composition: TeqFw_Di_Enum_Composition.FACTORY,
        life: TeqFw_Di_Enum_Life.SINGLETON,
        wrappers: [],
        origin: 'unit-test',
        ...patch,
    });
}

describe('TeqFw_Di_Container_Lifecycle', () => {
    it('caches one final async singleton result and calls its miss corridor once', async () => {
        const registry = new TeqFw_Di_Container_Lifecycle();
        const depId = createDepId();
        let calls = 0;
        const onMiss = async () => ({id: ++calls, adapted: true, hardened: true});

        const first = await registry.apply(depId, onMiss);
        const second = await registry.apply(depId, onMiss);

        assert.equal(calls, 1);
        assert.strictEqual(first, second);
        assert.deepStrictEqual(first, {id: 1, adapted: true, hardened: true});
        assert.equal(registry.lookup(depId), 'hit');
    });

    it('shares an in-flight singleton miss corridor', async () => {
        const registry = new TeqFw_Di_Container_Lifecycle();
        const depId = createDepId();
        let calls = 0;
        const onMiss = async () => ({id: ++calls});

        const [first, second] = await Promise.all([
            registry.apply(depId, onMiss),
            registry.apply(depId, onMiss),
        ]);

        assert.equal(calls, 1);
        assert.strictEqual(first, second);
    });

    it('bypasses cache for Direct and Transient lifestyles', async () => {
        const registry = new TeqFw_Di_Container_Lifecycle();
        const direct = createDepId({
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        });
        const transient = createDepId({life: TeqFw_Di_Enum_Life.TRANSIENT});
        let calls = 0;
        const onMiss = () => ({id: ++calls});

        const directFirst = await registry.apply(direct, onMiss);
        const directSecond = await registry.apply(direct, onMiss);
        const transientFirst = await registry.apply(transient, onMiss);
        const transientSecond = await registry.apply(transient, onMiss);

        assert.equal(calls, 4);
        assert.notStrictEqual(directFirst, directSecond);
        assert.notStrictEqual(transientFirst, transientSecond);
        assert.equal(registry.lookup(direct), 'bypass');
        assert.equal(registry.lookup(transient), 'bypass');
    });

    it('uses export and ordered wrapper selection as independent singleton keys', async () => {
        const registry = new TeqFw_Di_Container_Lifecycle();
        const defaultExport = createDepId({wrappers: ['first', 'second']});
        const namedExport = createDepId({exportName: 'Factory', wrappers: ['first', 'second']});
        const reversedWrappers = createDepId({wrappers: ['second', 'first']});
        let calls = 0;
        const onMiss = () => ({id: ++calls});

        const a = await registry.apply(defaultExport, onMiss);
        const b = await registry.apply(namedExport, onMiss);
        const c = await registry.apply(reversedWrappers, onMiss);
        const repeated = await registry.apply(defaultExport, onMiss);

        assert.equal(calls, 3);
        assert.strictEqual(a, repeated);
        assert.notStrictEqual(a, b);
        assert.notStrictEqual(a, c);
    });
});
