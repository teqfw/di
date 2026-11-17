import assert from 'node:assert/strict';
import {beforeEach, describe, it} from 'node:test';
import Container from '@teqfw/di';
import {effects, resetEffects} from './fixture/Policies.mjs';

const namespaces = [{prefix: 'Fx_', target: new URL('./fixture/', import.meta.url).href, defaultExt: '.mjs'}];
/** @param {TeqFw_Di_Container_ResolutionContext} context */
const stackNames = (context) => context.stack.map((depId) => depId.address);

describe('Integration 36: resolution context', () => {
    beforeEach(resetEffects);

    it('exposes immutable root-to-current context to DTO-selected hooks', async () => {
        const container = new Container({namespaces,
            preprocessors: ['Fx_Policies__RecordPreprocessing$'],
            postprocessors: ['Fx_Policies__RecordPostprocessing$'],
        });
        const value = await container.get('Fx_ContextRoot$');
        assert.equal(value.left.name, 'left');
        assert.equal(value.right.name, 'right');
        assert.strictEqual(value.left.shared, value.right.shared);
        for (const context of effects.preprocessing) {
            assert.strictEqual(context.stack.at(-1), context.depId);
            assert.ok(Object.isFrozen(context));
            assert.ok(Object.isFrozen(context.stack));
        }
        assert.deepEqual(effects.preprocessing.map((context) => ({address: context.depId.address, stack: stackNames(context)})), [
            {address: 'Fx_ContextRoot', stack: ['Fx_ContextRoot']},
            {address: 'Fx_ContextLeft', stack: ['Fx_ContextRoot', 'Fx_ContextLeft']},
            {address: 'Fx_ContextShared', stack: ['Fx_ContextRoot', 'Fx_ContextLeft', 'Fx_ContextShared']},
            {address: 'Fx_ContextRight', stack: ['Fx_ContextRoot', 'Fx_ContextRight']},
            {address: 'Fx_ContextShared', stack: ['Fx_ContextRoot', 'Fx_ContextRight', 'Fx_ContextShared']},
        ]);
        assert.deepEqual(effects.postprocessing.map((context) => ({address: context.depId.address, parent: context.parent?.address ?? null, stack: stackNames(context)})), [
            {address: 'Fx_ContextShared', parent: 'Fx_ContextLeft', stack: ['Fx_ContextRoot', 'Fx_ContextLeft', 'Fx_ContextShared']},
            {address: 'Fx_ContextLeft', parent: 'Fx_ContextRoot', stack: ['Fx_ContextRoot', 'Fx_ContextLeft']},
            {address: 'Fx_ContextRight', parent: 'Fx_ContextRoot', stack: ['Fx_ContextRoot', 'Fx_ContextRight']},
            {address: 'Fx_ContextRoot', parent: null, stack: ['Fx_ContextRoot']},
        ]);
    });

    it('allows DTO-selected hooks to apply policy from the parent position', async () => {
        const container = new Container({namespaces,
            preprocessors: ['Fx_Policies__SelectSharedByParent$'],
            postprocessors: ['Fx_Policies__AddParentPosition$'],
        });
        const value = await container.get('Fx_ContextRoot$');
        assert.equal(value.left.shared.name, 'shared');
        assert.equal(value.right.shared.name, 'alternative-shared');
        assert.equal(value.left.postPosition, 'Fx_ContextRoot');
        assert.equal(value.right.postPosition, 'Fx_ContextRoot');
        assert.deepEqual(effects.postprocessing.map((context) => `${context.parent?.address ?? 'root'}:${context.depId.address}`), [
            'Fx_ContextLeft:Fx_ContextShared', 'Fx_ContextRoot:Fx_ContextLeft',
            'Fx_ContextRight:Fx_ContextAlternativeShared', 'Fx_ContextRoot:Fx_ContextRight', 'root:Fx_ContextRoot',
        ]);
    });

    it('resets hook root provenance for each sequential entry', async () => {
        const container = new Container({namespaces, preprocessors: ['Fx_Policies__RecordPreprocessing$']});
        await container.get('Fx_Root$');
        await container.get('Fx_Singleton$');
        assert.deepEqual(effects.preprocessing.map((context) => `${context.root.address}:${context.depId.address}`), [
            'Fx_Root:Fx_Root', 'Fx_Singleton:Fx_Singleton',
        ]);
    });
});
