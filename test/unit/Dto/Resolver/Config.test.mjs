import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import LegacyDTO, {Factory as LegacyFactory} from '../../../../src/Dto/Resolver/Config.mjs';
import CanonicalDTO, {Factory as CanonicalFactory} from '../../../../src/Dto/ModuleRouter/Config.mjs';

describe('Deprecated ModuleRouter configuration type-map path', () => {
    it('re-exports the canonical DTO and factory without another implementation', () => {
        assert.strictEqual(LegacyDTO, CanonicalDTO);
        assert.strictEqual(LegacyFactory, CanonicalFactory);
    });
});
