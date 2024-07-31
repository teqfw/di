/**
 * Default format for the objects:
 *  - Ns_Module: es6 module
 *  - Ns_Module$: default export, factory, singleton (the most frequently used case)
 *  - Ns_Module$$: default export, factory, instance
 *  - Ns_Module.default: default export, as-is, singleton
 *  - Ns_Module.name: named export, as-is, singleton
 *  - Ns_Module.name$: named export, factory, singleton (the most frequently used case)
 *  - Ns_Module.name$$: named export, factory, instance
 *  - Ns_Module$(proxy): default export, factory, singleton with one post wrapper
 *  - Ns_Module$(proxy,factory): default export, factory, singleton with two post wrappers
 */
import DefChunk from '../../../../../src/Container/A/Parser/Chunk/Def.js';
import {describe, it} from 'mocha';
import assert from 'assert';
import Defs from '../../../../../src/Defs.js';

describe('TeqFw_Di_Container_A_Parser_Chunk_Def', () => {

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
            it('factory, instance (Ns_Module$$)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module$$');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_I);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$$');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('default export, as-is, singleton (Ns_Module.)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module.');
                assert.strictEqual(dto.composition, Defs.COMP_A);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, singleton, wrapper (Ns_Module$(proxy))', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module$(proxy)');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$(proxy)');
                assert.strictEqual(dto.wrappers.length, 1);
            });
            it('factory, singleton, wrappers (Ns_Module$(proxy,factory))', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module$(proxy,factory)');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$(proxy,factory)');
                assert.strictEqual(dto.wrappers.length, 2);
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
            it('factory, instance (Ns_Module.name$$)', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module.name$$');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_I);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name$$');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, singleton.wrapper (Ns_Module.name$(proxy))', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module.name$(proxy)');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name$(proxy)');
                assert.strictEqual(dto.wrappers.length, 1);
            });
            it('factory, singleton.wrappers (Ns_Module.name$(proxy,factory))', () => {
                /** @type {TeqFw_Di_DepId} */
                const dto = chunk.parse('Ns_Module.name$(proxy,factory)');
                assert.strictEqual(dto.composition, Defs.COMP_F);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_S);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name$(proxy,factory)');
                assert.strictEqual(dto.wrappers.length, 2);
            });
        });
    });

});
