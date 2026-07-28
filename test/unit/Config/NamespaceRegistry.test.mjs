import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Config_NamespaceRegistry from '../../../src/Config/NamespaceRegistry.mjs';
import TeqFw_Di_Node_Registry_Namespace from '../../../src/Node/Registry/Namespace.mjs';

describe('TeqFw_Di_Config_NamespaceRegistry', () => {
    it('re-exports the Node.js registry as a deprecated compatibility entry point', () => {
        assert.equal(TeqFw_Di_Config_NamespaceRegistry, TeqFw_Di_Node_Registry_Namespace);
    });
});
