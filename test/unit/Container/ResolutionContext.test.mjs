import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../../src/Dto/DepId.mjs';
import {createResolutionContext} from '../../../src/Container/ResolutionContext.mjs';
import TeqFw_Di_Enum_AddressKind from '../../../src/Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../../../src/Enum/Lifestyle.mjs';

const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();

/**
 * @param {string} address
 * @returns {TeqFw_Di_Dto_DepId}
 */
function createDepId(address) {
    return depIdFactory.create({
        addressKind: TeqFw_Di_Enum_AddressKind.TEQ,
        address,
        lifestyle: TeqFw_Di_Enum_Lifestyle.DIRECT,
    });
}

describe('TeqFw_Di_Container_ResolutionContext', () => {
    it('creates an immutable root context', () => {
        const root = createDepId('App_Root');

        const context = createResolutionContext(root, []);

        assert.strictEqual(context.depId, root);
        assert.strictEqual(context.root, root);
        assert.equal(context.parent, null);
        assert.deepStrictEqual(context.stack, [root]);
        assert.ok(Object.isFrozen(context));
        assert.ok(Object.isFrozen(context.stack));
    });

    it('creates immutable nested provenance without retaining a mutable ancestors array', () => {
        const root = createDepId('App_Root');
        const parent = createDepId('App_Parent');
        const child = createDepId('App_Child');
        const ancestors = [root, parent];

        const context = createResolutionContext(child, ancestors);
        ancestors.pop();

        assert.strictEqual(context.root, root);
        assert.strictEqual(context.parent, parent);
        assert.deepStrictEqual(context.stack, [root, parent, child]);
        assert.ok(Object.isFrozen(context));
        assert.ok(Object.isFrozen(context.stack));
    });
});
