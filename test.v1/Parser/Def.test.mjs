/**
 * Default format for the objects:
 *  - Ns_App: default export, as-is, singleton
 *  - Ns_App$: default export, factory, singleton (the most frequently used case)
 *  - NS_App$I: default export, factory, instance
 *  - Ns_App.name: named export, as-is, singleton
 *  - Ns_App.name$: named export, factory, singleton (the most frequently used case)
 *  - NS_App.name$I: named export, factory, instance
 */
import parse from '../../src/Parser/Def.js';
import {describe, it} from 'mocha';
import assert from 'assert';
import Defs from '../../src/Defs.js';

describe('TeqFw_Di_Parser_Def', () => {

    describe('should parse:', () => {

        describe('default export:', () => {
            it('as-is, singleton (Ns_Module)', () => {
                /** @type {TeqFw_Di_Api_ObjectKey} */
                const dto = parse('Ns_Module');
                assert.strictEqual(dto.composition, Defs.COMPOSE_AS_IS);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_SINGLETON);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, singleton (Ns_Module$)', () => {
                /** @type {TeqFw_Di_Api_ObjectKey} */
                const dto = parse('Ns_Module$');
                assert.strictEqual(dto.composition, Defs.COMPOSE_FACTORY);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_SINGLETON);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, instance (Ns_Module$I)', () => {
                /** @type {TeqFw_Di_Api_ObjectKey} */
                const dto = parse('Ns_Module$I');
                assert.strictEqual(dto.composition, Defs.COMPOSE_FACTORY);
                assert.strictEqual(dto.exportName, 'default');
                assert.strictEqual(dto.life, Defs.LIFE_INSTANCE);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module$I');
                assert.strictEqual(dto.wrappers.length, 0);
            });
        });

        describe('named export:', () => {
            it('as-is, singleton (Ns_Module.name)', () => {
                /** @type {TeqFw_Di_Api_ObjectKey} */
                const dto = parse('Ns_Module.name');
                assert.strictEqual(dto.composition, Defs.COMPOSE_AS_IS);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_SINGLETON);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, singleton (Ns_Module.name$)', () => {
                /** @type {TeqFw_Di_Api_ObjectKey} */
                const dto = parse('Ns_Module.name$');
                assert.strictEqual(dto.composition, Defs.COMPOSE_FACTORY);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_SINGLETON);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name$');
                assert.strictEqual(dto.wrappers.length, 0);
            });
            it('factory, instance (Ns_Module.name$I)', () => {
                /** @type {TeqFw_Di_Api_ObjectKey} */
                const dto = parse('Ns_Module.name$I');
                assert.strictEqual(dto.composition, Defs.COMPOSE_FACTORY);
                assert.strictEqual(dto.exportName, 'name');
                assert.strictEqual(dto.life, Defs.LIFE_INSTANCE);
                assert.strictEqual(dto.moduleName, 'Ns_Module');
                assert.strictEqual(dto.value, 'Ns_Module.name$I');
                assert.strictEqual(dto.wrappers.length, 0);
            });
        });
    });

});