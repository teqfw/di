/**
 * Default format for the objects:
 *  - Ns_Module: es6 module
 *  - Ns_Module$: default export, factory, singleton (the most frequently used case)
 *  - Ns_Module$I: default export, factory, instance
 *  - Ns_Module$AS: default export, as-is, singleton
 *  - Ns_Module.name: named export, as-is, singleton
 *  - Ns_Module.name$: named export, factory, singleton (the most frequently used case)
 *  - Ns_Module.name$I: named export, factory, instance
 */
import DefChunk from '../../../../../src/Container/A/Parser/Chunk/V23.js';
import {describe, it} from 'mocha';
import assert from 'assert';
import Defs from '../../../../../src/Defs.js';

describe('TeqFw_Di_Container_A_Parser_Chunk_V23', () => {

    const chunk = new DefChunk();

    describe('should parse:', () => {

        describe('default export:', () => {
            it('es6 module (Ns_Module)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module');
                assert.strictEqual(dto.composition, undefined);
                assert.strictEqual(dto.exportName, undefined);
                assert.strictEqual(dto.life, undefined);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, singleton (Ns_Module$)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module$');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, instance (Ns_Module$I)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module$I');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_I);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$I');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('default export, as-is, singleton (Ns_Module$AS)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module$AS');
                assert.strictEqual(dto.composition, Defs.COMP_A);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$AS');
                assert.strictEqual(dto.wrappers.length, 0);
            });
        });

        describe('named export:', () => {
            it('as-is, singleton (Ns_Module.name)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module.name');
                assert.strictEqual(dto.composition, Defs.COMP_A);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, singleton (Ns_Module.name$)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module.name$');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name$');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, instance (Ns_Module.name$I)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module.name$I');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_I);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name$I');
                assert.strictEqual(dto.wrappers.length, 0);
            });
        });
    });

});
