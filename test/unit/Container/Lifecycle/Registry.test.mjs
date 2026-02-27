import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Lifecycle_Registry from '../../../../src/Container/Lifecycle/Registry.mjs';
import TeqFw_Di_Enum_Composition from '../../../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../../../src/Enum/Life.mjs';

/**
 * @param {Partial<TeqFw_Di_DepId$DTO>} [patch]
 * @returns {TeqFw_Di_DepId$DTO}
 */
function createDepId(patch = {}) {
    return /** @type {TeqFw_Di_DepId$DTO} */ ({
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

describe('TeqFw_Di_Container_Lifecycle_Registry', () => {
    it('singleton reuse: returns same value and calls producer once', () => {
        const registry = new TeqFw_Di_Container_Lifecycle_Registry();
        const depId = createDepId({
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        let calls = 0;
        const producer = () => ({id: ++calls});

        const first = registry.apply(depId, producer);
        const second = registry.apply(depId, producer);

        assert.equal(calls, 1);
        assert.strictEqual(first, second);
    });

    it('transient passthrough: produces new value for each call', () => {
        const registry = new TeqFw_Di_Container_Lifecycle_Registry();
        const depId = createDepId({
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
        });
        let calls = 0;
        const producer = () => ({id: ++calls});

        const first = registry.apply(depId, producer);
        const second = registry.apply(depId, producer);

        assert.equal(calls, 2);
        assert.notStrictEqual(first, second);
    });

    it('independent keys: different depIds have independent singleton cache entries', () => {
        const registry = new TeqFw_Di_Container_Lifecycle_Registry();
        const depA = createDepId({moduleName: 'App_A'});
        const depB = createDepId({moduleName: 'App_B'});
        let calls = 0;
        const producer = () => ({id: ++calls});

        const a1 = registry.apply(depA, producer);
        const b1 = registry.apply(depB, producer);
        const a2 = registry.apply(depA, producer);
        const b2 = registry.apply(depB, producer);

        assert.equal(calls, 2);
        assert.strictEqual(a1, a2);
        assert.strictEqual(b1, b2);
        assert.notStrictEqual(a1, b1);
    });

    it('no effect on AS_IS composition: does not cache even with singleton life marker', () => {
        const registry = new TeqFw_Di_Container_Lifecycle_Registry();
        const depId = createDepId({
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        let calls = 0;
        const producer = () => ({id: ++calls});

        const first = registry.apply(depId, producer);
        const second = registry.apply(depId, producer);

        assert.equal(calls, 2);
        assert.notStrictEqual(first, second);
    });
});
