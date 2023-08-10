import parser from '../../di/Parser.js';

import {describe, it} from 'mocha';
import assert from 'assert';

describe('Parser should parse', () => {

    it('package.Module?export=name&inst', async () => {
        const dto = parser('package.Module?export=name&inst');
        assert.strictEqual(dto.exportName, 'name');
        assert.strictEqual(dto.isFactory, true);
        assert.strictEqual(dto.isSingleton, false);
        assert.strictEqual(dto.moduleName, 'package.Module');
    });

    it('package.Module?inst', async () => {
        const dto = parser('package.Module?inst');
        assert.strictEqual(dto.exportName, 'default');
        assert.strictEqual(dto.isFactory, true);
        assert.strictEqual(dto.isSingleton, false);
        assert.strictEqual(dto.moduleName, 'package.Module');
    });

    it('package.Module?mod', async () => {
        const dto = parser('package.Module?mod');
        assert.strictEqual(dto.exportName, undefined);
        assert.strictEqual(dto.isFactory, undefined);
        assert.strictEqual(dto.isSingleton, undefined);
        assert.strictEqual(dto.moduleName, 'package.Module');
    });

    it('package.Module', async () => {
        const dto = parser('package.Module');
        assert.strictEqual(dto.exportName, 'default');
        assert.strictEqual(dto.isFactory, true);
        assert.strictEqual(dto.isSingleton, true);
        assert.strictEqual(dto.moduleName, 'package.Module');
    });
});
