import assert from 'assert';
import Container from '../../src/Shared/Container.mjs';
import {describe, it} from 'mocha';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_ROOT = join(__dirname, '../.data/Container/proxy');

describe('TeqFw_Di_Shared_Container (proxy)', function () {

    const container = new Container();
    container.addSourceMapping('Test', DATA_ROOT, true);

    it('singleton (Test_Obj@)', async () => {
        /** @type {TeqFw_Di_Shared_Api_IFactory} */
        const factory = await container.get('Test_Obj@');
        /** @type {Test_Obj} */
        const snglt1 = await factory.create;
        assert(snglt1.name === 'test object');
        snglt1.name = 'update';
        /** @type {Test_Obj} */
        const snglt2 = await factory.create;
        assert(snglt2.name === 'update');
    });

    it('instances (Test_Obj@@)', async () => {
        /** @type {TeqFw_Di_Shared_Api_IFactory} */
        const factory = await container.get('Test_Obj@@');
        /** @type {Test_Obj} */
        const inst1 = await factory.create;
        assert(inst1.name === 'test object');
        inst1.name = 'update';
        /** @type {Test_Obj} */
        const inst2 = await factory.create;
        assert(inst2.name === 'test object');
    });
});
