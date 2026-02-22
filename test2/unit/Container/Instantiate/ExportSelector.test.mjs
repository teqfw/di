import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Instantiate_ExportSelector from '../../../../src2/Container/Instantiate/ExportSelector.mjs';

function createDepId(exportName) {
    return /** @type {TeqFw_Di_DepId$DTO} */ ({
        moduleName: 'Ns_App_Module',
        platform: 'teq',
        exportName,
        composition: 'A',
        life: null,
        wrappers: [],
        origin: 'unit-test',
    });
}

describe('TeqFw_Di_Container_Instantiate_ExportSelector', () => {
    const selector = new TeqFw_Di_Container_Instantiate_ExportSelector();

    it('selects default export', () => {
        const expected = {kind: 'default'};
        const namespace = {default: expected, named: 123};
        const result = selector.select(namespace, createDepId('default'));
        assert.strictEqual(result, expected);
    });

    it('selects named export', () => {
        const expected = () => 'named';
        const namespace = {namedFactory: expected};
        const result = selector.select(namespace, createDepId('namedFactory'));
        assert.strictEqual(result, expected);
    });

    it('throws if export is missing in namespace', () => {
        const namespace = {present: 1};
        assert.throws(() => selector.select(namespace, createDepId('missing')), Error);
    });

    it('throws if namespace is not object', () => {
        assert.throws(() => selector.select(null, createDepId('default')), Error);
        assert.throws(() => selector.select('not-object', createDepId('default')), Error);
    });

    it('throws if exportName is null', () => {
        const namespace = {default: 1};
        assert.throws(() => selector.select(namespace, createDepId(null)), Error);
    });

    it('is deterministic for repeated calls', () => {
        const expected = {stable: true};
        const namespace = {default: expected};
        const depId = createDepId('default');
        const first = selector.select(namespace, depId);
        const second = selector.select(namespace, depId);
        assert.strictEqual(first, expected);
        assert.strictEqual(second, expected);
        assert.strictEqual(first, second);
    });
});
