import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Enum_ResolutionStage from '../../../src/Enum/ResolutionStage.mjs';

describe('TeqFw_Di_Enum_ResolutionStage', () => {
    it('is a frozen closed vocabulary with stable stage values', () => {
        assert.equal(TeqFw_Di_Enum_ResolutionStage.ROUTE_SELECTION, 'route selection');
        assert.equal(TeqFw_Di_Enum_ResolutionStage.MODULE_LOADING, 'module loading');
        assert.equal(TeqFw_Di_Enum_ResolutionStage.VALUE_EXPOSURE, 'value exposure');
        assert.equal(Object.isFrozen(TeqFw_Di_Enum_ResolutionStage), true);
        assert.equal(new Set(Object.values(TeqFw_Di_Enum_ResolutionStage)).size, Object.keys(TeqFw_Di_Enum_ResolutionStage).length);
    });
});
