import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {Factory} from '../../../../src/Dto/Container/Config.mjs';

describe('TeqFw_Di_Dto_Container_Config', () => {
    it('creates an immutable JSON-safe policy snapshot', () => {
        const source = {
            namespaces: [{prefix: 'App_', target: 'https://example.test/app', defaultExt: '.mjs'}],
            preprocessors: ['App_Policy_Preprocessor$'],
            postprocessors: ['App_Policy_Postprocessor$'],
            hardener: 'App_Policy_Hardener$',
            logging: true,
            introspection: true,
            mocks: [{specifier: 'App_Test$', value: {kind: 'mock'}}],
        };
        const config = new Factory().create(JSON.parse(JSON.stringify(source)));

        assert.deepStrictEqual(JSON.parse(JSON.stringify(config)), source);
        assert.ok(Object.isFrozen(config));
        assert.ok(Object.isFrozen(config.namespaces));
        assert.ok(Object.isFrozen(config.preprocessors));
        assert.ok(Object.isFrozen(config.postprocessors));
        assert.ok(Object.isFrozen(config.mocks));
        assert.ok(Object.isFrozen(config.mocks[0]));
    });
});
