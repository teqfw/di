import parser from '../../src/DepId/Parser.mjs';

import {describe, it} from 'mocha';
import assert from 'assert';

describe('DepId.Parser', () => {

    describe('should parse IDs with named adapter:', () => {
        it('Vendor_App_Mod.export$$#adapter', async () => {
            const dto = parser('Vendor_App_Mod.export$$#adapter');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, true);
            assert.strictEqual(dto.isSingleton, false);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'adapter');
        });
        it('Vendor_App_Mod.export$#adapter', async () => {
            const dto = parser('Vendor_App_Mod.export$#adapter');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, true);
            assert.strictEqual(dto.isSingleton, true);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'adapter');
        });
        it('Vendor_App_Mod.export#adapter', async () => {
            const dto = parser('Vendor_App_Mod.export#adapter');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, false);
            assert.strictEqual(dto.isSingleton, undefined);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'adapter');
        });
        it('Vendor_App_Mod#adapter', async () => {
            const dto = parser('Vendor_App_Mod#adapter');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, false);
            assert.strictEqual(dto.isSingleton, undefined);
            assert.strictEqual(dto.nameExport, 'default');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'adapter');
        });
    });

    describe('should parse IDs with default adapter:', () => {
        it('Vendor_App_Mod.export$$#', async () => {
            const dto = parser('Vendor_App_Mod.export$$#');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, true);
            assert.strictEqual(dto.isSingleton, false);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'default');
        });
        it('Vendor_App_Mod.export$#', async () => {
            const dto = parser('Vendor_App_Mod.export$#');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, true);
            assert.strictEqual(dto.isSingleton, true);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'default');
        });
        it('Vendor_App_Mod.export#', async () => {
            const dto = parser('Vendor_App_Mod.export#');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, false);
            assert.strictEqual(dto.isSingleton, undefined);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'default');
        });
        it('Vendor_App_Mod#', async () => {
            const dto = parser('Vendor_App_Mod#');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, false);
            assert.strictEqual(dto.isSingleton, undefined);
            assert.strictEqual(dto.nameExport, 'default');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, 'default');
        });
    });

    describe('should parse IDs up to life type:', () => {
        it('Vendor_App_Mod.export$$', async () => {
            const dto = parser('Vendor_App_Mod.export$$');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, true);
            assert.strictEqual(dto.isSingleton, false);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, undefined);
        });
        it('Vendor_App_Mod.export$', async () => {
            const dto = parser('Vendor_App_Mod.export$');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, true);
            assert.strictEqual(dto.isSingleton, true);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, undefined);
        });
        it('Vendor_App_Mod$$', async () => {
            const dto = parser('Vendor_App_Mod$$');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, true);
            assert.strictEqual(dto.isSingleton, false);
            assert.strictEqual(dto.nameExport, 'default');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, undefined);
        });
    });

    describe('should parse IDs up to export:', () => {
        it('Vendor_App_Mod.export', async () => {
            const dto = parser('Vendor_App_Mod.export');
            assert.strictEqual(dto.isExport, true);
            assert.strictEqual(dto.isFactory, false);
            assert.strictEqual(dto.isSingleton, undefined);
            assert.strictEqual(dto.nameExport, 'export');
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, undefined);
        });
        it('Vendor_App_Mod', async () => {
            const dto = parser('Vendor_App_Mod');
            assert.strictEqual(dto.isExport, false);
            assert.strictEqual(dto.isFactory, false);
            assert.strictEqual(dto.isSingleton, undefined);
            assert.strictEqual(dto.nameExport, undefined);
            assert.strictEqual(dto.nameModule, 'Vendor_App_Mod');
            assert.strictEqual(dto.adapter, undefined);
        });
    });

});
