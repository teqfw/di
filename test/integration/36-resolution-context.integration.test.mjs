import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../src/Dto/DepId.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');
const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();

/**
 * @param {TeqFw_Di_Container_ResolutionContext} context
 * @returns {string[]}
 */
function stackNames(context) {
    return context.stack.map((depId) => depId.moduleName);
}

describe('Integration 36: resolution context', () => {
    it('exposes immutable root-to-current context to preprocess and postprocess hooks', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        /** @type {{moduleName: string, stack: string[]}[]} */
        const preprocessCalls = [];
        /** @type {{moduleName: string, parent: string|null, stack: string[]}[]} */
        const postprocessCalls = [];

        container.addPreprocess((depId, context) => {
            assert.strictEqual(context.depId, depId);
            assert.strictEqual(context.stack.at(-1), depId);
            assert.ok(Object.isFrozen(context));
            assert.ok(Object.isFrozen(context.stack));
            preprocessCalls.push({moduleName: depId.moduleName, stack: stackNames(context)});
            return depId;
        });
        container.addPostprocess((value, context) => {
            postprocessCalls.push({
                moduleName: context.depId.moduleName,
                parent: context.parent?.moduleName ?? null,
                stack: stackNames(context),
            });
            return value;
        });

        const value = await container.get('Fx_ContextRoot$');

        assert.equal(value.left.name, 'left');
        assert.equal(value.right.name, 'right');
        assert.strictEqual(value.left.shared, value.right.shared);
        assert.deepStrictEqual(preprocessCalls, [
            {moduleName: 'Fx_ContextRoot', stack: ['Fx_ContextRoot']},
            {moduleName: 'Fx_ContextLeft', stack: ['Fx_ContextRoot', 'Fx_ContextLeft']},
            {moduleName: 'Fx_ContextShared', stack: ['Fx_ContextRoot', 'Fx_ContextLeft', 'Fx_ContextShared']},
            {moduleName: 'Fx_ContextRight', stack: ['Fx_ContextRoot', 'Fx_ContextRight']},
            {moduleName: 'Fx_ContextShared', stack: ['Fx_ContextRoot', 'Fx_ContextRight', 'Fx_ContextShared']},
        ]);
        assert.deepStrictEqual(postprocessCalls, [
            {moduleName: 'Fx_ContextShared', parent: 'Fx_ContextLeft', stack: ['Fx_ContextRoot', 'Fx_ContextLeft', 'Fx_ContextShared']},
            {moduleName: 'Fx_ContextLeft', parent: 'Fx_ContextRoot', stack: ['Fx_ContextRoot', 'Fx_ContextLeft']},
            {moduleName: 'Fx_ContextRight', parent: 'Fx_ContextRoot', stack: ['Fx_ContextRoot', 'Fx_ContextRight']},
            {moduleName: 'Fx_ContextRoot', parent: null, stack: ['Fx_ContextRoot']},
        ]);

        assert.equal(postprocessCalls.length, 4);
    });

    it('allows hooks to apply dependency policy from the parent position', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        /** @type {string[]} */
        const postprocessed = [];

        container.addPreprocess((depId, context) => {
            if ((depId.moduleName === 'Fx_ContextShared') && (context.parent?.moduleName === 'Fx_ContextRight')) {
                return depIdFactory.create({...depId, moduleName: 'Fx_ContextAlternativeShared'});
            }
            return depId;
        });
        container.addPostprocess((value, context) => {
            postprocessed.push(`${context.parent?.moduleName ?? 'root'}:${context.depId.moduleName}`);
            if ((context.depId.moduleName === 'Fx_ContextLeft') || (context.depId.moduleName === 'Fx_ContextRight')) {
                return {...(/** @type {object} */ (value)), postPosition: context.parent?.moduleName};
            }
            return value;
        });

        const value = await container.get('Fx_ContextRoot$');

        assert.equal(value.left.shared.name, 'shared');
        assert.equal(value.right.shared.name, 'alternative-shared');
        assert.equal(value.left.postPosition, 'Fx_ContextRoot');
        assert.equal(value.right.postPosition, 'Fx_ContextRoot');
        assert.deepStrictEqual(postprocessed, [
            'Fx_ContextLeft:Fx_ContextShared',
            'Fx_ContextRoot:Fx_ContextLeft',
            'Fx_ContextRight:Fx_ContextAlternativeShared',
            'Fx_ContextRoot:Fx_ContextRight',
            'root:Fx_ContextRoot',
        ]);
    });
});
